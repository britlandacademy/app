-- Cobranças avulsas (sem plano): rodar UMA vez no Supabase (SQL Editor > New query > Run)
alter table public.charges alter column sub_id drop not null;
alter table public.charges add column if not exists title text;
