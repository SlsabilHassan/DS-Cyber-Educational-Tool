"use client";

import type { LessonStep } from "../../LessonPlayer";
import { Snippet } from "../../lessonui";
import { ArrayVisualizer } from "../../interactives/ArrayVisualizer";

export const arrayIntroSteps: LessonStep[] = [
  {
    title: "What's an array?",
    sudo: "Lockers. It all starts with lockers.",
    content: (
      <>
        <p>
          Think of a row of numbered lockers. Each locker holds one item, and
          you reach any of them instantly if you know its number. You
          don&apos;t walk past the others — you go straight to locker{" "}
          <span className="font-mono text-accent">[3]</span>.
        </p>
        <p>
          That&apos;s an array: a block of slots laid out back-to-back in
          memory, each reached by a numeric{" "}
          <span className="text-fg">index</span> starting at{" "}
          <span className="font-mono text-accent">0</span>.
        </p>
      </>
    ),
  },
  {
    title: "Why arrays are fast",
    sudo: "Instant access. No lines, no waiting.",
    content: (
      <>
        <p>
          Because the slots sit back-to-back, the computer can compute exactly
          where slot <span className="font-mono text-accent">[i]</span> lives
          and jump straight there. Programmers call that{" "}
          <span className="text-accent">O(1)</span> — constant time, no matter
          how big the array is.
        </p>
        <p>
          Almost every other structure you&apos;ll meet in this course — stacks,
          queues, hash tables, heaps — is built on top of arrays.
        </p>
      </>
    ),
  },
  {
    title: "Try it yourself",
    sudo: "Click around. Arrays don't bite. Usually.",
    content: (
      <>
        <p className="text-sm text-muted">
          Insert values (they fill from index 0), then click a cell to remove
          it and watch the rest shift left.
        </p>
        <ArrayVisualizer />
      </>
    ),
  },
  {
    title: "The same thing, in code",
    sudo: "Five slots, zero drama.",
    content: (
      <>
        <p>
          In Python, a list of fixed size works like a classic array — jump to
          any index directly:
        </p>
        <Snippet
          code={`data = [None] * 5       # 5 slots: indices 0..4
data[0] = "Alice"       # O(1) — jump straight to slot 0
data[1] = "Bob"
print(data[1])          # -> "Bob"`}
        />
      </>
    ),
  },
  {
    title: "Why hackers care",
    sudo: "And THIS is why we bounds-check.",
    content: (
      <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
        <p>
          That instant, direct access is exactly why a bad index is dangerous:
          ask for locker <span className="font-mono">[500]</span> in a row of 5
          and the computer happily reaches into memory that{" "}
          <span className="font-semibold">isn&apos;t yours</span>. Out-of-bounds
          reads and writes are behind some of the most famous exploits in
          history.
        </p>
      </div>
    ),
  },
];
