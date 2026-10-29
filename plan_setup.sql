-- Planos de Aula: vínculo aba->aluno (só admin) e progresso (aluno lê o próprio).
create table if not exists public.plan_links (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sheet_name text not null
);
create table if not exists public.plan_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stage int, lesson int, class_number int, last_word text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.plan_links enable row level security;
alter table public.plan_progress enable row level security;

create policy plan_links_admin on public.plan_links for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy plan_progress_own on public.plan_progress for select to authenticated using (user_id = auth.uid() or public.is_admin());

alter table public.plan_links add column if not exists student_col text;
create table if not exists public.plan_tabs (
  sheet_name text primary key,
  students   text[] not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.plan_tabs enable row level security;
drop policy if exists "admin lê" on public.plan_tabs;
create policy "admin lê" on public.plan_tabs for select using (public.is_admin());
