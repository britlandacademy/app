-- Leitura automática de e-mails de pagamento (Wise / XP). Rodar no SQL Editor de CADA projeto (inglês e espanhol).
create table if not exists public.pay_aliases (
  alias text primary key,            -- nome do pagador em minúsculas, sem acento
  user_id uuid not null references public.profiles(id) on delete cascade
);
create table if not exists public.pay_inbox (
  ref text primary key,              -- nº da transferência Wise (ou nome+valor+hora no XP): evita duplicidade
  source text not null,              -- 'wise' | 'xp'
  payer text, currency text, amount numeric(12,2),
  received_at timestamptz default now(),
  status text not null default 'conferir',  -- 'baixado' | 'conferir' | 'ignorado'
  charge_id bigint, user_id uuid, note text
);
alter table public.pay_aliases enable row level security;
alter table public.pay_inbox enable row level security;
drop policy if exists pay_aliases_admin on public.pay_aliases;
drop policy if exists pay_inbox_admin on public.pay_inbox;
create policy pay_aliases_admin on public.pay_aliases for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy pay_inbox_admin on public.pay_inbox for all to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.pay_aliases, public.pay_inbox from anon;
