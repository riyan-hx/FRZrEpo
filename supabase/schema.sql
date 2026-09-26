-- Lumid HQ cloud sync: one row per user holding the full dataset.
create table if not exists public.hq_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- Row Level Security: each signed-in user can only see and change their own row.
alter table public.hq_state enable row level security;

drop policy if exists "hq_state_select_own" on public.hq_state;
drop policy if exists "hq_state_insert_own" on public.hq_state;
drop policy if exists "hq_state_update_own" on public.hq_state;

create policy "hq_state_select_own" on public.hq_state
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "hq_state_insert_own" on public.hq_state
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "hq_state_update_own" on public.hq_state
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
