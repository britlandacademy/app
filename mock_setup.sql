-- Britland Academy: simulados (mock tests). As provas ficam em mocks/*.json (estaticas); aqui so o historico de tentativas de cada aluno.
create table if not exists public.mock_attempts(
  id bigserial primary key,
  user_id uuid not null default auth.uid(),
  stage int not null,
  edition text not null default '3rd',
  test text not null check (test in ('A','B')),
  answers jsonb,
  scores jsonb,
  maxes jsonb,
  seconds_used int,
  created_at timestamptz not null default now()
);
create index if not exists mock_attempts_user on public.mock_attempts(user_id, stage, test);
alter table public.mock_attempts enable row level security;
drop policy if exists mock_att_select on public.mock_attempts;
drop policy if exists mock_att_insert on public.mock_attempts;
create policy mock_att_select on public.mock_attempts for select using (user_id = auth.uid() or public.is_admin());
create policy mock_att_insert on public.mock_attempts for insert with check (user_id = auth.uid());
grant select, insert on public.mock_attempts to authenticated;
grant usage, select on sequence public.mock_attempts_id_seq to authenticated;
