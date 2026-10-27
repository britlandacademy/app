-- =====================================================================
-- Britland Academy: Student profile (avatar, theme, language)
-- Run ONCE in Supabase: SQL Editor > New query > Run
-- =====================================================================

-- 1) Three new columns on the student's profile
alter table public.profiles
  add column if not exists avatar text,
  add column if not exists theme  text,
  add column if not exists lang   text;

alter table public.profiles drop constraint if exists profiles_theme_chk;
alter table public.profiles add constraint profiles_theme_chk check (theme is null or theme in ('light','dark','auto'));
alter table public.profiles drop constraint if exists profiles_lang_chk;
alter table public.profiles add constraint profiles_lang_chk  check (lang  is null or lang  in ('en','es','pt'));

-- 2) The student can change ONLY these three columns, and only on his own row
create or replace function public.set_my_prefs(p_avatar text default null, p_theme text default null, p_lang text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_avatar is not null and p_avatar !~ '^([a-z0-9-]{1,40}|photo:[a-z0-9-]{8,60}\.jpg)$' then
    raise exception 'invalid avatar';
  end if;
  update public.profiles
     set avatar = coalesce(p_avatar, avatar),
         theme  = coalesce(p_theme,  theme),
         lang   = coalesce(p_lang,   lang)
   where id = auth.uid();
end $$;
revoke all on function public.set_my_prefs(text,text,text) from public, anon;
grant execute on function public.set_my_prefs(text,text,text) to authenticated;

-- 3) Storage for uploaded photos (JPEG only, max 300 KB, each student writes only in his own folder)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 307200, array['image/jpeg'])
on conflict (id) do update set file_size_limit = 307200, allowed_mime_types = array['image/jpeg'];

drop policy if exists avatars_insert on storage.objects;
drop policy if exists avatars_update on storage.objects;
drop policy if exists avatars_delete on storage.objects;
create policy avatars_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
