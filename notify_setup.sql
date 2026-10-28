-- Notificações novas (rodar uma vez em cada projeto: inglês e espanhol).
-- Padrão do que já existe: push_subs, notif_log, teacher_events, take_teacher_events, due_reminders (setup.sql de push).

-- 1) Mensagens avulsas para alunos (gravadas pelas funções gcal-book e gcal-sync; enviadas pela super-processor)
create table if not exists public.student_msgs(
  id bigint generated always as identity primary key,
  user_id uuid not null,
  body text not null,
  url text not null default '/app/',
  created_at timestamptz not null default now(),
  sent boolean not null default false);
alter table public.student_msgs enable row level security;

create or replace function public.take_student_msgs()
returns table(mid bigint, mbody text, murl text, endpoint text, p256dh text, auth text)
language plpgsql security definer set search_path=public as $$
begin
  return query
  with e as (update student_msgs m set sent=true where not m.sent and m.created_at>now()-interval '1 day' returning m.id, m.user_id, m.body, m.url)
  select e.id, e.body, e.url, s.endpoint, s.p256dh, s.auth from e join push_subs s on s.user_id=e.user_id;
end $$;
revoke all on function public.take_student_msgs() from public, anon, authenticated;
grant execute on function public.take_student_msgs() to service_role;

-- 2) Avisos programados para alunos: aula em 1 h, aula amanhã, aniversário, sequência em risco, lição nova
create or replace function public.due_student_events()
returns table(user_id uuid, kind text, ref text, first_name text, info text, endpoint text, p256dh text, auth text)
language plpgsql security definer set search_path=public as $$
declare t timestamp := now() at time zone 'America/Sao_Paulo'; d date := (now() at time zone 'America/Sao_Paulo')::date; h int := extract(hour from (now() at time zone 'America/Sao_Paulo'));
  wd text[] := array['dom','seg','ter','qua','qui','sex','sáb'];
begin
  return query
  with stu as (
    select p.id uid, split_part(trim(coalesce(p.name,'')),' ',1) fn, p.birthdate bd, p.lessons_upto lu
    from profiles p where coalesce(p.is_admin,false)=false and p.status='approved'
      and exists(select 1 from push_subs s where s.user_id=p.id)),
  due as (
    select s.uid u, 'lesson1h'::text k, l.id r, s.fn f,
           wd[extract(dow from (l.start_at at time zone 'America/Sao_Paulo'))::int+1]||' '||to_char(l.start_at at time zone 'America/Sao_Paulo','HH24:MI') i
      from stu s join lessons l on l.user_id=s.uid
      where l.start_at between now()+interval '45 minutes' and now()+interval '75 minutes'
    union all
    select s.uid, 'lessonday', l.id, s.fn, to_char(l.start_at at time zone 'America/Sao_Paulo','HH24:MI')
      from stu s join lessons l on l.user_id=s.uid
      where h>=18 and h<21 and (l.start_at at time zone 'America/Sao_Paulo')::date = d+1
    union all
    select s.uid, 'birthday', extract(year from d)::text, s.fn, ''
      from stu s where h>=9 and h<19 and s.bd is not null and to_char(s.bd,'MM-DD')=to_char(d,'MM-DD')
    union all
    select s.uid, 'streak', d::text, s.fn, c.cur::text
      from stu s cross join lateral streak_calc(s.uid) c
      where h>=19 and h<22 and c.cur>=3 and not exists(select 1 from activity a where a.user_id=s.uid and a.day=d)
    union all
    select s.uid, 'newlesson', s.lu::text, s.fn, s.lu::text
      from stu s where h>=9 and h<21 and coalesce(s.lu,0)>=1)
  select due.u, due.k, due.r, due.f, due.i, ps.endpoint, ps.p256dh, ps.auth
  from due join push_subs ps on ps.user_id=due.u
  where not exists(select 1 from notif_log l where l.user_id=due.u and l.kind=due.k and l.ref=due.r);
end $$;
revoke all on function public.due_student_events() from public, anon, authenticated;
grant execute on function public.due_student_events() to service_role;

-- "lição nova": registra a situação de hoje para ninguém receber aviso do que já estava liberado
insert into notif_log(user_id,kind,ref)
select p.id,'newlesson',p.lessons_upto::text from profiles p
where coalesce(p.is_admin,false)=false and coalesce(p.lessons_upto,0)>=1
  and not exists(select 1 from notif_log l where l.user_id=p.id and l.kind='newlesson' and l.ref=p.lessons_upto::text);

-- 3) Avisos para o professor gerados por horário: aluno parado há 5+ dias, pagamento vencido
create or replace function public.gen_teacher_events()
returns void language plpgsql security definer set search_path=public as $$
declare t timestamp := now() at time zone 'America/Sao_Paulo'; d date := (now() at time zone 'America/Sao_Paulo')::date; h int := extract(hour from (now() at time zone 'America/Sao_Paulo'));
begin
  if h<9 or h>=19 then return; end if;
  with i as (
    select p.id uid, split_part(trim(coalesce(p.name,'')),' ',1) fn,
           (d - coalesce((select max(a.day) from activity a where a.user_id=p.id), p.created_at::date)) dd
    from profiles p where p.status='approved' and not coalesce(p.is_admin,false)),
  ins as (
    insert into notif_log(user_id,kind,ref)
    select i.uid,'tidle',d::text from i
    where i.dd>=5 and not exists(select 1 from notif_log l where l.user_id=i.uid and l.kind='tidle' and l.sent_at>now()-interval '3 days')
    returning user_id)
  insert into teacher_events(student_id,kind,label)
  select i.uid,'msg', i.fn||' está há '||i.dd||' dias sem estudar' from i join ins on ins.user_id=i.uid;

  with o as (
    select c.id cid, b.user_id uid, split_part(trim(coalesce(p.name,'')),' ',1) fn, (d-c.due_date) dd
    from charges c join subs b on b.id=c.sub_id join profiles p on p.id=b.user_id
    where c.paid_on is null and c.due_date<d and c.due_date>=d-7 and coalesce(b.active,true)),
  ins as (
    insert into notif_log(user_id,kind,ref)
    select o.uid,'tpay',o.cid::text from o
    where not exists(select 1 from notif_log l where l.kind='tpay' and l.ref=o.cid::text)
    returning ref)
  insert into teacher_events(student_id,kind,label)
  select o.uid,'msg','Pagamento de '||o.fn||' vencido há '||o.dd||' dia(s)' from o join ins on ins.ref=o.cid::text;
end $$;
revoke all on function public.gen_teacher_events() from public, anon, authenticated;
grant execute on function public.gen_teacher_events() to service_role;

-- 4) Aviso ao professor com a nota quando o aluno termina um exercício ou Check
create or replace function public.trg_attempt_event()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  begin
    if exists(select 1 from profiles where id=new.user_id and coalesce(is_admin,false)) then return new; end if;
    insert into teacher_events(student_id,kind,label) values(new.user_id,'activity',
      (case when new.kind='check' then 'Check '||coalesce(new.ex,'')
           when new.ex like 'wb%' then 'Workbook '||substr(new.ex,3)
           when new.ex ~ 'g[0-9]+$' then 'Grammar '||new.ex
           else 'Exercise '||coalesce(new.ex,'') end)
      || (case when coalesce(new.total,0)>0 then ': '||coalesce(new.score,0)||'/'||new.total else '' end));
  exception when others then null;
  end;
  return new;
end $$;

-- 5) Aviso ao professor quando um aluno envia um erro do app
create or replace function public.trg_error_event()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare who uuid; fn text; lab text;
begin
  begin
    select id into who from profiles where id=new.user_id;
    if who is null then select id into who from profiles where coalesce(is_admin,false) limit 1; end if;
    select split_part(trim(coalesce(name,'')),' ',1) into fn from profiles where id=new.user_id;
    lab := 'Erro enviado'||coalesce(' por '||nullif(fn,''),'')||': código '||coalesce(new.code,'?');
    if who is not null and not exists(select 1 from teacher_events e where e.kind='msg' and e.label=lab and e.created_at>now()-interval '10 minutes') then
      insert into teacher_events(student_id,kind,label) values(who,'msg',lab);
    end if;
  exception when others then null;
  end;
  return new;
end $$;
drop trigger if exists app_errors_event on public.app_errors;
create trigger app_errors_event after insert on public.app_errors for each row execute function public.trg_error_event();

-- 6) Agendamentos
select cron.unschedule('notify-student-events') where exists(select 1 from cron.job where jobname='notify-student-events');
select cron.unschedule('notify-teacher-gen') where exists(select 1 from cron.job where jobname='notify-teacher-gen');
select cron.schedule('notify-teacher-gen','7 * * * *','select public.gen_teacher_events()');
