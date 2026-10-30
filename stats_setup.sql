-- Britland Academy: aba "Estatísticas" do professor (rodar UMA vez no SQL Editor; no app em espanhol também, no projeto dele)
-- Pré-requisitos já existentes: public.profiles, public.is_admin(), public.app_errors, public.teacher_events, public.contracts, public.charges

-- 1) Aparelhos dos alunos (um registro por aluno + aparelho)
create table if not exists public.app_devices(
  user_id   uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  device    text not null,
  mode      text not null default 'browser' check (mode in ('pwa','browser')),
  platform  text, browser text, version text,
  notif     boolean not null default false,
  game      boolean not null default false,
  first_seen timestamptz not null default now(),
  last_seen  timestamptz not null default now(),
  primary key (user_id, device)
);
alter table public.app_devices add column if not exists game boolean not null default false;
alter table public.app_devices enable row level security;
drop policy if exists app_devices_own_ins on public.app_devices;
create policy app_devices_own_ins on public.app_devices for insert to authenticated with check (user_id = auth.uid());
drop policy if exists app_devices_own_upd on public.app_devices;
create policy app_devices_own_upd on public.app_devices for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists app_devices_admin on public.app_devices;
create policy app_devices_admin on public.app_devices for select to authenticated using (public.is_admin());

-- 2) Telas abertas (para "telas mais usadas")
create table if not exists public.page_views(
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  page text not null,
  created_at timestamptz not null default now()
);
create index if not exists page_views_created_idx on public.page_views (created_at);
alter table public.page_views enable row level security;
drop policy if exists page_views_ins on public.page_views;
create policy page_views_ins on public.page_views for insert to authenticated with check (user_id = auth.uid());
drop policy if exists page_views_admin on public.page_views;
create policy page_views_admin on public.page_views for select to authenticated using (public.is_admin());

-- 3) Erros: marcar como resolvido
alter table public.app_errors add column if not exists resolved boolean not null default false;
drop policy if exists app_errors_admin_upd on public.app_errors;
create policy app_errors_admin_upd on public.app_errors for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- 4) Alertas de erro repetido
create table if not exists public.stats_settings(
  id int primary key default 1 check (id = 1),
  alert_on boolean not null default true,
  err_limit int not null default 5 check (err_limit >= 1),
  stu_on boolean not null default true,
  stu_limit int not null default 3 check (stu_limit >= 1)
);
insert into public.stats_settings(id) values (1) on conflict (id) do nothing;
alter table public.stats_settings enable row level security;
drop policy if exists stats_settings_admin on public.stats_settings;
create policy stats_settings_admin on public.stats_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.trg_error_repeat()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare s record; who uuid; n int; u int; k text; lab text;
begin
  begin
    select * into s from stats_settings where id = 1;
    if s is null or not s.alert_on then return new; end if;
    select id into who from profiles where coalesce(is_admin,false) order by created_at limit 1;
    if who is null then return new; end if;
    k := split_part(coalesce(new.code,''),'-',1)||'-%-'||split_part(coalesce(new.code,''),'-',3);
    select count(*), count(distinct user_id) into n, u from app_errors where code like k and created_at > now() - interval '24 hours' and not resolved;
    if n = s.err_limit then
      lab := 'Erro repetido: '||coalesce(new.code,'?')||' já aconteceu '||n||' vezes em 24 h ('||u||' aluno(s)). Veja em Estatísticas.';
      insert into teacher_events(student_id,kind,label) values (who,'msg',lab);
    elsif s.stu_on and u = s.stu_limit and not exists(select 1 from app_errors e where e.code like k and e.id <> new.id and e.created_at > now() - interval '24 hours' and e.user_id = new.user_id) then
      lab := 'Erro em '||u||' alunos: '||coalesce(new.code,'?')||'. Veja em Estatísticas.';
      insert into teacher_events(student_id,kind,label) values (who,'msg',lab);
    end if;
  exception when others then null;
  end;
  return new;
end $$;
drop trigger if exists app_errors_repeat on public.app_errors;
create trigger app_errors_repeat after insert on public.app_errors for each row execute function public.trg_error_repeat();
