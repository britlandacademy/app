-- Britland Academy 1.11.18: weekly goal and ranking opt-out (already applied to both Supabase projects)
alter table public.profiles add column if not exists weekly_goal smallint not null default 5;
alter table public.profiles add column if not exists show_in_ranking boolean not null default true;
alter table public.profiles drop constraint if exists profiles_weekly_goal_chk;
alter table public.profiles add constraint profiles_weekly_goal_chk check (weekly_goal in (3,5,7));
-- functions set_my_goal(int), set_my_ranking(boolean); streak_board() hides students who opted out (English project)
