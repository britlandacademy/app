-- Britland Academy: configuracao dos efeitos de carregamento (rodar UMA vez no SQL Editor; no app em espanhol, no projeto dele tambem)
-- Pre-requisito: public.is_admin() (ja existe)
create table if not exists public.app_settings(
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
drop policy if exists app_settings_read on public.app_settings;
create policy app_settings_read on public.app_settings for select to authenticated using (true);
drop policy if exists app_settings_admin_ins on public.app_settings;
create policy app_settings_admin_ins on public.app_settings for insert to authenticated with check (public.is_admin());
drop policy if exists app_settings_admin_upd on public.app_settings;
create policy app_settings_admin_upd on public.app_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
insert into public.app_settings(key,value) values ('loading_fx','{"off":[],"dates":{},"school":"04-26"}'::jsonb) on conflict (key) do nothing;
