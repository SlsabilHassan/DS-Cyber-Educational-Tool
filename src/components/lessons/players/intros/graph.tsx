"use client";

import type { LessonStep } from "../../LessonPlayer";
import { Snippet } from "../../lessonui";
import { GraphVisualizer } from "../../interactives/GraphVisualizer";
import { Quiz } from "@/components/Quiz";
import { OpsCosts, UsesGrid } from "../../FactsPanel";
import { DS_FACTS } from "@/lib/ds-facts";

const FACTS = DS_FACTS["graph-gauntlet"];

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
          That&apos;s a graph: nodes joined by edges, in any shape. It&apos;s the
          most general structure here — a tree is just a graph with no loops
          and one root; a linked list is a graph where each node has one edge.
        </p>
      </>
    ),
  },
  {
    title: "Directed, and cyclic",
    sudo: "Arrows can be one-way. And loop.",
    content: (
      <>
        <p>
          Two things make graphs wilder than trees. Edges can be{" "}
          <span className="text-fg">directed</span> (Alice follows Bob, but Bob
          may not follow back), and they can form{" "}
          <span className="text-fg">cycles</span> (A → B → C → A). That freedom
          is why graphs model almost anything — and why traversing one is
          trickier.
        </p>
        <Snippet
          code={`graph = {
    "Alice": ["Bob", "Eve"],   # Alice → Bob, Alice → Eve
    "Bob":   ["Carol"],
    "Carol": [],
}`}
        />
      </>
    ),
  },
  {
    title: "The one rule of traversal",
    sudo: "Forget this and loop forever.",
    lock: true,
    content: (
      <Quiz
        question="You explore a graph that has a cycle A → B → C → A. What must you track to avoid looping forever?"
        options={[
          { text: "Which nodes you've already visited", correct: true },
          { text: "The total number of edges", note: "Counting edges won't stop you re-entering the cycle — you need to remember where you've been." },
          { text: "Nothing — graphs can't have loops", note: "Graphs absolutely can loop; that's the whole danger. Trees can't, but graphs can." },
        ]}
        explain="Because graphs can cycle, every traversal keeps a 'visited' set and skips nodes already in it. Forget it and A → B → C → A spins forever — a real denial-of-service risk."
      />
    ),
  },
  {
    title: "Try it yourself",
    sudo: "Traverse it — every node exactly once.",
    content: (
      <>
        <p className="text-sm text-muted">
          Hit traverse and watch the graph get explored node by node — each
          visited exactly once, thanks to that &quot;visited&quot; set.
        </p>
        <GraphVisualizer />
      </>
    ),
  },
  {
    title: "How fast is it?",
    sudo: "Cheap to build, whole-graph to explore.",
    content: (
      <>
        <p>
          Adding nodes and edges is <span className="font-mono text-accent">O(1)</span>.
          But answering &quot;can I get from here to there?&quot; may mean
          exploring the whole graph — <span className="font-mono text-amber-400">O(V + E)</span>,
          every vertex and edge. That&apos;s the cost of freedom.
        </p>
        <OpsCosts ops={FACTS.ops} />
      </>
    ),
  },
  {
    title: "Where graphs run the world",
    sudo: "GPS is just graph search with style.",
    content: (
      <>
        <p>Anything about relationships and connections is a graph:</p>
        <UsesGrid uses={FACTS.uses} />
      </>
    ),
  },
  {
    title: "Why hackers care",
    sudo: "Attackers draw graphs of YOUR network.",
    content: (
      <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
        <p>
          To an attacker, your systems <span className="font-semibold">are</span>{" "}
          a graph: land on one machine, follow the edges to the next, hunt for a
          path to the crown jewels. Meanwhile a single unchecked edge can splice
          a hostile node into a trusted graph, and a cycle can hang a traversal
          forever. The patterns ahead guard what you connect, how far trust
          flows, and where you&apos;ve already been.
        </p>
      </div>
    ),
  },
];
