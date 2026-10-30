-- =====================================================================
-- Britland Academy: contrato de prestação de serviços (Autentique)
-- Rodar UMA vez no SQL Editor de cada projeto (inglês e espanhol).
-- =====================================================================
create table if not exists public.contracts (
  user_id     uuid primary key references public.profiles(id) on delete cascade,
  country     text,
  course      text,
  plan        text check (plan is null or plan in ('VIP','Turma','Intensivo','Business')),
  currency    text check (currency is null or currency in ('BRL','EUR','USD')),
  pay_method  text check (pay_method is null or pay_method in ('Wise','Revolut')),
  due_day     int  check (due_day is null or due_day in (10,15,25)),
  start_date  date,
  status      text not null default 'draft' check (status in ('draft','sent','signed','error')),
  doc_id      text,
  sign_link   text,
  signed_url  text,
  error       text,
  sent_at     timestamptz,
  signed_at   timestamptz,
  updated_at  timestamptz not null default now()
);
alter table public.contracts enable row level security;
drop policy if exists contracts_admin on public.contracts;
create policy contracts_admin on public.contracts for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists contracts_own on public.contracts;
create policy contracts_own on public.contracts for select to authenticated using (user_id = auth.uid());

-- Texto do contrato (fica no banco; só envia quando ready = true).
-- Variáveis: {{nome}} {{email}} {{pais}} {{curso}} {{plano}} {{valor}} {{moeda}} {{pagamento}} {{vencimento}} {{inicio}} {{data}}
create table if not exists public.contract_template (
  id         int primary key default 1 check (id = 1),
  ready      boolean not null default false,
  body       text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.contract_template enable row level security;
drop policy if exists contract_template_admin on public.contract_template;
create policy contract_template_admin on public.contract_template for all to authenticated using (public.is_admin()) with check (public.is_admin());
insert into public.contract_template(id, ready, body) values (1, false, '') on conflict (id) do nothing;
