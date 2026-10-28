-- Britland Academy (Spanish): Stage locks (run once in the Supabase SQL Editor of the SPANISH project)
-- A Stage opens the next one only when: every Check/Grammar/Workbook exercise of its lessons was done,
-- the average of its Lesson Checks is >= 70%, and the Stage exam (when it exists) was passed with >= 70%.
-- The teacher can release a Stage by hand (table stage_unlock).
create table if not exists public.stage_unlock(user_id uuid not null references public.profiles(id) on delete cascade, stage int not null check (stage between 1 and 6), created_at timestamptz not null default now(), primary key(user_id,stage));
alter table public.stage_unlock enable row level security;
create policy stage_unlock_admin on public.stage_unlock for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy stage_unlock_own on public.stage_unlock for select to authenticated using (user_id=auth.uid());
-- students already past a Stage keep it open
insert into public.stage_unlock(user_id,stage) select p.id,s.n from public.profiles p cross join (values (1,16),(2,32),(3,52),(4,72),(5,92),(6,112)) s(n,b) where coalesce(p.lessons_upto,0)>s.b on conflict do nothing;
create or replace function public.my_stage_gates() returns jsonb language plpgsql security definer stable set search_path=public as $$
declare uid uuid:=auth.uid(); A int[]:=array[1,17,33,53,73,93]; B int[]:=array[16,32,52,72,92,112];
 s int; res jsonb:='[]'::jsonb; cap int:=112; capset boolean:=false; ov boolean; exreq boolean; exok boolean; av numeric; redo int[]; mg int[]; mw int[]; ok boolean;
begin
 for s in 1..6 loop
  ov:=exists(select 1 from stage_unlock where user_id=uid and stage=s);
  exreq:=exists(select 1 from exam_defs where stage=s);
  exok:=exists(select 1 from exam_results r where r.user_id=uid and r.stage=s and r.submitted_at is not null and r.score_visible and (select coalesce(sum(v.value::numeric),0) from jsonb_each_text(coalesce(r.maxes,'{}'::jsonb)) v)>0 and (select coalesce(sum(v.value::numeric),0) from jsonb_each_text(coalesce(r.scores,'{}'::jsonb)) v)>=0.7*(select coalesce(sum(v.value::numeric),0) from jsonb_each_text(coalesce(r.maxes,'{}'::jsonb)) v));
  select avg(x.p), coalesce(array_agg(x.l order by x.l) filter (where x.p<0.7),'{}') into av, redo from (select c.lesson l, coalesce((select sum(m.sc)::numeric/nullif(sum(m.tt),0) from (select a.ex, max(a.score) sc, max(a.total) tt from attempts a where a.user_id=uid and a.kind='check' and a.lesson=c.lesson group by a.ex) m),0) p from content c where c.kind='check' and c.lesson between A[s] and B[s] and coalesce(c.body->>'rep','false')='true') x;
  select coalesce(array_agg(c.lesson order by c.lesson),'{}') into mg from content c where c.kind='check' and c.lesson between A[s] and B[s] and coalesce(c.body->>'rep','false')='true' and jsonb_typeof(c.body->'ex')='array' and (select count(distinct a.ex) from attempts a where a.user_id=uid and a.kind='check' and a.lesson=c.lesson)<jsonb_array_length(c.body->'ex');
  mw:='{}';
  ok:=ov or ((not exreq or exok) and coalesce(av,0)>=0.7 and cardinality(mg)=0 and cardinality(mw)=0);
  res:=res||jsonb_build_array(jsonb_build_object('stage',s,'ok',ok,'ov',ov,'exreq',exreq,'exok',exok,'avg',round(coalesce(av,0),3),'redo',to_jsonb(redo),'gram',to_jsonb(mg),'wb',to_jsonb(mw)));
  if not ok and not capset then cap:=B[s]; capset:=true; end if;
 end loop;
 return jsonb_build_object('cap',cap,'stages',res);
end $$;
revoke all on function public.my_stage_gates() from public, anon;
grant execute on function public.my_stage_gates() to authenticated;
