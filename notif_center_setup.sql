-- Central de notificações do aluno (rodar uma vez, no projeto isrvmwebubjcvzxkorpf: inglês e espanhol usam o mesmo projeto).
-- Avisos automáticos (pagamento atrasado, reposição, prova liberada, crédito de indicação) somem sozinhos quando o motivo acaba.
-- Avisos do professor (modelos, agendamento, validade) ficam em notices e viram linhas em notifications na hora de enviar.

create table if not exists public.notifications(
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,                 -- pay | makeup | exam | credit | msg | promo
  ref text,                           -- chave para não repetir o mesmo aviso automático
  title text,                         -- só nos avisos do professor (texto livre)
  body text,
  url text,
  crit boolean not null default false,
  info jsonb not null default '{}'::jsonb,
  notice_id bigint,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  resolved_at timestamptz);
create unique index if not exists notifications_ref_u on public.notifications(user_id,kind,ref) where ref is not null;
create index if not exists notifications_user on public.notifications(user_id,created_at desc);
create index if not exists notifications_notice on public.notifications(notice_id);
alter table public.notifications enable row level security;
drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications for select to authenticated
  using (user_id=auth.uid() and resolved_at is null and (expires_at is null or expires_at>now()));
revoke all on public.notifications from anon;
revoke insert,update,delete on public.notifications from authenticated;

create table if not exists public.notices(
  id bigint generated always as identity primary key,
  tpl text not null default 'free',   -- free | makeup | exam | promo
  user_id uuid references public.profiles(id) on delete cascade,  -- null = todos os alunos
  title text,
  body text not null,
  send_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  delivered_at timestamptz);
alter table public.notices enable row level security;
drop policy if exists notices_admin on public.notices;
create policy notices_admin on public.notices for all to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.notices from anon;

-- Entrega um aviso do professor: cria as linhas dos alunos e, entre 9h e 19h, também o push (student_msgs)
create or replace function public.notice_deliver(p_id bigint)
returns void language plpgsql security definer set search_path=public as $$
declare n notices; h int := extract(hour from (now() at time zone 'America/Sao_Paulo'));
begin
  select * into n from notices where id=p_id and delivered_at is null for update;
  if not found then return; end if;
  insert into notifications(user_id,kind,title,body,url,notice_id,expires_at)
  select p.id, case when n.tpl='promo' then 'promo' else 'msg' end, n.title, n.body, null, n.id, n.expires_at
  from profiles p
  where not coalesce(p.is_admin,false) and p.status='approved' and (n.user_id is null or p.id=n.user_id);
  if h>=9 and h<19 then
    insert into student_msgs(user_id,body,url)
    select p.id, coalesce(nullif(n.title,''),'Britland Academy')||': '||n.body, '/app/'
    from profiles p
    where not coalesce(p.is_admin,false) and p.status='approved' and (n.user_id is null or p.id=n.user_id);
  end if;
  update notices set delivered_at=now() where id=p_id;
end $$;
revoke all on function public.notice_deliver(bigint) from public, anon, authenticated;
grant execute on function public.notice_deliver(bigint) to service_role;

create or replace function public.notice_send(p_user uuid, p_tpl text, p_title text, p_body text, p_send_at timestamptz default null, p_expires date default null)
returns bigint language plpgsql security definer set search_path=public as $$
declare i bigint;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  if coalesce(trim(p_body),'')='' then raise exception 'empty'; end if;
  insert into notices(tpl,user_id,title,body,send_at,expires_at)
  values(coalesce(p_tpl,'free'),p_user,nullif(trim(p_title),''),trim(p_body),coalesce(p_send_at,now()),
         case when p_expires is null then null else ((p_expires+1)::timestamp at time zone 'America/Sao_Paulo') end)
  returning id into i;
  if (select send_at from notices where id=i)<=now() then perform public.notice_deliver(i); end if;
  return i;
end $$;
revoke all on function public.notice_send(uuid,text,text,text,timestamptz,date) from public, anon;
grant execute on function public.notice_send(uuid,text,text,text,timestamptz,date) to authenticated;

create or replace function public.notice_list()
returns table(id bigint, tpl text, title text, body text, who text, send_at timestamptz, expires_at timestamptz, delivered boolean, total bigint, read bigint)
language plpgsql security definer stable set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return query
  select n.id,n.tpl,n.title,n.body, case when n.user_id is null then 'Todos' else coalesce(nullif(split_part(trim(coalesce(p.name,'')),' ',1),''),'Aluno') end, n.send_at,n.expires_at,(n.delivered_at is not null),
         (select count(*) from notifications x where x.notice_id=n.id),
         (select count(*) from notifications x where x.notice_id=n.id and x.read_at is not null)
  from notices n left join profiles p on p.id=n.user_id
  order by n.send_at desc limit 60;
end $$;
revoke all on function public.notice_list() from public, anon;
grant execute on function public.notice_list() to authenticated;

create or replace function public.notice_delete(p_id bigint)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  delete from notifications where notice_id=p_id;
  delete from notices where id=p_id;
end $$;
revoke all on function public.notice_delete(bigint) from public, anon;
grant execute on function public.notice_delete(bigint) to authenticated;

-- Avisos automáticos de um aluno; apagam sozinhos quando o motivo acaba
create or replace function public.notif_sync_user(p_uid uuid)
returns void language plpgsql security definer set search_path=public as $$
declare d date := (now() at time zone 'America/Sao_Paulo')::date; n int; es boolean;
begin
  select coalesce(course,'en')='es' into es from profiles where id=p_uid;
  insert into notifications(user_id,kind,ref,crit,url,info)
  select p_uid,'pay',c.id::text,true,'account.html#pay',jsonb_build_object('due',c.due_date,'amount',c.amount,'cur',c.currency)
  from charges c join subs b on b.id=c.sub_id
  where b.user_id=p_uid and coalesce(b.active,true) and c.paid_on is null and c.due_date<d
  on conflict do nothing;
  update notifications x set resolved_at=now()
  where x.user_id=p_uid and x.kind='pay' and x.resolved_at is null
    and not exists(select 1 from charges c where c.id::text=x.ref and c.paid_on is null);

  select count(*) into n from class_credits where user_id=p_uid and made_up_at is null;
  if n>0 then
    insert into notifications(user_id,kind,ref,url,info) values(p_uid,'makeup','cur','agenda.html',jsonb_build_object('n',n))
    on conflict(user_id,kind,ref) where ref is not null do update set info=jsonb_build_object('n',n), resolved_at=null, read_at=case when (notifications.info->>'n')::int=n then notifications.read_at else null end;
  else
    update notifications set resolved_at=now() where user_id=p_uid and kind='makeup' and resolved_at is null;
  end if;

  -- prova liberada nos últimos 30 dias e ainda não entregue (alunos de espanhol: schema es)
  if es then
    insert into notifications(user_id,kind,ref,url,info)
    select p_uid,'exam',r.stage::text,'exam.html?stage='||r.stage,jsonb_build_object('stage',r.stage)
    from es.exam_release r
    where r.user_id=p_uid and r.released_at>now()-interval '30 days'
      and not exists(select 1 from es.exam_results e where e.user_id=p_uid and e.stage=r.stage and e.submitted_at is not null)
    on conflict do nothing;
    update notifications x set resolved_at=now()
    where x.user_id=p_uid and x.kind='exam' and x.resolved_at is null
      and (not exists(select 1 from es.exam_release r where r.user_id=p_uid and r.stage::text=x.ref and r.released_at>now()-interval '30 days')
        or exists(select 1 from es.exam_results e where e.user_id=p_uid and e.stage::text=x.ref and e.submitted_at is not null));
  else
    insert into notifications(user_id,kind,ref,url,info)
    select p_uid,'exam',r.stage::text,'exam.html?stage='||r.stage,jsonb_build_object('stage',r.stage)
    from exam_release r
    where r.user_id=p_uid and r.released_at>now()-interval '30 days'
      and not exists(select 1 from exam_results e where e.user_id=p_uid and e.stage=r.stage and e.submitted_at is not null)
    on conflict do nothing;
    update notifications x set resolved_at=now()
    where x.user_id=p_uid and x.kind='exam' and x.resolved_at is null
      and (not exists(select 1 from exam_release r where r.user_id=p_uid and r.stage::text=x.ref and r.released_at>now()-interval '30 days')
        or exists(select 1 from exam_results e where e.user_id=p_uid and e.stage::text=x.ref and e.submitted_at is not null));
  end if;

  insert into notifications(user_id,kind,ref,url,info)
  select p_uid,'credit',c.id::text,'account.html#pay',jsonb_build_object('amount',c.amount-c.used,'cur',c.currency)
  from promo_credits c where c.user_id=p_uid and c.used<c.amount and (c.expires_at is null or c.expires_at>now())
  on conflict do nothing;
  update notifications x set resolved_at=now()
  where x.user_id=p_uid and x.kind='credit' and x.resolved_at is null
    and not exists(select 1 from promo_credits c where c.id::text=x.ref and c.used<c.amount and (c.expires_at is null or c.expires_at>now()));
end $$;
revoke all on function public.notif_sync_user(uuid) from public, anon, authenticated;
grant execute on function public.notif_sync_user(uuid) to service_role;

create or replace function public.notif_sync_me()
returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then return; end if;
  perform public.notif_sync_user(auth.uid());
end $$;
revoke all on function public.notif_sync_me() from public, anon;
grant execute on function public.notif_sync_me() to authenticated;

create or replace function public.notif_mark_read(p_ids bigint[] default null)
returns void language sql security definer set search_path=public as $$
  update notifications set read_at=now()
  where user_id=auth.uid() and read_at is null and (p_ids is null or id=any(p_ids));
$$;
revoke all on function public.notif_mark_read(bigint[]) from public, anon;
grant execute on function public.notif_mark_read(bigint[]) to authenticated;

-- Cron: entrega avisos agendados (a cada 5 min) e atualiza os automáticos (a cada 30 min)
create or replace function public.notif_cron()
returns void language plpgsql security definer set search_path=public as $$
declare r record;
begin
  for r in select id from notices where delivered_at is null and send_at<=now() loop
    perform public.notice_deliver(r.id);
  end loop;
end $$;
revoke all on function public.notif_cron() from public, anon, authenticated;
select cron.unschedule('notif-deliver') where exists(select 1 from cron.job where jobname='notif-deliver');
select cron.schedule('notif-deliver','*/5 * * * *','select public.notif_cron()');

-- App em espanhol (schema es no mesmo projeto): a tabela entra como view e as funções como atalhos
create or replace view es.notifications with (security_invoker=true) as select * from public.notifications;
grant select on es.notifications to authenticated;
revoke all on es.notifications from anon;
create or replace function es.notif_sync_me() returns void language sql security invoker set search_path=public as $$ select public.notif_sync_me(); $$;
create or replace function es.notif_mark_read(p_ids bigint[] default null) returns void language sql security invoker set search_path=public as $$ select public.notif_mark_read(p_ids); $$;
revoke all on function es.notif_sync_me() from public, anon;
revoke all on function es.notif_mark_read(bigint[]) from public, anon;
grant execute on function es.notif_sync_me() to authenticated;
grant execute on function es.notif_mark_read(bigint[]) to authenticated;

-- Todo push enviado ao aluno também entra na lista
alter table public.student_msgs add column if not exists skip_list boolean not null default false;
-- (notice_deliver passa a gravar student_msgs com skip_list=true, para o aviso do professor não aparecer duas vezes)

create or replace function public.trg_msg_to_list()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  begin
    if not new.skip_list and not exists(select 1 from profiles where id=new.user_id and coalesce(is_admin,false)) then
      insert into notifications(user_id,kind,body,url,expires_at) values(new.user_id,'msg',new.body,new.url,now()+interval '14 days');
    end if;
  exception when others then null;
  end;
  return new;
end $$;
drop trigger if exists student_msgs_to_list on public.student_msgs;
create trigger student_msgs_to_list after insert on public.student_msgs for each row execute function public.trg_msg_to_list();

create or replace function public.trg_log_to_list()
returns trigger language plpgsql security definer set search_path=public as $$
declare at_ timestamptz; n int;
begin
  begin
    if new.kind not in ('lessonday','lesson1h','newlesson','streak','idle','pay','rank','grade','birthday') then return new; end if;
    if exists(select 1 from profiles where id=new.user_id and coalesce(is_admin,false)) then return new; end if;
    if new.kind in ('lessonday','lesson1h') then select start_at into at_ from lessons where id::text=new.ref; end if;
    if new.kind='streak' then select c.cur into n from streak_calc(new.user_id) c; end if;
    insert into notifications(user_id,kind,ref,info,expires_at)
    values(new.user_id,'push',new.kind||':'||coalesce(new.ref,''),jsonb_build_object('k',new.kind,'ref',new.ref,'at',at_,'n',n),
           case when new.kind='lesson1h' then now()+interval '1 day' else now()+interval '4 days' end)
    on conflict do nothing;
  exception when others then null;
  end;
  return new;
end $$;
drop trigger if exists notif_log_to_list on public.notif_log;
create trigger notif_log_to_list after insert on public.notif_log for each row execute function public.trg_log_to_list();
