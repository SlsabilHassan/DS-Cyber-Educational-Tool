"use client";

import type { LessonStep } from "../../LessonPlayer";
import { Snippet } from "../../lessonui";
import { TreeVisualizer } from "../../interactives/TreeVisualizer";

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
          one parent (except the root) and any number of children.
        </p>
      </>
    ),
  },
  {
    title: "Trees are everywhere",
    sudo: "Even the blockchain is secretly a tree.",
    content: (
      <>
        <p>
          File systems, permission systems, HTML pages, code parsers, even the
          Merkle proofs inside blockchains — all trees.
        </p>
        <p>
          That&apos;s what makes them powerful <span className="text-fg">and</span>{" "}
          risky: a bug near the root can expose an entire{" "}
          <span className="text-accent">subtree</span> below it.
        </p>
      </>
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
    title: "The same thing, in code",
    sudo: "A node, its name, its kids. That's it.",
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
    title: "Why hackers care",
    sudo: "Two dots. Infinite mischief.",
    content: (
      <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
        <p>
          Walk a file tree with user-supplied paths and two innocent characters
          — <span className="font-mono">..</span> — climb toward the root. Chain
          enough of them and you&apos;re reading{" "}
          <span className="font-mono">../../etc/passwd</span>. Path traversal,
          permission inheritance, and tamper-proof hashes are all about
          controlling how things flow <span className="font-semibold">up and
          down</span> a tree.
        </p>
      </div>
    ),
  },
];
