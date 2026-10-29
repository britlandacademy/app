-- "Já paguei": o aluno avisa que pagou e anexa o comprovante; o professor confere em Pagamentos.
create table if not exists public.pay_claims (
  id bigint generated always as identity primary key,
  charge_id bigint not null references public.charges(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  method text not null default 'Outro',
  proof_path text,
  status text not null default 'pendente',
  created_at timestamptz not null default now()
);
create index if not exists pay_claims_status_idx on public.pay_claims (status);
alter table public.pay_claims enable row level security;
drop policy if exists pay_claims_admin on public.pay_claims;
drop policy if exists pay_claims_own_sel on public.pay_claims;
drop policy if exists pay_claims_own_ins on public.pay_claims;
create policy pay_claims_admin on public.pay_claims for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy pay_claims_own_sel on public.pay_claims for select to authenticated using (user_id = auth.uid());
create policy pay_claims_own_ins on public.pay_claims for insert to authenticated with check (user_id = auth.uid() and status = 'pendente');
revoke all on public.pay_claims from anon;

insert into storage.buckets (id, name, public) values ('proofs', 'proofs', false) on conflict (id) do nothing;
drop policy if exists proofs_ins on storage.objects;
drop policy if exists proofs_sel on storage.objects;
create policy proofs_ins on storage.objects for insert to authenticated
  with check (bucket_id = 'proofs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy proofs_sel on storage.objects for select to authenticated
  using (bucket_id = 'proofs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- aviso (push) ao professor, sempre em português
create or replace function public.trg_claim_event()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare who uuid; fn text;
begin
  begin
    select id into who from profiles where coalesce(is_admin,false) limit 1;
    select split_part(trim(coalesce(name,'')),' ',1) into fn from profiles where id=new.user_id;
    if who is not null then
      insert into teacher_events(student_id,kind,label) values(who,'msg','Pagamento informado'||coalesce(' por '||nullif(fn,''),'')||' (conferir em Pagamentos)');
    end if;
  exception when others then null;
  end;
  return new;
end $$;
drop trigger if exists pay_claims_event on public.pay_claims;
create trigger pay_claims_event after insert on public.pay_claims for each row execute function public.trg_claim_event();
