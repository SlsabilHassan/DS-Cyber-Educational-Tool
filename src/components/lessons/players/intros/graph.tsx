"use client";

import type { LessonStep } from "../../LessonPlayer";
import { Snippet } from "../../lessonui";
import { GraphVisualizer } from "../../interactives/GraphVisualizer";

export const graphIntroSteps: LessonStep[] = [
  {
    title: "What's a graph?",
    sudo: "Everything is connected. Literally.",
    content: (
      <>
        <p>
          Think of a map of friendships, or a network of computers. Each person
          or machine is a <span className="text-fg">node</span>, and a
          connection between two of them is an{" "}
          <span className="text-fg">edge</span>.
        </p>
        <p>
          That&apos;s a graph: nodes joined by edges, in any shape. Unlike a
          tree, there&apos;s no single root — and connections can loop back on
          each other.
        </p>
      </>
    ),
  },
  {
    title: "Try it yourself",
    sudo: "Traverse it — every node exactly once.",
    content: (
      <>
        <p className="text-sm text-muted">
          Hit traverse and watch the graph get explored node by node — each
          visited exactly once.
        </p>
        <GraphVisualizer />
      </>
    ),
  },
  {
    title: "The same thing, in code",
    sudo: "A graph is a dict of who-knows-whom.",
    content: (
      <>
        <p>
          The simplest graph is an <span className="text-fg">adjacency
          list</span>: for each node, who it connects to.
        </p>
        <Snippet
          code={`graph = {
    "Alice": ["Bob", "Eve"],   # Alice is connected to Bob and Eve
    "Bob":   ["Carol"],
    "Carol": [],
}`}
        />
      </>
    ),
  },
  {
    title: "Why hackers care",
    sudo: "Attackers draw graphs of YOUR network.",
    content: (
      <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
        <p>
          Social networks, package dependencies, trust between services — all
          graphs. So is the map an attacker draws to{" "}
          <span className="font-semibold">move through a network</span>: land on
          one machine, follow the edges to the next. The patterns ahead are
          about what you connect, how far trust flows, and always remembering
          where you&apos;ve been.
        </p>
      </div>
    ),
  },
];
