-- =====================================================================
-- Britland Academy: pagamentos recorrentes (Stripe em EUR, Asaas em BRL ou controle manual)
-- Idempotente: pode rodar mais de uma vez. Convive com as tabelas atuais subs/charges (mensalidades manuais).
-- =====================================================================

-- 1) Planos vendidos
create table if not exists public.billing_plans (
  id                 bigint generated always as identity primary key,
  slug               text not null unique,
  nome               text not null,
  idioma_curso       text not null default 'en' check (idioma_curso in ('en','es','pt','business')),
  frequencia_semanal int  not null default 2 check (frequencia_semanal between 1 and 7),
  moeda              text not null default 'EUR' check (moeda in ('EUR','BRL')),
  valor_centavos     int  not null check (valor_centavos >= 0),
  gateway            text not null default 'manual' check (gateway in ('stripe','asaas','manual')),
  gateway_price_id   text,
  checkout_url       text,
  ativo              boolean not null default false,
  created_at         timestamptz not null default now()
);

-- 2) Assinaturas (uma por aluno e plano contratado)
create table if not exists public.subscriptions (
  id                      bigint generated always as identity primary key,
  student_id              uuid not null references public.profiles(id) on delete cascade,
  plan_id                 bigint references public.billing_plans(id) on delete set null,
  gateway                 text not null default 'manual' check (gateway in ('stripe','asaas','manual')),
  gateway_customer_id     text,
  gateway_subscription_id text,
  status                  text not null default 'pending'
                          check (status in ('pending','active','past_due','paused','canceled','incomplete')),
  current_period_end      timestamptz,
  created_at              timestamptz not null default now()
);
create unique index if not exists subscriptions_gw_uq on public.subscriptions (gateway, gateway_subscription_id)
  where gateway_subscription_id is not null;
create index if not exists subscriptions_student_idx on public.subscriptions (student_id);

-- 3) Faturas de cada assinatura
create table if not exists public.invoices (
  id                 bigint generated always as identity primary key,
  subscription_id    bigint not null references public.subscriptions(id) on delete cascade,
  gateway_invoice_id text,
  valor_centavos     int  not null check (valor_centavos >= 0),
  moeda              text not null default 'EUR' check (moeda in ('EUR','BRL')),
  status             text not null default 'open' check (status in ('open','paid','overdue','failed','refunded','void')),
  paid_at            timestamptz,
  invoice_url        text,
  created_at         timestamptz not null default now()
);
create unique index if not exists invoices_gw_uq on public.invoices (subscription_id, gateway_invoice_id)
  where gateway_invoice_id is not null;
create index if not exists invoices_sub_idx on public.invoices (subscription_id, created_at desc);

-- RLS: professor (admin) faz tudo; aluno so le o que e dele; planos ativos podem ser lidos por qualquer um (site publico)
alter table public.billing_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.invoices      enable row level security;

drop policy if exists billing_plans_admin  on public.billing_plans;
drop policy if exists billing_plans_public on public.billing_plans;
create policy billing_plans_admin on public.billing_plans for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy billing_plans_public on public.billing_plans for select to anon, authenticated
  using (ativo);

drop policy if exists subscriptions_admin on public.subscriptions;
drop policy if exists subscriptions_own   on public.subscriptions;
create policy subscriptions_admin on public.subscriptions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy subscriptions_own on public.subscriptions for select to authenticated
  using (student_id = auth.uid());

drop policy if exists invoices_admin on public.invoices;
drop policy if exists invoices_own   on public.invoices;
create policy invoices_admin on public.invoices for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy invoices_own on public.invoices for select to authenticated
  using (exists (select 1 from public.subscriptions s where s.id = invoices.subscription_id and s.student_id = auth.uid()));

revoke all on public.subscriptions, public.invoices from anon;
revoke insert, update, delete on public.billing_plans from anon;

-- Exemplo para cadastrar um plano (rode quando for ativar; o checkout_url vem do Stripe Payment Link ou do link de assinatura do Asaas):
-- insert into public.billing_plans (slug,nome,idioma_curso,frequencia_semanal,moeda,valor_centavos,gateway,gateway_price_id,checkout_url,ativo)
-- values ('vip-en-2x-eur','VIP Inglês 2x por semana','en',2,'EUR',12000,'stripe','price_xxx','https://buy.stripe.com/xxx',true);

-- Planos oficiais (mensais). Inativos ate existir checkout_url / gateway_price_id; ative com: update billing_plans set ativo=true where slug in (...)
insert into public.billing_plans (slug, nome, moeda, valor_centavos, gateway, ativo) values
 ('essential-brl','Essential','BRL',29000,'asaas',false),
 ('fluency-club-brl','Fluency Club','BRL',75000,'asaas',false),
 ('vip-intensive-brl','VIP Intensive','BRL',159000,'asaas',false),
 ('essential-eur','Essential','EUR',4900,'stripe',false),
 ('fluency-club-eur','Fluency Club','EUR',12000,'stripe',false),
 ('vip-intensive-eur','VIP Intensive','EUR',26000,'stripe',false)
on conflict (slug) do update set nome=excluded.nome, moeda=excluded.moeda, valor_centavos=excluded.valor_centavos, gateway=excluded.gateway;
