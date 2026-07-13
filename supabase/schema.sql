-- Hacky Stacky — research event logging schema.
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
--
-- It creates a single append-only table of learning events. Visitors (signed
-- in or anonymous) may INSERT their own rows; nobody can read them back
-- through the public API. You read/export the data from the Supabase
-- dashboard or with the service-role key — see the queries at the bottom.

create table if not exists public.learning_events (
  id           uuid        primary key default gen_random_uuid(),
  created_at   timestamptz not null    default now(),
  user_id      uuid        references auth.users (id) on delete set null,
  device_id    text        not null,     -- random per-browser id (no PII)
  session_id   text,                      -- random per-session id
  event_type   text        not null,     -- e.g. challenge_attempt, quiz_answer
  module       text,                      -- module slug, when relevant
  challenge_id text,                      -- challenge id, when relevant
  payload      jsonb       not null default '{}'::jsonb
);

alter table public.learning_events enable row level security;

-- Anyone may INSERT, but only rows attributed to themselves (or anonymous).
drop policy if exists "insert own events" on public.learning_events;
create policy "insert own events"
  on public.learning_events
  for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

-- No SELECT/UPDATE/DELETE policies exist, so the public API can't read or
-- change events. Analysis happens via the dashboard or the service role key.

create index if not exists learning_events_type_idx    on public.learning_events (event_type);
create index if not exists learning_events_module_idx  on public.learning_events (module);
create index if not exists learning_events_created_idx on public.learning_events (created_at);
create index if not exists learning_events_user_idx    on public.learning_events (user_id);


-- ── Handy research queries ────────────────────────────────────────────────
-- (run these later in the SQL editor to see your data)

-- Challenge funnel: attempts vs. solves per challenge.
--   select module, challenge_id,
--          count(*) filter (where event_type = 'challenge_attempt')            as attempts,
--          count(*) filter (where event_type = 'challenge_attempt'
--                             and (payload->>'passed')::boolean)               as passing_runs,
--          count(distinct device_id) filter (where event_type = 'challenge_solved') as solvers
--   from public.learning_events
--   group by module, challenge_id
--   order by module, challenge_id;

-- Where learners lean on help.
--   select module, challenge_id, event_type, count(*)
--   from public.learning_events
--   where event_type in ('hint_reveal', 'solution_reveal')
--   group by module, challenge_id, event_type
--   order by count desc;

-- Most-missed quiz questions.
--   select payload->>'question' as question,
--          count(*) filter (where (payload->>'correct')::boolean is false) as misses,
--          count(*)                                                        as answers
--   from public.learning_events
--   where event_type = 'quiz_answer'
--   group by question
--   order by misses desc;
