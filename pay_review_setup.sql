-- "Em análise": comprovante do aluno (OCR) cruzado com o e-mail de recebimento (Wise/XP). Rodar em CADA projeto (inglês e espanhol).
alter table public.pay_claims
  add column if not exists ocr_amount numeric(12,2),
  add column if not exists ocr_currency text,
  add column if not exists ocr_payer text,
  add column if not exists ocr_ref text,
  add column if not exists ocr_at timestamptz,
  add column if not exists alerted_at timestamptz;

-- cruza comprovantes pendentes com e-mails 'conferir'; dá baixa quando valor e moeda batem
-- e o pagador confere (apelido salvo ou nome lido no comprovante) ou há um único candidato.
create or replace function public.pay_match_claims()
returns int language plpgsql security definer set search_path to 'public' as $$
declare k record; c record; n int := 0; cnt int; nm text; iref text; ipay text; isrc text;
begin
  for k in select * from pay_claims where status='pendente' order by created_at loop
    select ch.* into c from charges ch where ch.id=k.charge_id and ch.paid_on is null;
    if not found then continue; end if;
    -- o comprovante lido precisa concordar com a cobrança (quando o OCR existir)
    if k.ocr_amount is not null and (k.ocr_amount<>c.amount or (k.ocr_currency is not null and k.ocr_currency<>c.currency)) then continue; end if;
    select count(*) into cnt from pay_inbox where status='conferir' and currency=c.currency and amount=c.amount;
    if cnt=0 then continue; end if;
    nm := lower(translate(coalesce(k.ocr_payer,''),'ÁÀÂÃÉÊÍÓÔÕÚÇáàâãéêíóôõúç','AAAAEEIOOOUCaaaaeeiooouc'));
    iref := null;
    select p.ref,p.payer,p.source into iref,ipay,isrc from pay_inbox p
      where p.status='conferir' and p.currency=c.currency and p.amount=c.amount
        and (exists(select 1 from pay_aliases a where a.user_id=k.user_id and a.alias=lower(translate(coalesce(p.payer,''),'ÁÀÂÃÉÊÍÓÔÕÚÇáàâãéêíóôõúç','AAAAEEIOOOUCaaaaeeiooouc')))
             or (nm<>'' and lower(translate(coalesce(p.payer,''),'ÁÀÂÃÉÊÍÓÔÕÚÇáàâãéêíóôõúç','AAAAEEIOOOUCaaaaeeiooouc')) = nm)
             or (k.ocr_ref is not null and p.ref like '%'||k.ocr_ref||'%'))
      order by p.received_at limit 1;
    if iref is null and cnt=1 and k.ocr_amount is not null then
      select p.ref,p.payer,p.source into iref,ipay,isrc from pay_inbox p where p.status='conferir' and p.currency=c.currency and p.amount=c.amount limit 1;
    end if;
    if iref is null then continue; end if;
    update charges set paid_on=current_date, note='Baixa automática (comprovante + '||isrc||' '||iref||')' where id=c.id;
    update pay_claims set status='confirmado' where id=k.id;
    update pay_inbox set status='baixado', charge_id=c.id, user_id=k.user_id where ref=iref;
    insert into pay_aliases(alias,user_id)
      select lower(translate(coalesce(ipay,''),'ÁÀÂÃÉÊÍÓÔÕÚÇáàâãéêíóôõúç','AAAAEEIOOOUCaaaaeeiooouc')),k.user_id
      where coalesce(ipay,'')<>'' on conflict (alias) do nothing;
    n := n+1;
  end loop;
  return n;
end $$;
revoke all on function public.pay_match_claims() from public, anon, authenticated;

-- alerta ao professor (em português) quando passam 2 dias úteis sem o e-mail chegar
create or replace function public.pay_claims_overdue()
returns int language plpgsql security definer set search_path to 'public' as $$
declare k record; who uuid; fn text; n int := 0; du int;
begin
  select id into who from profiles where coalesce(is_admin,false) limit 1;
  if who is null then return 0; end if;
  for k in select * from pay_claims where status='pendente' and alerted_at is null loop
    select count(*) into du from generate_series(k.created_at::date+1, current_date, interval '1 day') d where extract(isodow from d)<6;
    if du>=2 then
      select split_part(trim(coalesce(name,'')),' ',1) into fn from profiles where id=k.user_id;
      insert into teacher_events(student_id,kind,label) values(who,'msg','Pagamento de '||coalesce(nullif(fn,''),'aluno')||' em análise há mais de 48h úteis sem e-mail de recebimento');
      update pay_claims set alerted_at=now() where id=k.id;
      n := n+1;
    end if;
  end loop;
  return n;
end $$;
revoke all on function public.pay_claims_overdue() from public, anon, authenticated;
do $$ begin
  perform cron.unschedule('pay-claims-overdue');
exception when others then null; end $$;
select cron.schedule('pay-claims-overdue','30 12 * * 1-5','select public.pay_claims_overdue()');

-- ao chegar um e-mail de recebimento, tenta cruzar com comprovantes em análise
create or replace function public.trg_inbox_match() returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  begin perform public.pay_match_claims(); exception when others then null; end;
  return null;
end $$;
drop trigger if exists pay_inbox_match on public.pay_inbox;
create trigger pay_inbox_match after insert on public.pay_inbox for each row when (new.status='conferir') execute function public.trg_inbox_match();
