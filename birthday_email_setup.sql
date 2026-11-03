-- Britland Academy: e-mail de feliz aniversário (rode uma vez no SQL Editor; no projeto de espanhol também)
-- Quem recebe: alunos aprovados, com data de nascimento, no dia do aniversário (horário de Brasília, entre 9h e 19h), uma vez por ano.
create or replace function public.due_birthday_emails()
returns table(user_id uuid, first_name text, email text)
language plpgsql security definer set search_path=public as $$
declare d date := (now() at time zone 'America/Sao_Paulo')::date;
        h int  := extract(hour from (now() at time zone 'America/Sao_Paulo'))::int;
begin
  if h < 9 or h >= 19 then return; end if;
  return query
    select p.id, split_part(trim(coalesce(p.name,'')),' ',1)::text, u.email::text
    from profiles p join auth.users u on u.id = p.id
    where coalesce(p.is_admin,false) = false and p.status = 'approved'
      and p.birthdate is not null and to_char(p.birthdate,'MM-DD') = to_char(d,'MM-DD')
      and u.email is not null
      and not exists(select 1 from notif_log l where l.user_id = p.id and l.kind = 'birthday_email' and l.ref = extract(year from d)::text);
end $$;
revoke all on function public.due_birthday_emails() from public, anon, authenticated;
grant execute on function public.due_birthday_emails() to service_role;
