-- Hacky Stacky — pre/post assessment responses.
-- Run once in the Supabase SQL editor (after schema.sql).
--
-- ITEM-LEVEL storage: one row per item a participant answers, so you can do
-- paired pre/post analysis, per-construct learning gain, item difficulty, and
-- confidence-vs-accuracy (metacognition) analysis. Keyed by the same anonymous
-- device_id as the event stream — NO personally identifying information, per
-- the IRB. Insert-only row-level security, exactly like learning_events.

create table if not exists public.assessment_responses (
  id           uuid        primary key default gen_random_uuid(),
  created_at   timestamptz not null    default now(),
  device_id    text        not null,     -- anonymous, matches the event stream
  session_id   text,
  phase        text        not null,     -- 'pre' | 'post' | 'experience'
  form         text,                      -- which counterbalanced form (A/B)
  item_id      text        not null,     -- stable id, lets pre/post items pair up
  construct    text,                      -- concept measured (e.g. 'array-bounds')
  module       text,                      -- module slug, when relevant
  kind         text        not null,     -- 'choice' | 'order' | 'spotbug' | 'likert'
  correct      boolean,                   -- null for self-report (likert) items
  confidence   int,                       -- 1–5 self-rated confidence (null if not asked)
  time_ms      int,                       -- time on the item, milliseconds
  response     jsonb       not null default '{}'::jsonb  -- the raw answer
);

alter table public.assessment_responses enable row level security;

-- Anyone (anonymous, consenting) may INSERT their own responses; nobody can
-- read them back through the public API. Analysis happens from the dashboard
-- or with the service-role key.
drop policy if exists "insert assessment responses" on public.assessment_responses;
create policy "insert assessment responses"
  on public.assessment_responses
  for insert
  to anon, authenticated
  with check (true);

create index if not exists assessment_phase_idx    on public.assessment_responses (phase);
create index if not exists assessment_item_idx     on public.assessment_responses (item_id);
create index if not exists assessment_device_idx   on public.assessment_responses (device_id);
create index if not exists assessment_construct_idx on public.assessment_responses (construct);


-- ── Analysis starters ─────────────────────────────────────────────────
-- Paired learning gain per construct (pre vs post accuracy):
--   select construct,
--          avg((correct)::int) filter (where phase = 'pre')  as pre_acc,
--          avg((correct)::int) filter (where phase = 'post') as post_acc
--   from public.assessment_responses
--   where kind <> 'likert'
--   group by construct
--   order by construct;
--
-- Confidence vs. accuracy (metacognition / overconfidence):
--   select confidence,
--          avg((correct)::int) as accuracy,
--          count(*)            as n
--   from public.assessment_responses
--   where confidence is not null
--   group by confidence
--   order by confidence;
--
-- Item difficulty (proportion correct) and median time:
--   select item_id, phase,
--          avg((correct)::int) as p_correct,
--          percentile_cont(0.5) within group (order by time_ms) as median_ms,
--          count(*) as n
--   from public.assessment_responses
--   where kind <> 'likert'
--   group by item_id, phase
--   order by p_correct;
