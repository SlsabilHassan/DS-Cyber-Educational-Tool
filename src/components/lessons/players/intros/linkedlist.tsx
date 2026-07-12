"use client";

import type { LessonStep } from "../../LessonPlayer";
import { Snippet } from "../../lessonui";
import { LinkedListVisualizer } from "../../interactives/LinkedListVisualizer";

export const linkedListIntroSteps: LessonStep[] = [
  {
    title: "What's a linked list?",
    sudo: "All aboard the pointer train. 🚂",
    content: (
      <>
        <p>
          Think of a train. Each car holds some cargo and a coupling to the{" "}
          <span className="text-fg">next</span> car. To find a car you start at
          the front and follow the couplings one by one.
        </p>
        <p>
          That&apos;s a linked list: a chain of{" "}
          <span className="text-fg">nodes</span>, each holding a value and a{" "}
          <span className="font-mono text-accent">next</span> pointer to the
          following node. The last node points to{" "}
          <span className="font-mono text-accent">null</span>.
        </p>
      </>
    ),
  },
  {
    title: "Why bother with pointers?",
    sudo: "Re-hook one coupling. Done. No shifting.",
    content: (
      <>
        <p>
          Unlike an array, nodes can live{" "}
          <span className="text-fg">anywhere</span> in memory. Add or remove a
          node by re-hooking a single coupling — no need to shift everything
          else over.
        </p>
        <p>
          The price: no instant jumps. To reach the 50th node you walk through
          the 49 before it, pointer by pointer.
        </p>
      </>
    ),
  },
  {
    title: "Try it yourself",
    sudo: "Watch the next pointers rewire!",
    content: (
      <>
        <p className="text-sm text-muted">
          Append nodes to the end, remove from the head, and watch the{" "}
          <span className="text-fg">next</span> pointers rewire.
        </p>
        <LinkedListVisualizer />
      </>
    ),
  },
  {
    title: "The same thing, in code",
    sudo: "A node is just a value plus an arrow.",
    content: (
      <Snippet
        code={`class Node:
    def __init__(self, value):
        self.value = value
        self.next = None      # points to the next node (or None)

a = Node("Alice")
a.next = Node("Bob")          # Alice -> Bob -> None`}
      />
    ),
  },
  {
    title: "Why hackers care",
    sudo: "Dangling pointers = attacker candy.",
    content: (
      <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
        <p>
          All of a linked list&apos;s power — and all of its danger — lives in
          those pointers. Splice in a fake node and every traversal visits it.
          Loop the chain and traversals never end. Keep a reference to a
          &quot;removed&quot; node and its secrets are still readable — the
          famous <span className="font-semibold">use-after-free</span> family
          of bugs.
        </p>
      </div>
    ),
  },
];
