alter table public.profiles add column if not exists auto_release boolean not null default true;
alter table public.profiles add column if not exists lessons_auto integer;

create or replace function public.plan_auto_calc() returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  update public.profiles set lessons_auto = case when new.lesson is null then null
    else new.lesson + case when coalesce((new.data->'currentPosition'->>'lessonFinished')::boolean,false) then 1 else 0 end end
  where id = new.user_id;
  return new;
end $$;
drop trigger if exists plan_auto_trg on public.plan_progress;
create trigger plan_auto_trg after insert or update of lesson, data on public.plan_progress for each row execute function public.plan_auto_calc();

update public.profiles p set lessons_auto = case when pp.lesson is null then null
  else pp.lesson + case when coalesce((pp.data->'currentPosition'->>'lessonFinished')::boolean,false) then 1 else 0 end end
from public.plan_progress pp where pp.user_id = p.id;

create or replace function public.my_upto() returns integer language sql stable security definer set search_path to 'public' as $$
  select coalesce((
    select case when is_admin then 112
                when status = 'approved' then case when auto_release and lessons_auto is not null then least(lessons_upto, lessons_auto) else lessons_upto end
                else 0 end
    from public.profiles where id = auth.uid()), 0)
$$;
