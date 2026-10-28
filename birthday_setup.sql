-- Britland Academy: student birthday (run once in the Supabase SQL Editor; the Spanish project too)
alter table public.profiles add column if not exists birthdate date;
create or replace function public.set_my_birthdate(p_date date) returns void
language sql security definer set search_path=public as $$
  update public.profiles set birthdate=p_date where id=auth.uid();
$$;
revoke all on function public.set_my_birthdate(date) from public, anon;
grant execute on function public.set_my_birthdate(date) to authenticated;
