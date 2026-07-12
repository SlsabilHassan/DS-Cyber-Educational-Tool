"use client";

import type { LessonStep } from "../../LessonPlayer";
import { Snippet } from "../../lessonui";
import { LinkedListVisualizer } from "../../interactives/LinkedListVisualizer";
import { Quiz } from "@/components/Quiz";
import { OpsCosts, UsesGrid } from "../../FactsPanel";
import { DS_FACTS } from "@/lib/ds-facts";

const FACTS = DS_FACTS["linked-labyrinth"];

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
    title: "Array vs. linked list",
    sudo: "Two ways to hold a sequence.",
    content: (
      <>
        <p>
          Both store a sequence, but they make{" "}
          <span className="text-fg">opposite trade-offs</span>. An array is one
          solid block with instant index access. A linked list is scattered
          nodes tied together by pointers:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface-2 p-4">
            <div className="text-sm font-semibold text-fg">Array</div>
            <p className="mt-1 text-sm text-muted">
              Instant jump to <span className="font-mono">[i]</span>, but
              inserting in the middle shifts everything.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface-2 p-4">
            <div className="text-sm font-semibold text-fg">Linked list</div>
            <p className="mt-1 text-sm text-muted">
              Insert anywhere by re-hooking one pointer, but reaching the k-th
              node means walking there.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    title: "Which structure fits?",
    sudo: "Match the job to the tool.",
    lock: true,
    content: (
      <Quiz
        question="You constantly insert and delete items in the middle of a long sequence, but rarely jump to 'item number k'. Which is better?"
        options={[
          { text: "An array", note: "Every middle insert would shift thousands of elements — the array's weak spot." },
          { text: "A linked list", correct: true },
          { text: "Neither can do it", note: "Both can — but one is far cheaper for middle edits." },
        ]}
        explain="Linked lists shine exactly here: re-hook a pointer or two and the insert is done, no shifting. The price is losing instant index access — which you said you rarely need."
      />
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
    title: "A node is a value plus an arrow",
    sudo: "The whole idea, in five lines.",
    content: (
      <>
        <Snippet
          code={`class Node:
    def __init__(self, value):
        self.value = value
        self.next = None      # points to the next node (or None)

a = Node("Alice")
a.next = Node("Bob")          # Alice -> Bob -> None`}
        />
        <p className="text-sm text-muted">
          To insert between two nodes you just repoint arrows — no memory gets
          shifted, which is the linked list&apos;s superpower.
        </p>
      </>
    ),
  },
  {
    title: "How fast is it?",
    sudo: "Cheap edits, pricey lookups.",
    content: (
      <>
        <p>
          Notice the mirror image of an array: editing at a node you already
          hold is <span className="font-mono text-accent">O(1)</span>, but{" "}
          <span className="text-fg">finding</span> a node is{" "}
          <span className="font-mono text-amber-400">O(n)</span>{" "}
          because there&apos;s no index math — you walk the chain.
        </p>
        <OpsCosts ops={FACTS.ops} />
      </>
    ),
  },
  {
    title: "Where linked lists hide",
    sudo: "Even the blockchain is one of these.",
    content: (
      <>
        <p>Pointers-tied-together shows up all over real systems:</p>
        <UsesGrid uses={FACTS.uses} />
      </>
    ),
  },
  {
    title: "Why hackers care",
    sudo: "Dangling pointers = attacker candy.",
    content: (
      <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
        <p>
          All the power — and all the danger — lives in those pointers. Splice
          in a fake node and every traversal visits it. Loop the chain and
          traversals never end. Keep a reference to a &quot;removed&quot; node
          and its secrets stay readable — the notorious{" "}
          <span className="font-semibold">use-after-free</span> family of bugs.
        </p>
      </div>
    ),
  },
];
