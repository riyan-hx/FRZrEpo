-- The Forge database: synced data, trials and subscriptions.
-- Safe to run more than once (Supabase → SQL Editor → paste → Run).

-- ---------------------------------------------------------------------------
-- Synced app data: one row per user holding the full dataset.
-- ---------------------------------------------------------------------------
create table if not exists public.hq_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Plans. Every new account gets a 14-day trial automatically. Only the
-- payment webhook (service role) changes a row after that — users can read
-- their own row but never write it.
-- status: trialing (our free trial) or a Lemon Squeezy subscription status:
--         on_trial, active, paused, past_due, unpaid, cancelled, expired
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  user_id            uuid primary key references auth.users (id) on delete cascade,
  status             text not null default 'trialing',
  trial_ends_at      timestamptz not null default (now() + interval '14 days'),
  current_period_end timestamptz,
  provider           text,
  customer_id        text,
  subscription_id    text,
  variant_id         text,
  portal_url         text,
  update_payment_url text,
  updated_at         timestamptz not null default now()
);

-- Does this user currently have Pro (trial or paid)?
create or replace function public.has_access(uid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions s
    where s.user_id = uid
      and (
        s.status in ('active', 'on_trial', 'past_due')
        or (s.status = 'trialing' and s.trial_ends_at > now())
        or (s.status = 'cancelled' and coalesce(s.current_period_end, now()) > now())
      )
  );
$$;

-- Start a trial for every new account.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.subscriptions (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keeps the trial length right on databases created with an older version of this script.
alter table public.subscriptions alter column trial_ends_at set default (now() + interval '14 days');

-- Accounts created before this script ran also get a trial.
insert into public.subscriptions (user_id) select id from auth.users on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.hq_state enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "hq_state_select_own" on public.hq_state;
drop policy if exists "hq_state_insert_own" on public.hq_state;
drop policy if exists "hq_state_update_own" on public.hq_state;

-- Users can always read their own data (so nothing is ever held hostage)…
create policy "hq_state_select_own" on public.hq_state
  for select to authenticated using ((select auth.uid()) = user_id);
-- …but can only write it while they have Pro. This is the paywall.
create policy "hq_state_insert_own" on public.hq_state
  for insert to authenticated
  with check ((select auth.uid()) = user_id and public.has_access((select auth.uid())));
create policy "hq_state_update_own" on public.hq_state
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and public.has_access((select auth.uid())));

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);
-- No insert/update/delete policies on subscriptions: only the trigger above and
-- the payment webhook (service role, which bypasses RLS) write to it.
