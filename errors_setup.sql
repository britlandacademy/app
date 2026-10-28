-- Britland Academy: error log (run once in the Supabase SQL Editor; the Spanish app too if it uses a separate project)
create table if not exists public.app_errors(
  id bigserial primary key,
  created_at timestamptz not null default now(),
  user_id uuid default auth.uid(),
  code text, kind text, message text, page text, version text, ua text
);
alter table public.app_errors enable row level security;
drop policy if exists app_errors_insert on public.app_errors;
create policy app_errors_insert on public.app_errors for insert to authenticated with check (true);
drop policy if exists app_errors_admin_read on public.app_errors;
create policy app_errors_admin_read on public.app_errors for select to authenticated
  using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_admin));
