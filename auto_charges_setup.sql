-- =====================================================================
-- Britland Academy: geração automática das mensalidades (todo dia 1, 9h10 de Brasília)
-- Rodar UMA vez no Supabase (projeto teacherpaulocruz CM): SQL Editor > New query > Run
-- Segurança: só cria cobranças que ainda não existem (unique sub_id + due_date) e avisa o professor.
-- =====================================================================
create or replace function public.gen_monthly_charges(force boolean default false)
returns int language plpgsql security definer set search_path=public as $$
declare
  d date := (now() at time zone 'America/Sao_Paulo')::date;
  m date := date_trunc('month', (now() at time zone 'America/Sao_Paulo'))::date;
  n int := 0; late_n int := 0; adm uuid;
begin
  if not force and extract(day from d) <> 1 then return 0; end if;

  with ins as (
    insert into charges(sub_id, due_date, currency, amount)
    select s.id, m + (s.due_day - 1), s.currency, s.amount
    from subs s
    where coalesce(s.active, true) and s.start_month <= m
      and not exists (select 1 from charges c where c.sub_id = s.id and c.due_date = m + (s.due_day - 1))
    on conflict (sub_id, due_date) do nothing
    returning 1)
  select count(*) into n from ins;

  select count(distinct sub_id) into late_n from charges where paid_on is null and sub_id is not null and due_date < d;

  select id into adm from profiles where coalesce(is_admin,false) order by created_at limit 1;
  if adm is not null then
    insert into teacher_events(student_id, kind, label)
    values (adm, 'msg', 'Mensalidades de '||(array['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'])[extract(month from m)::int]||' geradas: '||n||' aluno(s)'
                        ||case when late_n>0 then ' · '||late_n||' com atraso' else '' end);
  end if;
  return n;
end $$;
revoke all on function public.gen_monthly_charges(boolean) from public, anon, authenticated;
grant execute on function public.gen_monthly_charges(boolean) to service_role;

-- 12:10 UTC = 9h10 em Brasília, todo dia 1
select cron.unschedule('gen-monthly-charges') where exists(select 1 from cron.job where jobname='gen-monthly-charges');
select cron.schedule('gen-monthly-charges','10 12 1 * *','select public.gen_monthly_charges()');
