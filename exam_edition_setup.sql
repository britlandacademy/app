-- Britland Academy: edicao do livro (2nd/3rd) escolhida ao liberar a prova. Rodar uma vez (depois de exam_setup.sql).
-- A prova do aluno e a correcao passam a usar a edicao gravada na liberacao (exam_release.edition). Padrao: '3rd'.
alter table public.exam_defs add column if not exists edition text not null default '3rd' check (edition in ('2nd','3rd'));
alter table public.exam_keys add column if not exists edition text not null default '3rd' check (edition in ('2nd','3rd'));
alter table public.exam_release add column if not exists edition text not null default '3rd' check (edition in ('2nd','3rd'));
alter table public.exam_results add column if not exists edition text not null default '3rd' check (edition in ('2nd','3rd'));
do $$ begin
  if exists (select 1 from pg_constraint where conname='exam_defs_pkey' and conrelid='public.exam_defs'::regclass and array_length(conkey,1)=1) then
    alter table public.exam_defs drop constraint exam_defs_pkey; alter table public.exam_defs add primary key (stage, edition); end if;
  if exists (select 1 from pg_constraint where conname='exam_keys_pkey' and conrelid='public.exam_keys'::regclass and array_length(conkey,1)=1) then
    alter table public.exam_keys drop constraint exam_keys_pkey; alter table public.exam_keys add primary key (stage, edition); end if;
end $$;

drop function if exists public._exam_grade(int, jsonb);
create or replace function public._exam_grade(p_stage int, p_ans jsonb, p_ed text default '3rd') returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  k jsonb; part jsonb; pid text; pts int; s int; i int; n text;
  sc jsonb := '{}'::jsonb; mx jsonb := '{}'::jsonb; rv jsonb := '{}'::jsonb;
  pend jsonb; a text; keyv text; ok boolean; acc jsonb; el jsonb;
  ka text[]; sa text[];
begin
  select keys into k from exam_keys where stage = p_stage and edition = p_ed;
  if k is null then raise exception 'exam keys missing for stage % (%)', p_stage, p_ed; end if;
  for part in select * from jsonb_array_elements(k->'parts') loop
    pid := part->>'id'; pts := (part->>'points')::int; s := 0; pend := '[]'::jsonb;
    if pid = 'dictation' then
      ka := string_to_array(_exam_norm(part->>'text'), ' ');
      sa := string_to_array(_exam_norm(p_ans->>'dictation'), ' ');
      if _exam_norm(p_ans->>'dictation') = '' then s := 0;
      else s := greatest(0, pts - _exam_wdist(ka, sa)); end if;
    elsif pid = 'yesno' then
      for n, keyv in select key, value from jsonb_each_text(part->'keys') loop
        a := lower(coalesce(p_ans->'yesno'->>n, ''));
        if a = '' or a = '?' then null;
        elsif a = lower(keyv) then s := s + 1;
        else s := s - 1; end if;
      end loop;
      s := greatest(0, s);
    elsif pid in ('oral','mc') then
      for n, keyv in select key, value from jsonb_each_text(part->'keys') loop
        if lower(coalesce(p_ans->pid->>n, '')) = lower(keyv) then s := s + 1; end if;
      end loop;
    elsif pid = 'gap' then
      for n, acc in select key, value from jsonb_each(part->'accept') loop
        a := _exam_norm(p_ans->'gap'->>n);
        if a <> '' and exists (select 1 from jsonb_array_elements_text(acc) x where _exam_norm(x) = a) then s := s + 1; end if;
      end loop;
    elsif pid = 'err' then
      for n, acc in select key, value from jsonb_each(part->'accept') loop
        a := _exam_norm(p_ans->'err'->>n);
        if a = '' then continue; end if;
        if exists (select 1 from jsonb_array_elements_text(acc) x where _exam_norm(x) = a) then s := s + 1;
        else pend := pend || to_jsonb(n::int); end if;
      end loop;
    end if;
    sc := sc || jsonb_build_object(pid, s);
    mx := mx || jsonb_build_object(pid, pts);
    if jsonb_array_length(pend) > 0 then rv := rv || jsonb_build_object(pid, pend); end if;
  end loop;
  return jsonb_build_object('scores', sc, 'maxes', mx, 'review', rv);
end $$;
revoke all on function public._exam_grade(int, jsonb, text) from public, anon, authenticated;

create or replace function public.exam_state(p_stage int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r exam_release; x exam_results; d exam_defs; left_s int;
begin
  if auth.uid() is null then return jsonb_build_object('state','locked'); end if;
  select * into r from exam_release where user_id = auth.uid() and stage = p_stage;
  if not found then return jsonb_build_object('state','locked'); end if;
  select * into x from exam_results where user_id = auth.uid() and stage = p_stage;
  select * into d from exam_defs where stage = p_stage and edition = coalesce(x.edition, r.edition);
  if d.stage is null then return jsonb_build_object('state','locked'); end if;
  if x.submitted_at is not null then
    if not x.score_visible then
      return jsonb_build_object('state','done','visible',false,'submitted_at',x.submitted_at);
    end if;
    return jsonb_build_object('state','done','visible',true,'scores',x.scores,'maxes',x.maxes,'review',x.review,'oral',x.oral,'submitted_at',x.submitted_at);
  end if;
  if x.user_id is not null then
    left_s := greatest(0, ceil(extract(epoch from (x.started_at + make_interval(mins => d.minutes + r.extra_minutes) - now())))::int);
    return jsonb_build_object('state','running','seconds_left',left_s);
  end if;
  return jsonb_build_object('state','ready','minutes',d.minutes + r.extra_minutes);
end $$;

create or replace function public.exam_begin(p_stage int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r exam_release; x exam_results; d exam_defs; left_s int;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into r from exam_release where user_id = auth.uid() and stage = p_stage;
  if not found then raise exception 'exam not released'; end if;
  select * into x from exam_results where user_id = auth.uid() and stage = p_stage;
  select * into d from exam_defs where stage = p_stage and edition = coalesce(x.edition, r.edition);
  if d.stage is null then raise exception 'exam not available'; end if;
  if x.user_id is not null and x.submitted_at is not null then raise exception 'exam already submitted'; end if;
  if x.user_id is null then
    insert into exam_results(user_id, stage, edition) values (auth.uid(), p_stage, r.edition) returning * into x;
  end if;
  left_s := greatest(0, ceil(extract(epoch from (x.started_at + make_interval(mins => d.minutes + r.extra_minutes) - now())))::int);
  return jsonb_build_object('items', d.items, 'seconds_left', left_s, 'answers', x.answers, 'part_idx', x.part_idx);
end $$;

create or replace function public.exam_submit(p_stage int, p_answers jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r exam_release; x exam_results; d exam_defs; g jsonb; is_late boolean;
begin
  select * into x from exam_results where user_id = auth.uid() and stage = p_stage for update;
  if not found then raise exception 'exam not started'; end if;
  if x.submitted_at is not null then raise exception 'exam already submitted'; end if;
  select * into r from exam_release where user_id = auth.uid() and stage = p_stage;
  select * into d from exam_defs where stage = p_stage and edition = x.edition;
  is_late := now() > x.started_at + make_interval(mins => d.minutes + coalesce(r.extra_minutes,0), secs => 90);
  g := _exam_grade(p_stage, p_answers, x.edition);
  update exam_results set answers = p_answers, submitted_at = now(), late = is_late,
         scores = g->'scores', maxes = g->'maxes', review = g->'review'
   where user_id = x.user_id and stage = x.stage;
  return jsonb_build_object('state','done','visible',false);
end $$;

create or replace function public.exam_finalize(p_user uuid, p_stage int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare x exam_results; g jsonb;
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  select * into x from exam_results where user_id = p_user and stage = p_stage for update;
  if not found then raise exception 'exam not started'; end if;
  if x.submitted_at is not null then return jsonb_build_object('state','done'); end if;
  g := _exam_grade(p_stage, x.answers, x.edition);
  update exam_results set submitted_at = now(), late = true,
         scores = g->'scores', maxes = g->'maxes', review = g->'review'
   where user_id = p_user and stage = p_stage;
  return g;
end $$;
grant execute on function public.exam_state(int), public.exam_begin(int), public.exam_submit(int, jsonb), public.exam_finalize(uuid, int) to authenticated;
