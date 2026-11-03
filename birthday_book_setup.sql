-- Livro de presente no aniversário: guarda o livro sorteado (1 por aluno por ano) e avisa o professor por push.
-- Rodar nos DOIS projetos do Supabase (o app em inglês usa; no espanhol é inofensivo).
create table if not exists public.birthday_books(
  user_id uuid not null references auth.users(id) on delete cascade,
  year int not null, title text not null, level int,
  created_at timestamptz default now(),
  primary key(user_id, year));
alter table public.birthday_books enable row level security;
-- sem policies: só as funções abaixo (security definer) e o service_role mexem na tabela.

create or replace function public.set_my_birthday_book(p_title text, p_level int)
returns text language plpgsql security definer set search_path=public as $$
declare uid uuid := auth.uid(); y int := extract(year from (now() at time zone 'America/Sao_Paulo'))::int;
        fn text; got text;
begin
  if uid is null or coalesce(trim(p_title),'')='' then return null; end if;
  insert into birthday_books(user_id,year,title,level) values(uid,y,left(p_title,120),p_level) on conflict do nothing;
  if found then
    select split_part(trim(coalesce(name,'')),' ',1) into fn from profiles where id=uid;
    insert into teacher_events(student_id,kind,label)
      values(uid,'msg','🎂 Hoje é aniversário de '||coalesce(nullif(fn,''),'um aluno')||'. Livro sorteado: '||left(p_title,120)||' (Level '||coalesce(p_level::text,'?')||'). Envie o PDF.');
  end if;
  select title into got from birthday_books where user_id=uid and year=y;
  return got;
end $$;
revoke all on function public.set_my_birthday_book(text,int) from public, anon;
grant execute on function public.set_my_birthday_book(text,int) to authenticated;
