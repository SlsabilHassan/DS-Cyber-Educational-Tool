"use client";

import type { LessonStep } from "../../LessonPlayer";
import { Snippet } from "../../lessonui";
import { HeapVisualizer } from "../../interactives/HeapVisualizer";
import { Quiz } from "@/components/Quiz";
import { OpsCosts, UsesGrid } from "../../FactsPanel";
import { DS_FACTS } from "@/lib/ds-facts";

const FACTS = DS_FACTS["heap-havoc"];

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
          every item carries a priority, and the most urgent one always comes
          out next. It&apos;s a queue that ignores arrival order and obeys
          urgency instead.
        </p>
      </>
    ),
  },
  {
    title: "The heap: a clever half-sorted tree",
    sudo: "Not fully sorted — just sorted enough.",
    content: (
      <>
        <p>
          A <span className="text-fg">heap</span> is the tree that makes this
          fast. Its one rule: every parent is more urgent than its children. So
          the most urgent item is <span className="text-fg">always at the
          top</span> — grab it instantly.
        </p>
        <p>
          The clever part is that a heap is{" "}
          <span className="text-fg">not</span> fully sorted — only that
          parent-beats-children rule holds. Keeping just that much order is
          cheap, which is the whole trick.
        </p>
      </>
    ),
  },
  {
    title: "Heap vs. fully sorted",
    sudo: "Why not just sort everything?",
    lock: true,
    content: (
      <Quiz
        question="Why keep a half-ordered heap instead of a fully sorted list, if you only ever need the most urgent item?"
        options={[
          { text: "A heap uses no memory at all", note: "It uses the same array either way — the win is speed, not space." },
          { text: "Keeping only 'parent beats children' is far cheaper than full sorting", correct: true },
          { text: "Sorted lists can't be searched", note: "They can — but fully re-sorting after every insert is wasteful when you only need the top." },
        ]}
        explain="Fully sorting after every insert is expensive overkill. A heap maintains just enough order — parent beats children — to keep the top reachable, at O(log n) per change instead of re-sorting."
      />
    ),
  },
  {
    title: "Try it yourself",
    sudo: "Serve the top. Urgency always wins.",
    content: (
      <>
        <p className="text-sm text-muted">
          Insert tasks with a priority (lower = more urgent) and hit &quot;Serve
          top&quot; — the most urgent one always leaves first, whatever order you
          added them in.
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
    title: "How fast is it?",
    sudo: "Top in O(1), reshuffles in O(log n).",
    content: (
      <>
        <p>
          Peeking at the most urgent item is{" "}
          <span className="font-mono text-accent">O(1)</span>{" "}
          — it&apos;s always on top. Inserting or removing is{" "}
          <span className="font-mono text-accent">O(log n)</span>: the item
          bubbles up or sifts down just the height of the tree. Finding a random
          item, though, is <span className="font-mono text-amber-400">O(n)</span> —
          a heap only orders the top.
        </p>
        <OpsCosts ops={FACTS.ops} />
      </>
    ),
  },
  {
    title: "Where heaps run quietly",
    sudo: "Your OS uses one right now.",
    content: (
      <>
        <p>Anywhere &quot;what&apos;s most important next?&quot; matters:</p>
        <UsesGrid uses={FACTS.uses} />
      </>
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
          never runs at all. Forge a priority and your task jumps every queue;
          flood the heap and real work starves; corrupt the parent-beats-children
          rule and the whole ordering silently breaks. The patterns ahead make
          sure urgency is earned, not claimed.
        </p>
      </div>
    ),
  },
];
