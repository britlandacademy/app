-- =====================================================================
-- Britland Academy: Stage Exam (rodar UMA vez no Supabase: SQL Editor > New query > Run)
-- Prova com 40 min, uma tentativa, correção no servidor (o gabarito nunca vai para o navegador do aluno).
-- =====================================================================

create table if not exists public.exam_defs (
  stage   int primary key check (stage between 1 and 12),
  minutes int not null default 40,
  items   jsonb not null            -- o que o aluno vê (sem gabarito)
);
create table if not exists public.exam_keys (
  stage int primary key check (stage between 1 and 12),
  keys  jsonb not null              -- gabarito (só admin lê)
);
create table if not exists public.exam_release (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  stage         int  not null check (stage between 1 and 12),
  released_at   timestamptz not null default now(),
  extra_minutes int  not null default 0,
  primary key (user_id, stage)
);
create table if not exists public.exam_results (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  stage        int  not null check (stage between 1 and 12),
  started_at   timestamptz not null default now(),
  saved_at     timestamptz,
  submitted_at timestamptz,
  answers      jsonb not null default '{}'::jsonb,
  scores       jsonb,               -- {"dictation":13,"yesno":9,...}
  maxes        jsonb,               -- {"dictation":15,...}
  review       jsonb,               -- itens que precisam de decisão do professor: {"err":[3,5]}
  late         boolean not null default false,
  part_idx     int not null default 0,        -- parte em que o aluno está (não volta)
  score_visible boolean not null default false, -- o professor libera a nota para o aluno
  primary key (user_id, stage)
);

alter table public.exam_defs    enable row level security;
alter table public.exam_keys    enable row level security;
alter table public.exam_release enable row level security;
alter table public.exam_results enable row level security;

drop policy if exists exam_defs_admin on public.exam_defs;
create policy exam_defs_admin on public.exam_defs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists exam_keys_admin on public.exam_keys;
create policy exam_keys_admin on public.exam_keys for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists exam_release_admin on public.exam_release;
drop policy if exists exam_release_own on public.exam_release;
create policy exam_release_admin on public.exam_release for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy exam_release_own on public.exam_release for select to authenticated
  using (user_id = auth.uid());
drop policy if exists exam_results_admin on public.exam_results;
drop policy if exists exam_results_own on public.exam_results;   -- aluno NÃO lê a tabela; só via funções
create policy exam_results_admin on public.exam_results for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on public.exam_defs, public.exam_keys, public.exam_release, public.exam_results from anon;

-- ---------- utilidades de correção ----------
create or replace function public._exam_norm(t text) returns text
language sql immutable as $$
  select trim(regexp_replace(
           regexp_replace(
             lower(replace(replace(coalesce(t,''), '’', ''''), '‘', '''')),
             '[^a-z0-9'' ]', ' ', 'g'),
           '\s+', ' ', 'g'))
$$;

create or replace function public._exam_wdist(a text[], b text[]) returns int
language plpgsql immutable as $$
declare
  n int := coalesce(array_length(a,1),0);
  m int := coalesce(array_length(b,1),0);
  prev int[]; cur int[]; i int; j int; cost int;
begin
  if n = 0 then return m; end if;
  if m = 0 then return n; end if;
  prev := array(select generate_series(0, m));
  for i in 1..n loop
    cur := array[i];
    for j in 1..m loop
      cost := case when a[i] = b[j] then 0 else 1 end;
      cur[j+1] := least(prev[j+1] + 1, cur[j] + 1, prev[j] + cost);
    end loop;
    prev := cur;
  end loop;
  return prev[m+1];
end $$;

-- Corrige um conjunto de respostas. Devolve {scores, maxes, review}
create or replace function public._exam_grade(p_stage int, p_ans jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  k jsonb; part jsonb; pid text; pts int; s int; i int; n text;
  sc jsonb := '{}'::jsonb; mx jsonb := '{}'::jsonb; rv jsonb := '{}'::jsonb;
  pend jsonb; a text; keyv text; ok boolean; acc jsonb; el jsonb;
  ka text[]; sa text[];
begin
  select keys into k from exam_keys where stage = p_stage;
  if k is null then raise exception 'exam keys missing for stage %', p_stage; end if;
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
revoke all on function public._exam_grade(int, jsonb) from public, anon, authenticated;

-- ---------- estado / início / salvar / enviar ----------
create or replace function public.exam_state(p_stage int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r exam_release; x exam_results; d exam_defs; left_s int;
begin
  if auth.uid() is null then return jsonb_build_object('state','locked'); end if;
  select * into r from exam_release where user_id = auth.uid() and stage = p_stage;
  if not found then return jsonb_build_object('state','locked'); end if;
  select * into x from exam_results where user_id = auth.uid() and stage = p_stage;
  select * into d from exam_defs where stage = p_stage;
  if d.stage is null then return jsonb_build_object('state','locked'); end if;
  if x.submitted_at is not null then
    if not x.score_visible then
      return jsonb_build_object('state','done','visible',false,'submitted_at',x.submitted_at);
    end if;
    return jsonb_build_object('state','done','visible',true,'scores',x.scores,'maxes',x.maxes,'review',x.review,'submitted_at',x.submitted_at);
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
  select * into d from exam_defs where stage = p_stage;
  if d.stage is null then raise exception 'exam not available'; end if;
  select * into x from exam_results where user_id = auth.uid() and stage = p_stage;
  if x.user_id is not null and x.submitted_at is not null then raise exception 'exam already submitted'; end if;
  if x.user_id is null then
    insert into exam_results(user_id, stage) values (auth.uid(), p_stage) returning * into x;
  end if;
  left_s := greatest(0, ceil(extract(epoch from (x.started_at + make_interval(mins => d.minutes + r.extra_minutes) - now())))::int);
  return jsonb_build_object('items', d.items, 'seconds_left', left_s, 'answers', x.answers, 'part_idx', x.part_idx);
end $$;

create or replace function public.exam_save(p_stage int, p_answers jsonb, p_part int default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  update exam_results set answers = p_answers, saved_at = now(),
         part_idx = greatest(part_idx, coalesce(p_part, part_idx))
   where user_id = auth.uid() and stage = p_stage and submitted_at is null;
end $$;

create or replace function public.exam_submit(p_stage int, p_answers jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r exam_release; x exam_results; d exam_defs; g jsonb; is_late boolean;
begin
  select * into x from exam_results where user_id = auth.uid() and stage = p_stage for update;
  if not found then raise exception 'exam not started'; end if;
  if x.submitted_at is not null then raise exception 'exam already submitted'; end if;
  select * into r from exam_release where user_id = auth.uid() and stage = p_stage;
  select * into d from exam_defs where stage = p_stage;
  is_late := now() > x.started_at + make_interval(mins => d.minutes + coalesce(r.extra_minutes,0), secs => 90);
  g := _exam_grade(p_stage, p_answers);
  update exam_results set answers = p_answers, submitted_at = now(), late = is_late,
         scores = g->'scores', maxes = g->'maxes', review = g->'review'
   where user_id = x.user_id and stage = x.stage;
  return jsonb_build_object('state','done','visible',false);
end $$;

-- Professor: fecha uma prova que ficou aberta (aluno fechou o navegador) usando as respostas salvas
create or replace function public.exam_finalize(p_user uuid, p_stage int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare x exam_results; g jsonb;
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  select * into x from exam_results where user_id = p_user and stage = p_stage for update;
  if not found then raise exception 'exam not started'; end if;
  if x.submitted_at is not null then return jsonb_build_object('state','done'); end if;
  g := _exam_grade(p_stage, x.answers);
  update exam_results set submitted_at = now(), late = true,
         scores = g->'scores', maxes = g->'maxes', review = g->'review'
   where user_id = p_user and stage = p_stage;
  return g;
end $$;

grant execute on function public.exam_state(int), public.exam_begin(int), public.exam_save(int, jsonb, int),
      public.exam_submit(int, jsonb), public.exam_finalize(uuid, int) to authenticated;
revoke execute on function public.exam_state(int), public.exam_begin(int), public.exam_save(int, jsonb, int),
      public.exam_submit(int, jsonb), public.exam_finalize(uuid, int) from anon;
