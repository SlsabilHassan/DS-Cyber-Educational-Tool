-- Hacky Stacky — leaderboard table.
-- Run this once in the Supabase SQL editor (after schema.sql).
--
-- One row per signed-in user. Stats (challenges solved, modules crashed, day
-- streak) are kept up to date by the app. A user only appears publicly when
-- they OPT IN and choose a handle — real names are never shown here.

create table if not exists public.leaderboard (
  user_id           uuid        primary key references auth.users (id) on delete cascade,
  handle            text        unique,          -- chosen nickname (public)
  opted_in          boolean     not null default false,
  challenges_solved int         not null default 0,
  modules_crashed   int         not null default 0,  -- modules with all challenges solved
  day_streak        int         not null default 0,
  last_active_date  date,                          -- for streak math
  updated_at        timestamptz not null default now()
);

alter table public.leaderboard enable row level security;

-- PUBLIC READ, but only rows the user chose to show. Real names live in the
-- separate auth table and are never exposed here.
drop policy if exists "read opted-in rows" on public.leaderboard;
create policy "read opted-in rows"
  on public.leaderboard
  for select
  to anon, authenticated
  using (opted_in = true);

-- A signed-in user may create and update only their OWN row.
drop policy if exists "insert own row" on public.leaderboard;
create policy "insert own row"
  on public.leaderboard
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "update own row" on public.leaderboard;
create policy "update own row"
  on public.leaderboard
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists leaderboard_rank_idx
  on public.leaderboard (challenges_solved desc, modules_crashed desc, day_streak desc);
