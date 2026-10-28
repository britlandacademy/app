-- Britland Academy: Review stations (run once in the Supabase SQL Editor; the Spanish project too)
create table if not exists public.review_results(id bigint generated always as identity primary key, user_id uuid not null default auth.uid() references auth.users(id) on delete cascade, tab text not null check (tab in ('check','grammar','workbook')), rid int not null, score int not null, total int not null, created_at timestamptz not null default now());
alter table public.review_results enable row level security;
create policy review_results_ins on public.review_results for insert to authenticated with check (user_id=auth.uid());
create policy review_results_sel on public.review_results for select to authenticated using (user_id=auth.uid() or public.is_admin());
create index if not exists review_results_u on public.review_results(user_id,tab,rid);
