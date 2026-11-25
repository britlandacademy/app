-- Promoções automáticas: indicação (crédito) e dupla (desconto fixo por plano). Rodar em CADA projeto (inglês e espanhol).
-- Regras: ver claude/planos-e-precos.md (projeto Britland Academy - App).
create table if not exists public.promo_links (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('indicacao','dupla')),
  owner_id uuid not null references public.profiles(id) on delete cascade,   -- quem indicou / quem trouxe o parceiro
  partner_id uuid not null references public.profiles(id) on delete cascade, -- o indicado / o parceiro da dupla
  active boolean not null default true,
  credited boolean not null default false,
  created_at timestamptz not null default now(),
  check (owner_id <> partner_id)
);
-- um aluno novo gera um benefício só
create unique index if not exists promo_links_partner_uq on public.promo_links (partner_id);

create table if not exists public.promo_credits (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  link_id bigint references public.promo_links(id) on delete set null,
  currency text not null,
  amount numeric(12,2) not null check (amount > 0),
  used numeric(12,2) not null default 0,
  expires_at date not null default (current_date + 90),
  used_charge_id bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.promo_rates (
  tier text not null, currency text not null, amount numeric(12,2) not null,
  primary key (tier, currency)
);
insert into public.promo_rates (tier, currency, amount) values
  ('essential','EUR',8),('fluency','EUR',20),('vip','EUR',35),
  ('essential','BRL',50),('fluency','BRL',125),('vip','BRL',215)
on conflict (tier, currency) do update set amount = excluded.amount;

alter table public.charges add column if not exists promo_off numeric(12,2) not null default 0;
alter table public.charges add column if not exists promo_desc text;
alter table public.charges add column if not exists promo_dupla numeric(12,2) not null default 0;
alter table public.charges add column if not exists promo_credit numeric(12,2) not null default 0;

alter table public.promo_links enable row level security;
alter table public.promo_credits enable row level security;
alter table public.promo_rates enable row level security;
drop policy if exists promo_links_admin on public.promo_links;
drop policy if exists promo_links_own on public.promo_links;
drop policy if exists promo_credits_admin on public.promo_credits;
drop policy if exists promo_credits_own on public.promo_credits;
drop policy if exists promo_rates_admin on public.promo_rates;
drop policy if exists promo_rates_read on public.promo_rates;
create policy promo_links_admin on public.promo_links for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy promo_links_own on public.promo_links for select to authenticated using (owner_id = auth.uid() or partner_id = auth.uid());
create policy promo_credits_admin on public.promo_credits for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy promo_credits_own on public.promo_credits for select to authenticated using (user_id = auth.uid());
create policy promo_rates_admin on public.promo_rates for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy promo_rates_read on public.promo_rates for select to authenticated using (true);
revoke all on public.promo_links, public.promo_credits, public.promo_rates from anon;

create or replace function public.promo_tier(p text) returns text language sql immutable as $$
  select case when lower(coalesce(p,'')) like 'essential%' then 'essential'
              when lower(coalesce(p,'')) like 'fluency%' then 'fluency'
              when lower(coalesce(p,'')) like 'vip intensive%' then 'vip' end $$;

-- ao gerar uma mensalidade: aplica o desconto da dupla (teto 20%) e depois os créditos de indicação disponíveis
create or replace function public.trg_charge_promos() returns trigger language plpgsql security definer set search_path to 'public' as $$
declare s record; l record; c record; r numeric; dd numeric := 0; cr numeric := 0; tot numeric; rem numeric; u numeric; txt text := '';
begin
  begin
    if new.sub_id is null or new.paid_on is not null then return null; end if;
    select * into s from subs where id = new.sub_id;
    if not found or s.user_id is null then return null; end if;
    select pl.* into l from promo_links pl
      where pl.kind = 'dupla' and pl.active and (pl.owner_id = s.user_id or pl.partner_id = s.user_id)
        and exists (select 1 from subs a where a.user_id = pl.owner_id and coalesce(a.active, true))
        and exists (select 1 from subs b where b.user_id = pl.partner_id and coalesce(b.active, true))
      limit 1;
    if found then
      select amount into r from promo_rates where tier = promo_tier(s.plan) and currency = new.currency;
      if r is not null then dd := least(r, round(new.amount * 0.20, 2)); txt := 'Dupla -' || dd; end if;
    end if;
    rem := new.amount - dd;
    for c in select * from promo_credits where user_id = s.user_id and currency = new.currency and amount > used and expires_at >= current_date order by expires_at, id loop
      exit when rem <= 0;
      u := least(c.amount - c.used, rem);
      update promo_credits set used = used + u, used_charge_id = new.id where id = c.id;
      rem := rem - u; cr := cr + u;
    end loop;
    if cr > 0 then txt := case when txt = '' then '' else txt || ' · ' end || 'Crédito de indicação -' || cr; end if;
    tot := dd + cr;
    if tot > 0 then
      update charges set amount = new.amount - tot, promo_off = tot, promo_dupla = dd, promo_credit = cr, promo_desc = txt,
        paid_on = case when new.amount - tot <= 0 then current_date else null end,
        note = case when new.amount - tot <= 0 then 'Quitada por crédito de indicação' else note end
      where id = new.id;
    end if;
  exception when others then null;
  end;
  return null;
end $$;
drop trigger if exists charges_promos on public.charges;
create trigger charges_promos after insert on public.charges for each row execute function public.trg_charge_promos();

-- libera o crédito de indicação quando o indicado paga a 2ª mensalidade
create or replace function public.trg_promo_release() returns trigger language plpgsql security definer set search_path to 'public' as $$
declare s record; l record; os record; npaid int; tier text; price numeric; amt numeric; adm uuid; nm1 text; nm2 text;
begin
  begin
    if new.sub_id is null then return null; end if;
    select * into s from subs where id = new.sub_id;
    select * into l from promo_links where kind = 'indicacao' and active and not credited and partner_id = s.user_id limit 1;
    if not found then return null; end if;
    select count(*) into npaid from charges c join subs x on x.id = c.sub_id where x.user_id = s.user_id and c.paid_on is not null and c.paid_on >= l.created_at::date;
    if npaid < 2 then return null; end if;
    select id into adm from profiles where coalesce(is_admin, false) order by created_at limit 1;
    select split_part(trim(coalesce(name,'')),' ',1) into nm1 from profiles where id = l.owner_id;
    select split_part(trim(coalesce(name,'')),' ',1) into nm2 from profiles where id = l.partner_id;
    select * into os from subs where user_id = l.owner_id and coalesce(active, true) order by created_at desc limit 1;
    if not found then
      if adm is not null then insert into teacher_events(student_id, kind, label) values (adm, 'msg', 'Indicação de '||coalesce(nm1,'aluno')||' (indicou '||coalesce(nm2,'aluno')||') liberada, mas o indicador não tem mensalidade ativa: decidir o crédito'); end if;
      return null;
    end if;
    tier := promo_tier(s.plan); price := null;
    if tier is not null and to_regclass('public.billing_plans') is not null then
      select valor_centavos / 100.0 into price from billing_plans
        where lower(nome) = case tier when 'essential' then 'essential' when 'fluency' then 'fluency club' else 'vip intensive' end and moeda = os.currency limit 1;
    end if;
    if price is null and s.currency = os.currency then price := s.amount; end if;
    if price is null then
      if adm is not null then insert into teacher_events(student_id, kind, label) values (adm, 'msg', 'Indicação de '||coalesce(nm1,'aluno')||' liberada, mas o valor não pôde ser calculado: definir o crédito'); end if;
      return null;
    end if;
    amt := least(price, os.amount);
    insert into promo_credits(user_id, link_id, currency, amount) values (l.owner_id, l.id, os.currency, amt);
    update promo_links set credited = true where id = l.id;
    if adm is not null then insert into teacher_events(student_id, kind, label) values (adm, 'msg', 'Crédito de indicação liberado para '||coalesce(nm1,'aluno')||': '||amt||' '||os.currency||' (indicou '||coalesce(nm2,'aluno')||')'); end if;
  exception when others then null;
  end;
  return null;
end $$;
drop trigger if exists charges_promo_release on public.charges;
create trigger charges_promo_release after update of paid_on on public.charges for each row when (old.paid_on is null and new.paid_on is not null) execute function public.trg_promo_release();
