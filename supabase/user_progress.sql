-- Hacky Stacky — per-account progress.
-- Run once in the Supabase SQL editor (after schema.sql).
--
-- One row per signed-in user, holding the set of solved and solution-revealed
-- challenge keys ("slug/challengeId"). The app merges this with local progress
-- on login, so a learner's solves follow them across devices. Each user can
-- read and write only their own row.

create table if not exists public.user_progress (
  user_id    uuid        primary key references auth.users (id) on delete cascade,
  solved     text[]      not null default '{}',
  revealed   text[]      not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

drop policy if exists "own progress select" on public.user_progress;
create policy "own progress select"
  on public.user_progress for select
  to authenticated using (user_id = auth.uid());

drop policy if exists "own progress insert" on public.user_progress;
create policy "own progress insert"
  on public.user_progress for insert
  to authenticated with check (user_id = auth.uid());

drop policy if exists "own progress update" on public.user_progress;
create policy "own progress update"
  on public.user_progress for update
  to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
