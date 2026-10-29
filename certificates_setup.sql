-- Britland Academy: Stage completion certificates.
-- Run once in the Supabase SQL Editor of EACH project (English and Spanish).
-- The teacher issues a certificate (that is the approval); the student only sees certificates issued to them.
create table if not exists public.certificates (
  id           text primary key,                                   -- e.g. BA-STG01-2026-8492 (BA-ETP01-... in the Spanish app)
  user_id      uuid not null references public.profiles(id) on delete cascade,
  student_name text not null,
  stage        int  not null check (stage between 1 and 12),
  hours        int  not null check (hours > 0),                    -- academic hours (45 min) printed on the certificate
  exam_pct     int  check (exam_pct between 0 and 100),
  distinction  boolean not null default false,
  completed_on date not null,
  issued_at    timestamptz not null default now(),
  revoked      boolean not null default false,
  unique (user_id, stage)
);
alter table public.certificates enable row level security;
drop policy if exists certificates_admin on public.certificates;
create policy certificates_admin on public.certificates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists certificates_own on public.certificates;
create policy certificates_own on public.certificates for select to authenticated
  using (user_id = auth.uid() and not revoked);

-- Teacher issues (or re-issues) the certificate of a Stage for a student. Admin only.
create or replace function public.cert_issue(p_user uuid, p_stage int, p_hours int, p_exam_pct int, p_distinction boolean, p_completed date, p_prefix text default 'STG')
returns text language plpgsql security definer set search_path = public as $$
declare nm text; cid text; n int := 0; pre text := case when upper(p_prefix) = 'ETP' then 'ETP' else 'STG' end;
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  select name into nm from public.profiles where id = p_user;
  if nm is null or btrim(nm) = '' then raise exception 'student has no name'; end if;
  select id into cid from public.certificates where user_id = p_user and stage = p_stage;
  if cid is null then
    loop
      cid := 'BA-' || pre || lpad(p_stage::text, 2, '0') || '-' || extract(year from p_completed)::int || '-' || lpad((floor(random() * 10000))::int::text, 4, '0');
      exit when not exists (select 1 from public.certificates where id = cid);
      n := n + 1; if n > 50 then raise exception 'could not generate id'; end if;
    end loop;
    insert into public.certificates(id, user_id, student_name, stage, hours, exam_pct, distinction, completed_on)
    values (cid, p_user, nm, p_stage, p_hours, p_exam_pct, coalesce(p_distinction, false), p_completed);
  else
    update public.certificates set student_name = nm, hours = p_hours, exam_pct = p_exam_pct,
      distinction = coalesce(p_distinction, false), completed_on = p_completed, revoked = false where id = cid;
  end if;
  return cid;
end $$;
revoke all on function public.cert_issue(uuid, int, int, int, boolean, date, text) from public, anon;
grant execute on function public.cert_issue(uuid, int, int, int, boolean, date, text) to authenticated;

-- Public check used by the QR code on the certificate (britland.academy/verify/ID). Returns only what is printed on it.
create or replace function public.cert_verify(p_id text)
returns jsonb language sql security definer stable set search_path = public as $$
  select coalesce((select jsonb_build_object('valid', true, 'name', c.student_name, 'stage', c.stage, 'hours', c.hours,
           'distinction', c.distinction, 'completed_on', c.completed_on)
         from public.certificates c where c.id = upper(btrim(p_id)) and not c.revoked), jsonb_build_object('valid', false));
$$;
grant execute on function public.cert_verify(text) to anon, authenticated;
