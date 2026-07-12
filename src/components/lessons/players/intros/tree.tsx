"use client";

import type { LessonStep } from "../../LessonPlayer";
import { Snippet } from "../../lessonui";
import { TreeVisualizer } from "../../interactives/TreeVisualizer";
import { Quiz } from "@/components/Quiz";
import { OpsCosts, UsesGrid } from "../../FactsPanel";
import { DS_FACTS } from "@/lib/ds-facts";

const FACTS = DS_FACTS["tree-trojan"];

export const treeIntroSteps: LessonStep[] = [
  {
    title: "What's a tree?",
    sudo: "Family trees, folders — same shape.",
    content: (
      <>
        <p>
          Think of a family tree, or the folders on your computer. There&apos;s
          one <span className="text-fg">root</span> at the top, and every item
          branches into <span className="text-fg">children</span> below it. A
          node with no children is a <span className="text-fg">leaf</span>.
        </p>
        <p>
          That&apos;s a tree: a branching hierarchy where each node has exactly
          one parent (except the root) and any number of children. No loops
          allowed — follow the branches and you always move away from the root.
        </p>
      </>
    ),
  },
  {
    title: "The trick: divide and conquer",
    sudo: "Half the haystack, every step.",
    content: (
      <>
        <p>
          Trees get their speed from a simple rule. In a{" "}
          <span className="text-fg">binary search tree</span>, every node&apos;s
          left branch holds smaller values and its right branch holds larger
          ones. So searching goes:
        </p>
        <Snippet
          code={`looking for 27, at node 40:
  27 < 40  →  go left, and ignore the ENTIRE right side
  ...repeat, throwing away half the tree each step`}
        />
        <p>
          Each comparison discards <span className="text-fg">half</span> of
          what&apos;s left. A million items? About 20 steps. That halving is
          why trees power fast search.
        </p>
      </>
    ),
  },
  {
    title: "How many steps?",
    sudo: "Doubling in reverse — that's log n.",
    lock: true,
    content: (
      <Quiz
        question="A balanced search tree holds about 1,000 items. Roughly how many comparisons to find one?"
        options={[
          { text: "About 1,000 — you might check them all", note: "That's a list's cost. A tree throws away half each step, so it's far fewer." },
          { text: "About 10", correct: true },
          { text: "Exactly 1 — trees are instant", note: "Not instant — but close: each step halves the search, so ~10 steps for 1,000 items." },
        ]}
        explain="Halving 1,000 takes ~10 steps (2¹⁰ ≈ 1,000). That's O(log n) — the payoff for keeping the tree balanced. Let it grow lopsided and it degrades to O(n)."
      />
    ),
  },
  {
    title: "Try it yourself",
    sudo: "Grow a tree. No watering required.",
    content: (
      <>
        <p className="text-sm text-muted">
          Click a node to select it, then add a child under it and watch the
          tree branch out.
        </p>
        <TreeVisualizer />
      </>
    ),
  },
  {
    title: "A node points to its children",
    sudo: "A name, and a map to its kids.",
    content: (
      <Snippet
        code={`class Node:
    def __init__(self, name):
        self.name = name
        self.children = {}     # name -> child node

root = Node("root")
root.children["docs"] = Node("docs")   # root branches to docs`}
      />
    ),
  },
  {
    title: "How fast is it?",
    sudo: "Balance is everything.",
    content: (
      <>
        <p>
          A <span className="text-fg">balanced</span> tree gives you{" "}
          <span className="font-mono text-accent">O(log n)</span>{" "}
          search and insert. But a tree that grew lopsided — every node hanging off one
          side — is really just a linked list wearing a tree costume, and drops
          to <span className="font-mono text-amber-400">O(n)</span>.
        </p>
        <OpsCosts ops={FACTS.ops} />
      </>
    ),
  },
  {
    title: "Where trees hide",
    sudo: "This very page is a tree.",
    content: (
      <>
        <p>Hierarchy and fast search live in trees everywhere:</p>
        <UsesGrid uses={FACTS.uses} />
      </>
    ),
  },
  {
    title: "Why hackers care",
    sudo: "Two dots. Infinite mischief.",
    content: (
      <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
        <p>
          Walk a file tree with user-supplied paths and two innocent characters
          — <span className="font-mono">..</span> — climb toward the root. Chain
          enough and you&apos;re reading{" "}
          <span className="font-mono">../../etc/passwd</span>. Path traversal,
          permission inheritance flowing down branches, and tamper-proof hashes
          flowing up: all about controlling how things move{" "}
          <span className="font-semibold">up and down</span> a tree.
        </p>
      </div>
    ),
  },
];
