-- Atlas initial schema (CLAUDE.md §6, §7, §11).
-- The schema is the SOURCE OF TRUTH. Every table is owner-locked by RLS.
-- Enumerated columns use TEXT + CHECK (per §6, which specifies TEXT columns),
-- so the generated TS types surface them as `string`; the app's @atlas/core
-- string-literal unions are the richer domain layer over them.

-- ───────────────────────────── Tables ──────────────────────────────────────

-- profiles: 1:1 with auth.users. Defaults: language 'fr', currency 'CAD' (§6).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  language text not null default 'fr',
  currency text not null default 'CAD',
  week_start text not null default 'sunday',
  reminder_lead_days integer not null default 3,
  push_enabled boolean not null default false,
  quiet_hours_start text,
  quiet_hours_end text,
  avatar_initials text,
  created_at timestamptz not null default now()
);

create table public.entities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (
    type in ('home', 'car', 'pet', 'subscription', 'account', 'bank', 'insurance', 'health')
  ),
  name text not null,
  icon text,
  color text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- obligations: the core unit (§6).
create table public.obligations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entity_id uuid references public.entities (id) on delete set null,
  title text not null,
  description text,
  type text not null default 'task' check (
    type in ('bill', 'renewal', 'appointment', 'deadline', 'task')
  ),
  amount numeric,
  currency text not null default 'CAD',
  due_date date,
  status text not null default 'open' check (
    status in ('open', 'done', 'snoozed', 'dismissed', 'automated')
  ),
  priority text not null default 'medium' check (
    priority in ('low', 'medium', 'high', 'urgent')
  ),
  source text not null default 'manual' check (
    source in ('manual', 'seed', 'scan', 'recurrence')
  ),
  snoozed_until timestamptz,
  resolved_at timestamptz,
  resolved_method text check (resolved_method in ('paid', 'automated', 'dismissed')),
  resolution_note text,
  vendor text,
  recurrence text not null default 'none' check (
    recurrence in ('none', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')
  ),
  auto_paid boolean not null default false,
  paying_account text,
  created_at timestamptz not null default now()
);

create table public.obligation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  obligation_id uuid references public.obligations (id) on delete cascade,
  action text not null check (
    action in ('created', 'resolved', 'snoozed', 'automated', 'dismissed')
  ),
  amount numeric,
  occurred_at timestamptz not null default now(),
  note text
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entity_id uuid references public.entities (id) on delete set null,
  period text not null default 'monthly',
  limit_amount numeric not null
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entity_id uuid references public.entities (id) on delete set null,
  obligation_id uuid references public.obligations (id) on delete set null,
  name text not null,
  file_url text,
  kind text not null default 'document',
  storage_path text
);

create table public.automations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  obligation_id uuid references public.obligations (id) on delete cascade,
  entity_id uuid references public.entities (id) on delete set null,
  kind text not null default 'reminder',
  config jsonb,
  status text not null default 'active'
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  purpose text not null,
  policy_version text,
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz
);

-- ───────────────────────────── Indexes ─────────────────────────────────────
create index entities_user_id_idx on public.entities (user_id);
create index obligations_user_id_idx on public.obligations (user_id);
create index obligations_user_status_idx on public.obligations (user_id, status);
create index obligations_user_due_idx on public.obligations (user_id, due_date);
create index obligation_events_user_id_idx on public.obligation_events (user_id);
create index obligation_events_obligation_id_idx on public.obligation_events (obligation_id);
create index budgets_user_id_idx on public.budgets (user_id);
create index documents_user_id_idx on public.documents (user_id);
create index automations_user_id_idx on public.automations (user_id);
create index consents_user_id_idx on public.consents (user_id);

-- ─────────────────── Row Level Security (§11.3 — owner-locked) ──────────────
alter table public.profiles enable row level security;
alter table public.entities enable row level security;
alter table public.obligations enable row level security;
alter table public.obligation_events enable row level security;
alter table public.budgets enable row level security;
alter table public.documents enable row level security;
alter table public.automations enable row level security;
alter table public.consents enable row level security;

-- profiles are keyed by id (= auth.uid()); every other table by user_id.
create policy "Users manage own profile" on public.profiles
  for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage own rows" on public.entities
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own rows" on public.obligations
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own rows" on public.obligation_events
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own rows" on public.budgets
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own rows" on public.documents
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own rows" on public.automations
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own rows" on public.consents
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────── handle_new_user(): seed 5 entities + 10 obligations (§3, §6) ───
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  home_id uuid;
  car_id uuid;
  pet_id uuid;
  subs_id uuid;
  acct_id uuid;
begin
  -- Profile with defaults (language 'fr', currency 'CAD').
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));

  -- 5 default entities (Home, Car, Pet, Subscriptions, Accounts).
  insert into public.entities (user_id, type, name, icon, color)
    values (new.id, 'home', 'Home', 'House', '#2563EB') returning id into home_id;
  insert into public.entities (user_id, type, name, icon, color)
    values (new.id, 'car', 'Car', 'Car', '#0D9488') returning id into car_id;
  insert into public.entities (user_id, type, name, icon, color)
    values (new.id, 'pet', 'Pet', 'PawPrint', '#F59E0B') returning id into pet_id;
  insert into public.entities (user_id, type, name, icon, color)
    values (new.id, 'subscription', 'Subscriptions', 'CreditCard', '#7C3AED') returning id into subs_id;
  insert into public.entities (user_id, type, name, icon, color)
    values (new.id, 'account', 'Accounts', 'Wallet', '#16A34A') returning id into acct_id;

  -- 10 sample obligations (source 'seed'), spread across statuses/proximities.
  insert into public.obligations
    (user_id, entity_id, title, type, amount, due_date, priority, source, recurrence, auto_paid, vendor, paying_account)
  values
    (new.id, home_id, 'Rent', 'bill', 1500, current_date + 3, 'high', 'seed', 'monthly', false, 'Landlord', null),
    (new.id, home_id, 'Hydro bill', 'bill', 90.50, current_date + 6, 'medium', 'seed', 'monthly', false, 'Hydro-Québec', null),
    (new.id, home_id, 'Property tax', 'bill', 800, current_date + 25, 'medium', 'seed', 'quarterly', false, 'City', null),
    (new.id, car_id, 'Car insurance', 'renewal', 1200, current_date + 12, 'medium', 'seed', 'yearly', true, 'Insurer', 'Visa •4242'),
    (new.id, car_id, 'Oil change', 'appointment', 80, current_date - 2, 'high', 'seed', 'none', false, 'Garage', null),
    (new.id, pet_id, 'Vet checkup', 'appointment', 150, current_date + 40, 'low', 'seed', 'yearly', false, 'Vet Clinic', null),
    (new.id, subs_id, 'Netflix', 'renewal', 16.99, current_date + 5, 'low', 'seed', 'monthly', true, 'Netflix', 'Visa •4242'),
    (new.id, subs_id, 'Spotify', 'renewal', 10.99, current_date + 9, 'low', 'seed', 'monthly', true, 'Spotify', 'Mastercard •8888'),
    (new.id, acct_id, 'Credit card payment', 'bill', 250, current_date + 1, 'urgent', 'seed', 'monthly', false, 'Visa', null),
    (new.id, null, 'Passport renewal', 'deadline', null, current_date + 60, 'low', 'seed', 'none', false, 'Service Canada', null);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────── delete_my_account_data(): Law-25 erasure path (§6, §11.5) ──────
create or replace function public.delete_my_account_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  delete from public.obligation_events where user_id = uid;
  delete from public.automations where user_id = uid;
  delete from public.documents where user_id = uid;
  delete from public.budgets where user_id = uid;
  delete from public.consents where user_id = uid;
  delete from public.obligations where user_id = uid;
  delete from public.entities where user_id = uid;
  delete from public.profiles where id = uid;
end;
$$;

grant execute on function public.delete_my_account_data() to authenticated;

-- ─────────── Storage: private `scans` bucket, owner-folder scoped (§6) ──────
insert into storage.buckets (id, name, public)
values ('scans', 'scans', false)
on conflict (id) do nothing;

-- Path is {user_id}/{uuid}.jpg — first folder segment must be the owner.
create policy "Users manage own scans" on storage.objects
  for all to authenticated
  using (bucket_id = 'scans' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'scans' and (storage.foldername(name))[1] = auth.uid()::text);
