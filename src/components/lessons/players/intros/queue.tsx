"use client";

import type { LessonStep } from "../../LessonPlayer";
import { Snippet } from "../../lessonui";
import { QueueVisualizer } from "../../interactives/QueueVisualizer";

export const queueIntroSteps: LessonStep[] = [
  {
    title: "What's a queue?",
    sudo: "Coffee-shop rules: no cutting!",
    content: (
      <>
        <p>
          Imagine the line at a coffee shop. The first person to join the line
          is the first person served; new people join at the{" "}
          <span className="text-fg">back</span>. Nobody cuts.
        </p>
        <p>
          That&apos;s a queue: the{" "}
          <span className="text-fg">first thing in is the first thing out</span>{" "}
          — programmers call it <span className="text-accent">FIFO</span>.
        </p>
      </>
    ),
  },
  {
    title: "Two moves: enqueue and dequeue",
    sudo: "Join the back, leave from the front.",
    content: (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <div className="font-mono text-sm text-accent">enqueue</div>
          <p className="mt-1 text-sm text-muted">
            Join the back of the line.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <div className="font-mono text-sm text-accent">dequeue</div>
          <p className="mt-1 text-sm text-muted">
            Serve (and remove) whoever is at the front.
          </p>
        </div>
      </div>
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
          Python&apos;s <span className="font-mono text-accent">deque</span>{" "}
          gives you a fast queue out of the box:
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
    title: "Why hackers care",
    sudo: "Queues hold the goods. Guard them.",
    content: (
      <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
        <p>
          Queues run the world quietly: print jobs, network packets, payment
          requests, task schedulers. Because they sit{" "}
          <span className="font-semibold">between</span> producers and
          consumers — often holding sensitive work — attackers flood them,
          replay their messages, and fake their priorities. The patterns ahead
          stop all three.
        </p>
      </div>
    ),
  },
];
