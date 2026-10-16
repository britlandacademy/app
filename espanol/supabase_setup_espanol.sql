-- =====================================================================
-- Callan ESPAÑOL site: database setup (NEW Supabase project) (run ONCE in Supabase: SQL Editor > New query > paste > Run)
-- =====================================================================

-- 1) Students (one row per account) -----------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  name         text not null default '',
  status       text not null default 'pending' check (status in ('pending','approved','blocked')),
  lessons_upto int  not null default 0 check (lessons_upto between 0 and 112),
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- 2) Content (lessons, checks, exercises) ----------------------------
create table if not exists public.content (
  lesson int  not null check (lesson between 1 and 112),
  kind   text not null check (kind in ('text','check','ex')),
  body   jsonb not null,
  primary key (lesson, kind)
);

-- 3) Scores ------------------------------------------------------------
create table if not exists public.attempts (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  kind       text not null check (kind in ('check','ex')),
  lesson     int  not null check (lesson between 1 and 112),
  ex         text not null,
  score      int  not null check (score >= 0),
  total      int  not null check (total > 0 and score <= total),
  created_at timestamptz not null default now()
);
create index if not exists attempts_user_idx on public.attempts (user_id, kind, lesson);

-- 4) Helper functions (security definer: they read profiles without recursion)
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.my_upto() returns int
language sql stable security definer set search_path = public as $$
  select coalesce((
    select case when is_admin then 112
                when status = 'approved' then lessons_upto
                else 0 end
    from public.profiles where id = auth.uid()), 0)
$$;

-- 5) New account => profile row (status "pending", nothing released)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, coalesce(new.email,''), left(coalesce(new.raw_user_meta_data->>'name',''), 60))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6) Row Level Security -------------------------------------------------
alter table public.profiles enable row level security;
alter table public.content  enable row level security;
alter table public.attempts enable row level security;

drop policy if exists profiles_read   on public.profiles;
drop policy if exists profiles_admin  on public.profiles;
create policy profiles_read  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy profiles_admin on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists content_read  on public.content;
drop policy if exists content_admin on public.content;
create policy content_read  on public.content for select to authenticated
  using (lesson <= public.my_upto());
create policy content_admin on public.content for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists attempts_read   on public.attempts;
drop policy if exists attempts_insert on public.attempts;
drop policy if exists attempts_admin  on public.attempts;
create policy attempts_read   on public.attempts for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy attempts_insert on public.attempts for insert to authenticated
  with check (user_id = auth.uid() and lesson <= public.my_upto());
create policy attempts_admin  on public.attempts for delete to authenticated
  using (public.is_admin());

-- Nobody can use the tables without being signed in
revoke all on public.profiles, public.content, public.attempts from anon;

-- 7) Private audio bucket ---------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audio', 'audio', false, 52428800, array['audio/mpeg'])
on conflict (id) do update set public = false;

drop policy if exists audio_read  on storage.objects;
drop policy if exists audio_admin on storage.objects;
-- A student may open an audio file only if its lesson number is released to him/her.
-- Names look like:  Etapa 2/Etapa 2 Lección 14.mp3   and   Etapa 2/Dictados/Etapa 2 Lección 14 Dictado 4.mp3
create policy audio_read on storage.objects for select to authenticated
  using (bucket_id = 'audio'
         and coalesce(substring(name from '(?:Lesson|Lecci.n) ([0-9]+)')::int, 9999) <= public.my_upto());
create policy audio_admin on storage.objects for all to authenticated
  using (bucket_id = 'audio' and public.is_admin())
  with check (bucket_id = 'audio' and public.is_admin());

-- =====================================================================
-- AFTER you create YOUR teacher account (see the instructions), run this
-- line ONCE, with your own e-mail:
--
--   update public.profiles set is_admin = true, status = 'approved'
--   where email = 'YOUR-EMAIL-HERE';
-- =====================================================================
