-- =====================================================================
-- Britland Academy: checkout dentro do app (Pix e cartao no Asaas em BRL, cartao no Stripe em EUR).
-- Cada tentativa de pagamento vira uma linha em checkouts. Quem cria e atualiza e a funcao checkout
-- e o payment-webhook (service role); o aluno so le as dele. Idempotente.
-- Banco do espanhol: rode antes billing_setup.sql e o bloco de plan_requests do fim deste arquivo.
-- =====================================================================

create table if not exists public.checkouts (
  id                  bigint generated always as identity primary key,
  user_id             uuid not null references auth.users(id) on delete cascade,
  slug                text not null,
  plano               text not null,
  periodo             text not null,                 -- mensal | cartao6 | avista3 | avista6
  moeda               text not null check (moeda in ('BRL','EUR')),
  meses               int  not null default 1,       -- ciclos pagos de uma vez
  valor_centavos      int  not null,                 -- valor por mes, ja com desconto
  total_centavos      int  not null,                 -- o que e cobrado agora
  desconto            text,                          -- ex.: avista6-30, cartao6-20, dupla-10
  codigo              text,
  metodo              text not null check (metodo in ('pix','card')),
  gateway             text not null check (gateway in ('asaas','stripe')),
  gateway_customer_id text,
  gateway_ref         text,                          -- id do pagamento, da assinatura ou do PaymentIntent
  status              text not null default 'pending' check (status in ('pending','paid','failed','expired','canceled')),
  pix_payload         text,
  pix_image           text,
  pix_expires_at      timestamptz,
  erro                text,
  created_at          timestamptz not null default now(),
  paid_at             timestamptz
);
create index if not exists checkouts_user_idx on public.checkouts (user_id, created_at desc);
create index if not exists checkouts_ref_idx  on public.checkouts (gateway, gateway_ref);

alter table public.checkouts enable row level security;
drop policy if exists checkouts_sel on public.checkouts;
create policy checkouts_sel on public.checkouts for select to authenticated
  using (user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
revoke insert, update, delete on public.checkouts from anon, authenticated;

-- ---------------------------------------------------------------------
-- So no banco do espanhol (no ingles ja existem): pedidos de plano
-- ---------------------------------------------------------------------
-- create table if not exists public.plan_requests (
--   id bigserial primary key, user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
--   slug text not null, plano text not null, periodo text not null, moeda text not null, valor_centavos int not null,
--   desconto text, codigo text, tipo text not null default 'novo', status text not null default 'aberto', obs text,
--   created_at timestamptz not null default now(), handled_at timestamptz);
-- (politicas iguais as do ingles: insere/le/apaga o proprio pedido aberto; admin atualiza)

-- Pagamento de mensalidade (charges) pelo app: o checkout aponta para a parcela paga.
alter table public.checkouts add column if not exists charge_id bigint references public.charges(id) on delete set null;
create index if not exists checkouts_charge_idx on public.checkouts(charge_id);
