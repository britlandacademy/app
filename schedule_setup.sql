-- Britland: agenda de aulas (Google Calendar) - fase 1: aluno ve as proprias aulas
create table if not exists public.gcal_link(
  id int primary key default 1 check (id=1),
  refresh_token text, calendar_id text, calendar_name text, pending_state text,
  connected_at timestamptz, last_sync timestamptz, last_error text);
alter table public.gcal_link enable row level security;  -- sem policies: so as funcoes (service role) acessam o token

create table if not exists public.lessons(
  id text primary key,
  user_id uuid references public.profiles(id) on delete set null,
  title text not null, start_at timestamptz not null, end_at timestamptz not null,
  meet_url text, updated_at timestamptz not null default now());
create index if not exists lessons_user_start on public.lessons(user_id,start_at);
alter table public.lessons enable row level security;
drop policy if exists lessons_own on public.lessons;
create policy lessons_own on public.lessons for select to authenticated using (user_id=auth.uid());
drop policy if exists lessons_admin on public.lessons;
create policy lessons_admin on public.lessons for all to authenticated
  using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_admin))
  with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_admin));

create or replace function public.gcal_status() returns jsonb language sql security definer stable set search_path=public as $$
  select case when exists(select 1 from profiles p where p.id=auth.uid() and p.is_admin)
    then coalesce((select jsonb_build_object('connected',refresh_token is not null,'calendar',calendar_name,'last_sync',last_sync,'last_error',last_error) from gcal_link where id=1),'{"connected":false}'::jsonb)
    else null end $$;
revoke all on function public.gcal_status() from public, anon;
grant execute on function public.gcal_status() to authenticated;

-- Turmas: o nome da turma (como aparece no titulo do evento) liga varios alunos a uma aula
create table if not exists public.class_groups(id uuid primary key default gen_random_uuid(), name text not null unique, created_at timestamptz default now());
create table if not exists public.class_group_members(group_id uuid not null references public.class_groups(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade, primary key(group_id,user_id));
alter table public.class_groups enable row level security;
alter table public.class_group_members enable row level security;
drop policy if exists cg_admin on public.class_groups;
create policy cg_admin on public.class_groups for all to authenticated using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_admin)) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_admin));
drop policy if exists cgm_admin on public.class_group_members;
create policy cgm_admin on public.class_group_members for all to authenticated using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_admin)) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_admin));
-- Fase 2: remarcar, cancelar e marcar aula nova
alter table public.lessons add column if not exists is_group boolean default false;
create table if not exists public.availability(id uuid primary key default gen_random_uuid(), weekday int not null check(weekday between 0 and 6), start_time time not null, end_time time not null);
create table if not exists public.availability_blocks(id uuid primary key default gen_random_uuid(), day date not null unique, note text);
create table if not exists public.lesson_requests(id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, kind text not null check(kind in ('reschedule','new','cancel')), lesson_id text, old_start timestamptz, new_start timestamptz not null, new_end timestamptz not null, status text not null default 'pending' check(status in ('pending','approved','rejected','expired')), created_at timestamptz default now(), decided_at timestamptz);
create index if not exists lesson_requests_status_idx on public.lesson_requests(status,new_start);
alter table public.availability enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.lesson_requests enable row level security;
drop policy if exists av_admin on public.availability;
create policy av_admin on public.availability for all to authenticated using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_admin)) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_admin));
drop policy if exists avb_admin on public.availability_blocks;
create policy avb_admin on public.availability_blocks for all to authenticated using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_admin)) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_admin));
drop policy if exists lr_admin on public.lesson_requests;
create policy lr_admin on public.lesson_requests for all to authenticated using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_admin)) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_admin));
drop policy if exists lr_own on public.lesson_requests;
create policy lr_own on public.lesson_requests for select to authenticated using (user_id=auth.uid());
