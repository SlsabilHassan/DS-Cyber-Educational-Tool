"use client";

import type { LessonStep } from "../../LessonPlayer";
import { Snippet } from "../../lessonui";
import { QueueVisualizer } from "../../interactives/QueueVisualizer";
import { Quiz } from "@/components/Quiz";
import { OpsCosts, UsesGrid } from "../../FactsPanel";
import { DS_FACTS } from "@/lib/ds-facts";

const FACTS = DS_FACTS["queue-quarantine"];

export const queueIntroSteps: LessonStep[] = [
  {
    title: "What's a queue?",
    sudo: "Coffee-shop rules: no cutting!",
    content: (
      <>
        <p>
          Imagine the line at a coffee shop. The first person to join is the
          first person served; new people join at the{" "}
          <span className="text-fg">back</span>. Nobody cuts.
        </p>
        <p>
          That&apos;s a queue: the{" "}
          <span className="text-fg">first thing in is the first thing out</span>{" "}
          — programmers call it <span className="text-accent">FIFO</span>. It&apos;s
          the exact opposite of a stack&apos;s LIFO.
        </p>
      </>
    ),
  },
  {
    title: "Two moves: enqueue and dequeue",
    sudo: "Join the back, leave from the front.",
    content: (
      <>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface-2 p-4">
            <div className="font-mono text-sm text-accent">enqueue</div>
            <p className="mt-1 text-sm text-muted">Join the back of the line.</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-2 p-4">
            <div className="font-mono text-sm text-accent">dequeue</div>
            <p className="mt-1 text-sm text-muted">
              Serve (and remove) whoever is at the front.
            </p>
          </div>
        </div>
        <p className="text-sm text-muted">
          A queue tracks <span className="text-fg">two</span> markers — a{" "}
          <span className="font-mono">head</span> (front) and a{" "}
          <span className="font-mono">tail</span> (back) — where a stack only
          needed one.
        </p>
      </>
    ),
  },
  {
    title: "Stack or queue?",
    sudo: "LIFO vs FIFO — don't mix them up!",
    lock: true,
    content: (
      <Quiz
        question="You enqueue X, then Y, then Z into a queue. You dequeue once. What comes out?"
        options={[
          { text: "Z — the newest", note: "That's stack behavior (LIFO). A queue serves the oldest first." },
          { text: "X — the oldest", correct: true },
          { text: "Y — the middle", note: "Queues never reach into the middle — the front is X, so X leaves first." },
        ]}
        explain="X joined first, so it's at the front and leaves first. First in, first out — the opposite of a stack."
      />
    ),
  },
  {
    title: "Try it yourself",
    sudo: "Enqueue a few, then dequeue. Oldest wins.",
    content: (
      <>
        <p className="text-sm text-muted">
          The <span className="text-fg">oldest</span> item always leaves first.
        </p>
        <QueueVisualizer />
      </>
    ),
  },
  {
    title: "The same thing, in code",
    sudo: "deque: like 'deck', not 'de-queue-ee'.",
    content: (
      <>
        <p>
          Python&apos;s <span className="font-mono text-accent">deque</span> gives
          you a queue where both ends are fast:
        </p>
        <Snippet
          code={`from collections import deque

q = deque()
q.append("job-1")     # enqueue (join the back)
q.append("job-2")
first = q.popleft()   # dequeue -> "job-1" (first in, first out)`}
        />
      </>
    ),
  },
  {
    title: "How fast is it?",
    sudo: "Both ends O(1) — that's the trick.",
    content: (
      <>
        <p>
          A good queue makes <span className="text-fg">both</span> ends{" "}
          <span className="font-mono text-accent">O(1)</span>{" "}
          by tracking head and tail separately — no shifting, ever. Searching is the slow part,
          and that&apos;s fine: queues are for <span className="text-fg">waiting
          in line</span>, not for looking things up.
        </p>
        <OpsCosts ops={FACTS.ops} />
      </>
    ),
  },
  {
    title: "Where you've met a queue",
    sudo: "The internet basically runs on these.",
    content: (
      <>
        <p>Anything that waits its turn is probably a queue:</p>
        <UsesGrid uses={FACTS.uses} />
      </>
    ),
  },
  {
    title: "Why hackers care",
    sudo: "Queues hold the goods. Guard them.",
    content: (
      <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
        <p>
          Queues sit <span className="font-semibold">between</span> producers
          and consumers — often holding sensitive work in transit. Attackers
          flood them until memory runs out (denial of service), replay the same
          message twice, or forge a &quot;high priority&quot; to jump the line.
          The patterns ahead shut down all three.
        </p>
      </div>
    ),
  },
];
