// Per-module interactive pre/post assessments. Each module has a short pre-test
// and a parallel post-test (same item ids + constructs, different specifics, to
// blunt the memory effect). Items are interactive where it counts: predict the
// output, click the vulnerable line, order the safe steps. A self-efficacy
// Likert appears in both pre and post; an experience Likert is post-only.

import type { AssessmentItem, LikertItem } from "@/lib/assessment";

const se = (slug: string, statement: string): LikertItem => ({
  id: `se-${slug}`,
  kind: "likert",
  construct: "self-efficacy",
  module: slug,
  prompt: "How much do you agree?",
  statement,
});
const exp = (slug: string, statement: string): LikertItem => ({
  id: `exp-${slug}`,
  kind: "likert",
  construct: "experience",
  module: slug,
  prompt: "How much do you agree?",
  statement,
});

export type ModuleAssessment = { pre: AssessmentItem[]; post: AssessmentItem[] };

export const MODULE_ASSESSMENTS: Record<string, ModuleAssessment> = {
  // ── Array Armory ────────────────────────────────────────────────────
  "array-armory": {
    pre: [
      {
        id: "arr-last-index", kind: "choice", construct: "array-bounds", module: "array-armory",
        prompt: "An array has 8 slots (indices start at 0). What is the last valid index?",
        askConfidence: true,
        options: [{ text: "8" }, { text: "7", correct: true }, { text: "9" }, { text: "Depends on the language" }],
      },
      {
        id: "arr-spot-oob", kind: "spotbug", construct: "array-bounds", module: "array-armory",
        prompt: "Click the line that allows an out-of-bounds write.",
        askConfidence: true,
        codeLines: ["def write_value(array, index, value):", "    array.data[index] = value", "    array.count += 1", "    return True"],
        buggyLine: 1,
      },
      {
        id: "arr-erase", kind: "choice", construct: "data-remnants", module: "array-armory",
        prompt: "You remove an item by shifting the others left. The old last slot still holds a copy. Why is that risky?",
        askConfidence: true,
        options: [
          { text: "It isn't — the value is gone" },
          { text: "A leftover secret (e.g. a password) can still be read from memory", correct: true },
          { text: "It doubles memory usage" },
          { text: "Arrays can't remove items" },
        ],
      },
      se("array-armory", "I could spot an out-of-bounds bug in array code."),
    ],
    post: [
      {
        id: "arr-last-index", kind: "choice", construct: "array-bounds", module: "array-armory",
        prompt: "An array has 6 slots (indices start at 0). What is the last valid index?",
        askConfidence: true,
        options: [{ text: "6" }, { text: "5", correct: true }, { text: "7" }, { text: "Depends on the language" }],
      },
      {
        id: "arr-spot-oob", kind: "spotbug", construct: "array-bounds", module: "array-armory",
        prompt: "Click the line that allows an out-of-bounds write.",
        askConfidence: true,
        codeLines: ["def store(buffer, pos, item):", "    buffer.slots[pos] = item", "    buffer.size += 1", "    return True"],
        buggyLine: 1,
      },
      {
        id: "arr-erase", kind: "choice", construct: "data-remnants", module: "array-armory",
        prompt: "After deleting an item by shifting left, what should you also do to stay safe?",
        askConfidence: true,
        options: [
          { text: "Nothing else is needed" },
          { text: "Overwrite the vacated slot (e.g. with None)", correct: true },
          { text: "Double the array size" },
          { text: "Sort the array" },
        ],
      },
      se("array-armory", "I could spot an out-of-bounds bug in array code."),
      exp("array-armory", "The array visualizations helped me understand indexing."),
    ],
  },

  // ── Stack Smashing ──────────────────────────────────────────────────
  "stack-smashing": {
    pre: [
      {
        id: "stk-pop-order", kind: "choice", construct: "stack-lifo", module: "stack-smashing",
        prompt: "You push A, then B, then C, then pop twice. What comes out, in order?",
        code: "push(A); push(B); push(C)\npop()  # ?\npop()  # ?",
        askConfidence: true,
        options: [{ text: "A, then B" }, { text: "C, then B", correct: true }, { text: "C, then A" }],
      },
      {
        id: "stk-overflow-why", kind: "choice", construct: "buffer-overflow", module: "stack-smashing",
        prompt: "Why can writing past a buffer's end hijack a program?",
        askConfidence: true,
        options: [
          { text: "It fills up the disk" },
          { text: "It can overwrite the nearby return address and redirect execution", correct: true },
          { text: "It only prints a warning" },
          { text: "It sorts memory" },
        ],
      },
      {
        id: "stk-spot", kind: "spotbug", construct: "buffer-overflow", module: "stack-smashing",
        prompt: "Click the line where the overflow actually happens.",
        askConfidence: true,
        codeLines: ["def save(buffer, data):", "    for i, ch in enumerate(data):", "        buffer[i] = ch", "    return True"],
        buggyLine: 2,
      },
      se("stack-smashing", "I could find and fix a buffer-overflow bug in code."),
    ],
    post: [
      {
        id: "stk-pop-order", kind: "choice", construct: "stack-lifo", module: "stack-smashing",
        prompt: "You push X, then Y, then Z, then pop twice. What comes out, in order?",
        code: "push(X); push(Y); push(Z)\npop()  # ?\npop()  # ?",
        askConfidence: true,
        options: [{ text: "X, then Y" }, { text: "Z, then Y", correct: true }, { text: "Z, then X" }],
      },
      {
        id: "stk-overflow-why", kind: "choice", construct: "buffer-overflow", module: "stack-smashing",
        prompt: "A buffer overflow is dangerous mainly because…",
        askConfidence: true,
        options: [
          { text: "it slows the CPU down" },
          { text: "adjacent data like the return address can be overwritten to redirect the program", correct: true },
          { text: "it clears the screen" },
          { text: "it duplicates files" },
        ],
      },
      {
        id: "stk-spot", kind: "spotbug", construct: "buffer-overflow", module: "stack-smashing",
        prompt: "Click the line where the overflow actually happens.",
        askConfidence: true,
        codeLines: ["def copy_in(buf, src):", "    for i, c in enumerate(src):", "        buf[i] = c", "    return True"],
        buggyLine: 2,
      },
      se("stack-smashing", "I could find and fix a buffer-overflow bug in code."),
      exp("stack-smashing", "Breaking the stack myself made the risk click."),
    ],
  },

  // ── Queue Quarantine ────────────────────────────────────────────────
  "queue-quarantine": {
    pre: [
      {
        id: "q-fifo", kind: "choice", construct: "queue-fifo", module: "queue-quarantine",
        prompt: "You enqueue X, then Y, then Z, then dequeue once. What comes out?",
        askConfidence: true,
        options: [{ text: "Z (newest)" }, { text: "X (oldest)", correct: true }, { text: "Y (middle)" }],
      },
      {
        id: "q-replay", kind: "choice", construct: "replay", module: "queue-quarantine",
        prompt: "A payment queue 'processes' the front item by reading it but never removing it. What's the risk?",
        askConfidence: true,
        options: [
          { text: "No risk" },
          { text: "The same payment can be processed again — a replay", correct: true },
          { text: "The queue shrinks too fast" },
          { text: "It runs faster" },
        ],
      },
      {
        id: "q-spot-unbounded", kind: "spotbug", construct: "resource-exhaustion", module: "queue-quarantine",
        prompt: "Click the line that lets an attacker flood the queue (no limit).",
        askConfidence: true,
        codeLines: ["def enqueue(q, job):", "    q.queue.append(job)", "    return len(q.queue)"],
        buggyLine: 1,
      },
      se("queue-quarantine", "I understand how queues can be flooded (denial of service)."),
    ],
    post: [
      {
        id: "q-fifo", kind: "choice", construct: "queue-fifo", module: "queue-quarantine",
        prompt: "You enqueue A, then B, then C, then dequeue once. What comes out?",
        askConfidence: true,
        options: [{ text: "C (newest)" }, { text: "A (oldest)", correct: true }, { text: "B (middle)" }],
      },
      {
        id: "q-replay", kind: "choice", construct: "replay", module: "queue-quarantine",
        prompt: "To stop a request being processed twice, the queue should…",
        askConfidence: true,
        options: [
          { text: "peek at it" },
          { text: "remove (pop) it as it is processed", correct: true },
          { text: "copy it first" },
          { text: "ignore it" },
        ],
      },
      {
        id: "q-spot-unbounded", kind: "spotbug", construct: "resource-exhaustion", module: "queue-quarantine",
        prompt: "Click the line that lets an attacker flood the queue (no limit).",
        askConfidence: true,
        codeLines: ["def add_job(q, job):", "    q.items.append(job)", "    return len(q.items)"],
        buggyLine: 1,
      },
      se("queue-quarantine", "I understand how queues can be flooded (denial of service)."),
      exp("queue-quarantine", "The queue demos helped me get FIFO."),
    ],
  },

  // ── Linked Labyrinth ────────────────────────────────────────────────
  "linked-labyrinth": {
    pre: [
      {
        id: "ll-traverse", kind: "choice", construct: "traversal", module: "linked-labyrinth",
        prompt: "To reach the 5th node in a linked list, you must…",
        askConfidence: true,
        options: [
          { text: "jump straight to it by index" },
          { text: "follow the next pointers one by one from the head", correct: true },
          { text: "sort the list first" },
          { text: "hash the list" },
        ],
      },
      {
        id: "ll-cycle", kind: "choice", construct: "cycles", module: "linked-labyrinth",
        prompt: "A later node's next pointer is set back to an earlier node. What happens?",
        askConfidence: true,
        options: [
          { text: "Nothing changes" },
          { text: "Traversal loops forever — a denial-of-service risk", correct: true },
          { text: "The list reverses" },
          { text: "The list sorts itself" },
        ],
      },
      {
        id: "ll-uaf", kind: "choice", construct: "use-after-free", module: "linked-labyrinth",
        prompt: "You 'remove' a node by repointing, but keep another reference to it with its secret inside. Risk?",
        askConfidence: true,
        options: [
          { text: "None" },
          { text: "The secret is still readable through the stale reference (use-after-free)", correct: true },
          { text: "Memory doubles" },
          { text: "It's completely safe" },
        ],
      },
      se("linked-labyrinth", "I understand how dangling pointers cause security bugs."),
    ],
    post: [
      {
        id: "ll-traverse", kind: "choice", construct: "traversal", module: "linked-labyrinth",
        prompt: "Finding the k-th node in a linked list costs…",
        askConfidence: true,
        options: [
          { text: "O(1) — instant" },
          { text: "O(n) — you walk from the head", correct: true },
          { text: "O(log n)" },
          { text: "nothing at all" },
        ],
      },
      {
        id: "ll-cycle", kind: "choice", construct: "cycles", module: "linked-labyrinth",
        prompt: "Before linking node A's next to node B, to stay safe you should check…",
        askConfidence: true,
        options: [
          { text: "nothing" },
          { text: "that it won't create a loop back to A (a cycle)", correct: true },
          { text: "the node's color" },
          { text: "only the list's size" },
        ],
      },
      {
        id: "ll-uaf", kind: "choice", construct: "use-after-free", module: "linked-labyrinth",
        prompt: "When removing a node that holds a secret, you should…",
        askConfidence: true,
        options: [
          { text: "leave it as is" },
          { text: "wipe its data and null out its next pointer", correct: true },
          { text: "copy it somewhere" },
          { text: "print it first" },
        ],
      },
      se("linked-labyrinth", "I understand how dangling pointers cause security bugs."),
      exp("linked-labyrinth", "Watching the pointers rewire helped me learn."),
    ],
  },

  // ── Hash Heist ──────────────────────────────────────────────────────
  "hash-heist": {
    pre: [
      {
        id: "h-collision", kind: "choice", construct: "collisions", module: "hash-heist",
        prompt: "Two different keys hash to the SAME bucket. In a correct hash table, what happens?",
        askConfidence: true,
        options: [
          { text: "The table crashes" },
          { text: "The second key is rejected" },
          { text: "Both entries chain together in that bucket", correct: true },
          { text: "The first value is silently overwritten" },
        ],
      },
      {
        id: "h-worst", kind: "choice", construct: "collisions", module: "hash-heist",
        prompt: "If a bad hash sends ALL keys into one bucket, a lookup becomes…",
        askConfidence: true,
        options: [
          { text: "still O(1)" },
          { text: "O(n) — scanning a long chain", correct: true },
          { text: "O(log n)" },
          { text: "instant" },
        ],
      },
      {
        id: "h-passwords", kind: "choice", construct: "password-storage", module: "hash-heist",
        prompt: "Why store password hashes instead of the passwords themselves?",
        askConfidence: true,
        options: [
          { text: "to save space" },
          { text: "so a stolen database doesn't reveal the actual passwords", correct: true },
          { text: "to sort them" },
          { text: "for faster lookups only" },
        ],
      },
      se("hash-heist", "I understand why hashing matters for password security."),
    ],
    post: [
      {
        id: "h-collision", kind: "choice", construct: "collisions", module: "hash-heist",
        prompt: "When two keys land in the same bucket, a well-written hash table…",
        askConfidence: true,
        options: [
          { text: "throws an error" },
          { text: "drops the newer key" },
          { text: "keeps both by chaining them in the bucket", correct: true },
          { text: "overwrites the older value without warning" },
        ],
      },
      {
        id: "h-worst", kind: "choice", construct: "collisions", module: "hash-heist",
        prompt: "A hash table's O(1) speed assumes that…",
        askConfidence: true,
        options: [
          { text: "keys spread across buckets", correct: true },
          { text: "all keys share one bucket" },
          { text: "keys are pre-sorted" },
          { text: "there are no keys" },
        ],
      },
      {
        id: "h-passwords", kind: "choice", construct: "password-storage", module: "hash-heist",
        prompt: "A safely stored password should be…",
        askConfidence: true,
        options: [
          { text: "plain text" },
          { text: "a hash (ideally salted)", correct: true },
          { text: "an array index" },
          { text: "a pointer" },
        ],
      },
      se("hash-heist", "I understand why hashing matters for password security."),
      exp("hash-heist", "The collision demo made hashing click."),
    ],
  },

  // ── Tree Trojan ─────────────────────────────────────────────────────
  "tree-trojan": {
    pre: [
      {
        id: "t-traversal", kind: "choice", construct: "path-traversal", module: "tree-trojan",
        prompt: "Walking a file tree with user input, what do '..' components do?",
        askConfidence: true,
        options: [
          { text: "nothing" },
          { text: "move up to the parent — enough of them escape the intended root", correct: true },
          { text: "delete files" },
          { text: "sort the folders" },
        ],
      },
      {
        id: "t-bst", kind: "choice", construct: "bst-search", module: "tree-trojan",
        prompt: "In a balanced binary search tree of ~1000 items, a search takes about…",
        askConfidence: true,
        options: [
          { text: "1000 steps" },
          { text: "~10 steps (halving each step)", correct: true },
          { text: "1 step" },
          { text: "500 steps" },
        ],
      },
      {
        id: "t-acl", kind: "choice", construct: "access-control", module: "tree-trojan",
        prompt: "Permissions flow down a tree. If a parent grants access, a child…",
        askConfidence: true,
        options: [
          { text: "always denies it" },
          { text: "may inherit it — so a misplaced grant exposes a whole subtree", correct: true },
          { text: "ignores it" },
          { text: "crashes" },
        ],
      },
      se("tree-trojan", "I understand how path-traversal attacks work."),
    ],
    post: [
      {
        id: "t-traversal", kind: "choice", construct: "path-traversal", module: "tree-trojan",
        prompt: "To stop '../../etc/passwd' traversal, you should…",
        askConfidence: true,
        options: [
          { text: "allow every path" },
          { text: "treat the root as a ceiling and reject any '..' that climbs above it", correct: true },
          { text: "make it faster" },
          { text: "sort the paths" },
        ],
      },
      {
        id: "t-bst", kind: "choice", construct: "bst-search", module: "tree-trojan",
        prompt: "A balanced search tree is fast because each comparison…",
        askConfidence: true,
        options: [
          { text: "checks every node" },
          { text: "discards half of the remaining tree", correct: true },
          { text: "doubles the tree" },
          { text: "sorts the tree" },
        ],
      },
      {
        id: "t-acl", kind: "choice", construct: "access-control", module: "tree-trojan",
        prompt: "A safe permission check on a tree node should verify…",
        askConfidence: true,
        options: [
          { text: "only the parent" },
          { text: "the actual requester's permission for that node", correct: true },
          { text: "the node's color" },
          { text: "nothing" },
        ],
      },
      se("tree-trojan", "I understand how path-traversal attacks work."),
      exp("tree-trojan", "The tree visualization helped me see the hierarchy."),
    ],
  },

  // ── Graph Gauntlet ──────────────────────────────────────────────────
  "graph-gauntlet": {
    pre: [
      {
        id: "g-cycle", kind: "choice", construct: "traversal-cycles", module: "graph-gauntlet",
        prompt: "Exploring a graph with a cycle A→B→C→A, what must you track to avoid looping forever?",
        askConfidence: true,
        options: [
          { text: "the number of edges" },
          { text: "which nodes you've already visited", correct: true },
          { text: "the node colors" },
          { text: "nothing" },
        ],
      },
      {
        id: "g-vs-tree", kind: "choice", construct: "graph-basics", module: "graph-gauntlet",
        prompt: "How does a graph differ from a tree?",
        askConfidence: true,
        options: [
          { text: "it can't connect nodes" },
          { text: "it can have cycles and no single root", correct: true },
          { text: "it is always smaller" },
          { text: "it is always sorted" },
        ],
      },
      {
        id: "g-trust", kind: "choice", construct: "untrusted-nodes", module: "graph-gauntlet",
        prompt: "Adding an edge without checking the node lets an attacker…",
        askConfidence: true,
        options: [
          { text: "do nothing" },
          { text: "splice in a fake node reachable through normal traversal", correct: true },
          { text: "delete all edges" },
          { text: "sort the graph" },
        ],
      },
      se("graph-gauntlet", "I understand how attackers move through a network graph."),
    ],
    post: [
      {
        id: "g-cycle", kind: "choice", construct: "traversal-cycles", module: "graph-gauntlet",
        prompt: "A graph traversal keeps a 'visited' set in order to…",
        askConfidence: true,
        options: [
          { text: "sort the nodes" },
          { text: "avoid re-visiting nodes and looping forever", correct: true },
          { text: "count the edges" },
          { text: "do nothing useful" },
        ],
      },
      {
        id: "g-vs-tree", kind: "choice", construct: "graph-basics", module: "graph-gauntlet",
        prompt: "Unlike a tree, a graph can…",
        askConfidence: true,
        options: [
          { text: "only branch downward" },
          { text: "form cycles and connect anything to anything", correct: true },
          { text: "never connect nodes" },
          { text: "only be empty" },
        ],
      },
      {
        id: "g-trust", kind: "choice", construct: "untrusted-nodes", module: "graph-gauntlet",
        prompt: "Before adding a node or edge to a trusted graph, you should…",
        askConfidence: true,
        options: [
          { text: "do nothing" },
          { text: "verify it's trusted (and check a subgraph's nodes too)", correct: true },
          { text: "sort it" },
          { text: "print it" },
        ],
      },
      se("graph-gauntlet", "I understand how attackers move through a network graph."),
      exp("graph-gauntlet", "The graph traversal animation helped me learn."),
    ],
  },

  // ── Heap Havoc ──────────────────────────────────────────────────────
  "heap-havoc": {
    pre: [
      {
        id: "hp-top", kind: "choice", construct: "heap-order", module: "heap-havoc",
        prompt: "In a min-heap (lower number = more urgent), what is always kept at the top?",
        askConfidence: true,
        options: [
          { text: "the newest item" },
          { text: "the most urgent (smallest) item", correct: true },
          { text: "a random item" },
          { text: "the largest item" },
        ],
      },
      {
        id: "hp-forge", kind: "choice", construct: "priority-abuse", module: "heap-havoc",
        prompt: "If users can set their own task priority, an attacker can…",
        askConfidence: true,
        options: [
          { text: "do nothing" },
          { text: "stamp their job urgent and jump the whole queue", correct: true },
          { text: "delete the heap" },
          { text: "sort the heap" },
        ],
      },
      {
        id: "hp-order", kind: "order", construct: "heap-insert", module: "heap-havoc",
        prompt: "Put these steps in order to safely insert a task into a heap.",
        askConfidence: true,
        steps: [
          "Validate the priority is within the allowed range",
          "Add the item at the bottom of the heap",
          "Bubble it up until heap order is restored",
        ],
      },
      se("heap-havoc", "I understand how priority queues can be abused."),
    ],
    post: [
      {
        id: "hp-top", kind: "choice", construct: "heap-order", module: "heap-havoc",
        prompt: "To get the most urgent item out of a heap, you…",
        askConfidence: true,
        options: [
          { text: "search the whole heap" },
          { text: "read the top in O(1)", correct: true },
          { text: "sort it first" },
          { text: "pop from the bottom" },
        ],
      },
      {
        id: "hp-forge", kind: "choice", construct: "priority-abuse", module: "heap-havoc",
        prompt: "To stop priority abuse, the system should…",
        askConfidence: true,
        options: [
          { text: "trust whatever the caller sends" },
          { text: "check authority before honoring a high priority", correct: true },
          { text: "ignore priorities entirely" },
          { text: "randomize priorities" },
        ],
      },
      {
        id: "hp-order", kind: "order", construct: "heap-insert", module: "heap-havoc",
        prompt: "Put these steps in order to safely insert a task into a heap.",
        askConfidence: true,
        steps: [
          "Check the new priority is allowed",
          "Place the item at the end",
          "Sift it up until the parent is more urgent",
        ],
      },
      se("heap-havoc", "I understand how priority queues can be abused."),
      exp("heap-havoc", "Serving by urgency helped me get heaps."),
    ],
  },
};

export function getModuleAssessment(slug: string): ModuleAssessment | null {
  return MODULE_ASSESSMENTS[slug] ?? null;
}
