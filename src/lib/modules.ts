// All course content lives here. To add a module, append an entry to the
// `modules` array — the home page, the /modules index, and the dynamic
// /modules/[slug] pages all read from this single source. Challenges are
// placeholders for now; fill them in later. The Stack module's challenges are
// fully authored in ./stack-challenges.

import { stackChallenges } from "./stack-challenges";

export type Challenge = {
  id: string;
  name: string;
  points?: number;
  // Rich fields (present for fully authored challenges like the Stack module):
  vulnerability?: string; // one-line class of bug, e.g. "Buffer overflow"
  background?: string; // why it matters / the scenario
  task?: string; // what the student must do
  language?: string; // starter code language, e.g. "python"
  file?: string; // suggested filename for the starter code
  starterCode?: string; // the vulnerable code to fix (no solutions)
  testCommand?: string; // how to run the grading tests (terminal reference)
  tests?: string; // Python harness run in-browser; defines test_* functions
  hints?: string[]; // progressive nudges, revealed one at a time
  lessonAnchor?: string; // id of the matching lesson section on the module page
  solution?: { code: string; explanation: string[] }; // revealed on request
  description?: string;
};

export type Module = {
  slug: string; // URL segment, e.g. "array-armory" -> /modules/array-armory
  title: string; // display name
  order: number; // sort order on listings
  concept: string; // the data structure being taught
  security: string; // the cybersecurity tie-in
  blurb: string; // short summary for cards
  description: string; // longer intro for the module page
  challenges: Challenge[];
};

export const modules: Module[] = [
  {
    slug: "array-armory",
    title: "Array Armory",
    order: 1,
    concept: "Arrays",
    security: "Memory layout & bounds",
    blurb:
      "How contiguous memory really works — and what happens when you read or write one cell too far.",
    description:
      "Arrays are the foundation of almost every other structure. In this module you'll learn how they're laid out in memory, why indexing is O(1), and how off-by-one mistakes turn into out-of-bounds reads and writes that attackers love.",
    challenges: [
      { id: "intro", name: "Index Zero", points: 10 },
      { id: "bounds", name: "Off By One", points: 25 },
      { id: "oob", name: "Out of Bounds", points: 50 },
    ],
  },
  {
    slug: "stack-smashing",
    title: "Stack Smashing",
    order: 2,
    concept: "Stacks",
    security: "Buffer overflows",
    blurb:
      "Push, pop, and overflow. Meet the structure behind function calls — and classic exploitation.",
    description:
      "The call stack is a stack. Learn LIFO operations, how local variables and return addresses share the same frame, and why writing past a buffer can hand control of a program to an attacker. This module contains eight hands-on challenges: fix the vulnerable code until the tests pass.",
    challenges: stackChallenges,
  },
  {
    slug: "queue-quarantine",
    title: "Queue Quarantine",
    order: 3,
    concept: "Queues",
    security: "Scheduling & rate limiting",
    blurb:
      "First in, first out. The structure behind task schedulers, packet buffers, and rate limiters.",
    description:
      "Queues model anything that waits its turn: print jobs, network packets, request pipelines. Learn FIFO operations and how queues power rate limiting and denial-of-service defenses.",
    challenges: [
      { id: "fifo", name: "First In, First Out", points: 10 },
      { id: "ring", name: "Circular Buffer", points: 30 },
    ],
  },
  {
    slug: "linked-labyrinth",
    title: "Linked Labyrinth",
    order: 4,
    concept: "Linked Lists",
    security: "Pointers & use-after-free",
    blurb:
      "Follow the pointers. Where nodes live anywhere, dangling references become exploits.",
    description:
      "Linked lists trade contiguous memory for flexible pointers. Learn traversal, insertion, and deletion — then see how a freed-but-still-referenced node leads to use-after-free vulnerabilities.",
    challenges: [
      { id: "traverse", name: "Follow the Chain", points: 15 },
      { id: "insert", name: "Splice a Node", points: 30 },
      { id: "uaf", name: "Dangling Pointer", points: 75 },
    ],
  },
  {
    slug: "hash-heist",
    title: "Hash Heist",
    order: 5,
    concept: "Hash Tables",
    security: "Hashing & password storage",
    blurb:
      "O(1) lookups, collisions, and why how you hash a password decides whether it's safe.",
    description:
      "Hash tables give near-constant lookups by mapping keys to buckets. Learn hash functions, collision handling, and the security side: salting, slow hashes, and why cryptographic hashing matters for stored credentials.",
    challenges: [
      { id: "buckets", name: "Into the Buckets", points: 15 },
      { id: "collide", name: "Collision Course", points: 35 },
      { id: "crack", name: "Crack the Hash", points: 75 },
    ],
  },
  {
    slug: "tree-trojan",
    title: "Tree Trojan",
    order: 6,
    concept: "Trees",
    security: "Parsing & decision logic",
    blurb:
      "Branch out into search trees, parsers, and the structures behind decision-making.",
    description:
      "Trees model hierarchy and ordered data. Learn binary search trees, traversals, and balancing — then connect them to parsers, file systems, and the decision trees used in detection systems.",
    challenges: [
      { id: "bst", name: "Binary Search Tree", points: 20 },
      { id: "traverse", name: "Walk the Tree", points: 30 },
    ],
  },
  {
    slug: "graph-gauntlet",
    title: "Graph Gauntlet",
    order: 7,
    concept: "Graphs",
    security: "Network & attack paths",
    blurb:
      "Nodes and edges everywhere — model networks, dependencies, and the paths an attacker takes.",
    description:
      "Graphs represent relationships: social networks, package dependencies, and computer networks. Learn representations and traversal (BFS/DFS), then use them to reason about lateral movement and attack-path analysis.",
    challenges: [
      { id: "bfs", name: "Breadth First", points: 20 },
      { id: "dfs", name: "Depth First", points: 20 },
      { id: "path", name: "Shortest Attack Path", points: 60 },
    ],
  },
  {
    slug: "heap-havoc",
    title: "Heap Havoc",
    order: 8,
    concept: "Heaps & Priority Queues",
    security: "Heap exploitation",
    blurb:
      "Priority where it matters — and the allocator internals behind a whole class of exploits.",
    description:
      "Heaps keep the highest-priority item reachable in O(log n) and power priority queues and schedulers. We'll also peek at the memory allocator's heap and the metadata-corruption bugs that make heap exploitation its own art.",
    challenges: [
      { id: "heapify", name: "Heapify", points: 25 },
      { id: "pq", name: "Priority Queue", points: 35 },
    ],
  },
];

export function getModule(slug: string): Module | undefined {
  return modules.find((m) => m.slug === slug);
}

export function getAllModuleSlugs(): string[] {
  return modules.map((m) => m.slug);
}

export function getOrderedModules(): Module[] {
  return [...modules].sort((a, b) => a.order - b.order);
}

export function getChallenge(
  slug: string,
  challengeId: string,
): Challenge | undefined {
  return getModule(slug)?.challenges.find((c) => c.id === challengeId);
}

// Every (module, challenge) pair — used to statically pre-render challenge pages.
export function getAllChallengeParams(): { slug: string; challengeId: string }[] {
  return modules.flatMap((m) =>
    m.challenges.map((c) => ({ slug: m.slug, challengeId: c.id })),
  );
}
