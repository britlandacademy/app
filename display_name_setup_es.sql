alter table public.profiles add column if not exists display_name text, add column if not exists display_name_at timestamptz;
alter table public.profiles drop constraint if exists profiles_display_name_len;
alter table public.profiles add constraint profiles_display_name_len check (display_name is null or char_length(display_name) between 2 and 20);
create or replace function public.pub_name(d text, n text) returns text language sql immutable set search_path to 'public' as $$
  select coalesce(nullif(trim(d),''), split_part(trim(n),' ',1)||case when position(' ' in trim(n))>0 then ' '||upper(left(regexp_replace(trim(n),'^.* ',''),1))||'.' else '' end) $$;
create or replace function public.set_my_display_name(p_name text) returns jsonb
language plpgsql security definer set search_path to 'public' as $f$
declare v text; s text; tok text; at_ timestamptz; w text;
begin
  if auth.uid() is null then return jsonb_build_object('ok',false,'error','auth'); end if;
  v := regexp_replace(trim(coalesce(p_name,'')),'\s+',' ','g');
  if v = '' then
    update public.profiles set display_name=null where id=auth.uid();
    return jsonb_build_object('ok',true,'name',null);
  end if;
  if char_length(v) < 2 or char_length(v) > 20 then return jsonb_build_object('ok',false,'error','length'); end if;
  if v !~ '^[[:alnum:] .''_-]+$' then return jsonb_build_object('ok',false,'error','chars'); end if;
  select display_name_at into at_ from public.profiles where id=auth.uid();
  if at_ is not null and at_ > now() - interval '30 days' then
    return jsonb_build_object('ok',false,'error','locked','next_at',at_ + interval '30 days');
  end if;
  s := translate(translate(lower(v),'áàâãäéèêëíìîïóòôõöúùûüçñ','aaaaaeeeeiiiiooooouuuucn'),'013457@$','oleastas');
  if regexp_replace(s,'[^a-z0-9]','','g') ~ '(merda|caralho|porra|buceta|cacete|piroca|arrombad|fuck|shit|bitch|nigger|nigga|faggot|asshole|mierda|pendejo|cabron|hijueputa|gilipollas|hitler|fodase)' then
    return jsonb_build_object('ok',false,'error','blocked');
  end if;
  foreach tok in array regexp_split_to_array(regexp_replace(s,'[^a-z0-9 ]','','g'),' ') loop
    if tok in ('puta','puto','viado','foda','fdp','cuzao','cunt','slut','whore','pussy','verga','joder','culero','marica','polla','cono','bosta','cu','rape','nazi') then
      return jsonb_build_object('ok',false,'error','blocked');
    end if;
  end loop;
  update public.profiles set display_name=v, display_name_at=now() where id=auth.uid();
  return jsonb_build_object('ok',true,'name',v);
end $f$;
revoke all on function public.set_my_display_name(text) from public, anon;
grant execute on function public.set_my_display_name(text) to authenticated;
create or replace function public.public_profile(p_uid uuid) returns jsonb
language plpgsql stable security definer set search_path to 'public' as $f$
declare p record; c record; pos int; ex int; ck int; av numeric; xpv int; med jsonb;
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
    'name',public.pub_name(p.display_name,p.name),
    'avatar',p.avatar,'uid',case when p.avatar like 'photo:%' then p.id else null end,'upto',p.lessons_upto,
    'cur',coalesce(c.cur,0),'best',coalesce(c.best,0),'rank',pos,'ex',ex,'checks',ck,'avg',av,'xp',coalesce(xpv,0),'medals',med,'me',p.id=auth.uid());
end $f$;
create or replace function public.streak_board() returns table(name text, cur integer, me boolean, avatar text, uid uuid, pid uuid)
language plpgsql stable security definer set search_path to 'public' as $f$
begin
  if auth.uid() is null then return; end if;
  return query
    select public.pub_name(p.display_name,p.name)::text,
           c.cur, (p.id = auth.uid()), p.avatar::text,
           (case when p.avatar like 'photo:%' then p.id else null end)::uuid, p.id
    from public.profiles p
    cross join lateral public.streak_calc(p.id) c
    where p.status = 'approved' and not p.is_admin and c.cur > 0 and (p.show_in_ranking or p.id = auth.uid())
    order by c.cur desc, p.name
    limit 15;
end $f$;
