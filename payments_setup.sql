-- =====================================================================
-- Britland Academy: mensalidades (rodar UMA vez no Supabase: SQL Editor > New query > Run)
-- =====================================================================
create table if not exists public.subs (
  id           bigint generated always as identity primary key,
  user_id      uuid references public.profiles(id) on delete set null,
  student_name text not null,
  plan         text not null default 'VIP',
  currency     text not null default 'EUR' check (currency in ('EUR','BRL')),
  amount       numeric(10,2) not null check (amount >= 0),
  due_day      int  not null default 5 check (due_day between 1 and 28),
  start_month  date not null default (date_trunc('month', now())::date),
  active       boolean not null default true,
  note         text not null default '',
  created_at   timestamptz not null default now()
);

create table if not exists public.charges (
  id        bigint generated always as identity primary key,
  sub_id    bigint not null references public.subs(id) on delete cascade,
  due_date  date not null,
  currency  text not null check (currency in ('EUR','BRL')),
  amount    numeric(10,2) not null check (amount >= 0),
  paid_on   date,
  note      text not null default '',
  unique (sub_id, due_date)
);
create index if not exists charges_due_idx on public.charges (due_date);

alter table public.subs    enable row level security;
alter table public.charges enable row level security;

drop policy if exists subs_admin on public.subs;
drop policy if exists subs_own   on public.subs;
create policy subs_admin on public.subs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy subs_own on public.subs for select to authenticated
  using (user_id = auth.uid());

drop policy if exists charges_admin on public.charges;
drop policy if exists charges_own   on public.charges;
create policy charges_admin on public.charges for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy charges_own on public.charges for select to authenticated
  using (exists (select 1 from public.subs s where s.id = charges.sub_id and s.user_id = auth.uid()));

revoke all on public.subs, public.charges from anon;
