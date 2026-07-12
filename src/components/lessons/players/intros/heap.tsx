"use client";

import type { LessonStep } from "../../LessonPlayer";
import { Snippet } from "../../lessonui";
import { HeapVisualizer } from "../../interactives/HeapVisualizer";

export const heapIntroSteps: LessonStep[] = [
  {
    title: "What's a priority queue?",
    sudo: "ER rules: most urgent goes first.",
    content: (
      <>
        <p>
          Think of a hospital emergency room. Patients aren&apos;t seen in the
          order they arrive — the most urgent one goes first, no matter when
          they walked in.
        </p>
        <p>
          A <span className="text-fg">priority queue</span> works the same way:
          every item has a priority, and the most urgent one always comes out
          next.
        </p>
      </>
    ),
  },
  {
    title: "The heap underneath",
    sudo: "The clever tree doing the heavy lifting.",
    content: (
      <>
        <p>
          A <span className="text-fg">heap</span> is the clever tree that makes
          this fast: it keeps the highest-priority item at the top so you can
          grab it instantly, and re-balances in{" "}
          <span className="text-accent">O(log n)</span> after each change.
        </p>
        <p>
          Schedulers, operating systems, and job queues all run on heaps.
        </p>
      </>
    ),
  },
  {
    title: "Try it yourself",
    sudo: "Serve the top. Urgency always wins.",
    content: (
      <>
        <p className="text-sm text-muted">
          Insert tasks with a priority (lower = more urgent) and hit
          &quot;Serve top&quot; — the most urgent one always leaves first,
          whatever order you added them in.
        </p>
        <HeapVisualizer />
      </>
    ),
  },
  {
    title: "The same thing, in code",
    sudo: "heapq: tiny module, mighty tree.",
    content: (
      <Snippet
        code={`import heapq

pq = []
heapq.heappush(pq, (3, "Backup"))   # (priority, task)
heapq.heappush(pq, (1, "Scan"))
print(heapq.heappop(pq))            # -> (1, "Scan") — most urgent first`}
      />
    ),
  },
  {
    title: "Why hackers care",
    sudo: "Fake a priority, skip every line. Not on our watch.",
    content: (
      <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
        <p>
          Whoever controls priorities controls{" "}
          <span className="font-semibold">what runs first</span> — and what
          never runs at all. Forge a priority of 9999 and your task jumps every
          queue; flood the heap and real work starves. The patterns ahead make
          sure urgency is earned, not claimed.
        </p>
      </div>
    ),
  },
];
