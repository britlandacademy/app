-- Britland 2.0: game_stats (Game Mode medal counters) + public_profile (student public profile) + streak_board with pid.
-- Already applied to both Supabase projects.
create table if not exists public.game_stats(user_id uuid primary key references auth.users(id) on delete cascade, data jsonb not null default '{}', updated_at timestamptz default now());
alter table public.game_stats enable row level security;
drop policy if exists gs_own on public.game_stats;
create policy gs_own on public.game_stats for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
grant select,insert,update on public.game_stats to authenticated;
drop function if exists public.streak_board();
create function public.streak_board() returns table(name text, cur integer, me boolean, avatar text, uid uuid, pid uuid)
language plpgsql stable security definer set search_path to 'public' as $f$
begin
  if auth.uid() is null then return; end if;
  return query
    select (split_part(trim(p.name), ' ', 1) ||
            case when position(' ' in trim(p.name)) > 0
                 then ' ' || upper(left(regexp_replace(trim(p.name), '^.* ', ''), 1)) || '.' else '' end)::text,
           c.cur, (p.id = auth.uid()), p.avatar::text,
           (case when p.avatar like 'photo:%' then p.id else null end)::uuid, p.id
    from public.profiles p
    cross join lateral public.streak_calc(p.id) c
    where p.status = 'approved' and not p.is_admin and c.cur > 0 and (p.show_in_ranking or p.id = auth.uid())
    order by c.cur desc, p.name
    limit 15;
end $f$;
grant execute on function public.streak_board() to authenticated;

create or replace function public.public_profile(p_uid uuid) returns jsonb
language plpgsql stable security definer set search_path to 'public' as $f$
declare p record; c record; r jsonb; pos int; ex int; ck int; av numeric; xp int; med jsonb;
begin
  if auth.uid() is null then return null; end if;
  select * into p from public.profiles where id=p_uid and status='approved' and not is_admin and (show_in_ranking or id=auth.uid());
  if not found then return null; end if;
  select * into c from public.streak_calc(p_uid);
  select count(*)+1 into pos from public.profiles q cross join lateral public.streak_calc(q.id) k
    where q.status='approved' and not q.is_admin and (q.show_in_ranking or q.id=auth.uid()) and k.cur > c.cur;
  select count(*) into ex from public.attempts where user_id=p_uid and kind='ex';
  select count(*), coalesce(avg(b),0) into ck, av from (select lesson, max(score::numeric/nullif(total,0)) b from public.attempts where user_id=p_uid and kind='check' group by lesson) t;
  select coalesce(g.xp,0) into xpv from public.game_xp g where g.user_id=p_uid;
  select coalesce(jsonb_agg(jsonb_build_object('id',medal_id,'tier',tier,'at',earned_at) order by earned_at desc),'[]'::jsonb) into med from public.user_medals where user_id=p_uid and medal_id<>'_sync';
  return jsonb_build_object(
    'name',(split_part(trim(p.name),' ',1)||case when position(' ' in trim(p.name))>0 then ' '||upper(left(regexp_replace(trim(p.name),'^.* ',''),1))||'.' else '' end),
    'avatar',p.avatar,'uid',case when p.avatar like 'photo:%' then p.id else null end,'upto',p.lessons_upto,
    'cur',coalesce(c.cur,0),'best',coalesce(c.best,0),'rank',pos,'ex',ex,'checks',ck,'avg',av,'xp',coalesce(xpv,0),'medals',med,'me',p.id=auth.uid());
end $f$;
grant execute on function public.public_profile(uuid) to authenticated;
