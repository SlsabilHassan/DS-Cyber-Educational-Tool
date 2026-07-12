// Plain-data teaching facts for each structure: what its operations cost
// (with a why, not just a Big-O), and where learners have already met one
// today. Rendered in the basics players and on the module lesson pages.

export type OpCost = {
  op: string;
  cost: string;
  fast: boolean; // colors the badge: fast (O(1)/O(log n)) vs slow
  why: string;
};

export type DsFacts = {
  ops: OpCost[];
  uses: { where: string; how: string }[];
};

export const DS_FACTS: Record<string, DsFacts> = {
  "array-armory": {
    ops: [
      {
        op: "Read or write slot [i]",
        cost: "O(1)",
        fast: true,
        why: "address = start + i × slot size — one multiply, one jump, done.",
      },
      {
        op: "Add or remove at the end",
        cost: "O(1)",
        fast: true,
        why: "nothing else has to move.",
      },
      {
        op: "Insert or remove in the middle",
        cost: "O(n)",
        fast: false,
        why: "every slot after it must shift by one to close the gap.",
      },
      {
        op: "Search an unsorted array",
        cost: "O(n)",
        fast: false,
        why: "no shortcut — check slot after slot until you find it.",
      },
    ],
    uses: [
      { where: "Photos", how: "every image is a grid of pixel values — arrays of arrays." },
      { where: "Text", how: "a string is an array of characters, one per slot." },
      { where: "Spreadsheets", how: "each row is an array; the sheet is an array of rows." },
      { where: "Everything else here", how: "stacks, queues, hash tables, and heaps are all built on arrays." },
    ],
  },
  "stack-smashing": {
    ops: [
      {
        op: "push (add on top)",
        cost: "O(1)",
        fast: true,
        why: "move the top marker up one and drop the value in.",
      },
      {
        op: "pop (take from top)",
        cost: "O(1)",
        fast: true,
        why: "read the top slot and move the marker down one.",
      },
      {
        op: "peek at the top",
        cost: "O(1)",
        fast: true,
        why: "the top is always tracked — just look.",
      },
      {
        op: "Reach something buried",
        cost: "O(n)",
        fast: false,
        why: "you must pop everything sitting on top of it first.",
      },
    ],
    uses: [
      { where: "Every function call", how: "the call stack pushes a frame per call, pops it on return." },
      { where: "Undo / redo", how: "each edit is pushed; undo pops the most recent one." },
      { where: "The back button", how: "each page you visit is pushed; back pops it." },
      { where: "Your code editor", how: "matching ( { [ brackets is a push-pop game." },
    ],
  },
  "queue-quarantine": {
    ops: [
      {
        op: "enqueue (join the back)",
        cost: "O(1)",
        fast: true,
        why: "the tail marker says exactly where the back is.",
      },
      {
        op: "dequeue (serve the front)",
        cost: "O(1)",
        fast: true,
        why: "the head marker says exactly who's next.",
      },
      {
        op: "peek at the front",
        cost: "O(1)",
        fast: true,
        why: "just read the slot the head points at.",
      },
      {
        op: "Find someone mid-line",
        cost: "O(n)",
        fast: false,
        why: "walk the line person by person — queues aren't for searching.",
      },
    ],
    uses: [
      { where: "Printers", how: "documents wait their turn in a print queue." },
      { where: "The internet", how: "routers buffer packets in queues when links are busy." },
      { where: "Task schedulers", how: "background jobs line up and run first-come, first-served." },
      { where: "Maze solving", how: "breadth-first search explores level by level using a queue." },
    ],
  },
  "linked-labyrinth": {
    ops: [
      {
        op: "Insert or remove at a node you hold",
        cost: "O(1)",
        fast: true,
        why: "re-hook one or two pointers; nothing shifts.",
      },
      {
        op: "Append with a tail pointer",
        cost: "O(1)",
        fast: true,
        why: "the tail pointer takes you straight to the last car.",
      },
      {
        op: "Reach the k-th node",
        cost: "O(n)",
        fast: false,
        why: "no index math — you walk the couplings one by one.",
      },
      {
        op: "Search by value",
        cost: "O(n)",
        fast: false,
        why: "same walk: check each node until it matches.",
      },
    ],
    uses: [
      { where: "Music queues", how: "'play next' splices a song in without shifting the rest." },
      { where: "Memory allocators", how: "free blocks of RAM are tracked as a linked 'free list'." },
      { where: "Blockchains", how: "each block points at the previous one — a tamper-evident chain." },
      { where: "Text editors", how: "lines linked together make inserting a line cheap." },
    ],
  },
  "hash-heist": {
    ops: [
      {
        op: "Insert a key",
        cost: "O(1) avg",
        fast: true,
        why: "hash the key, jump straight to its bucket, drop it in.",
      },
      {
        op: "Look up a key",
        cost: "O(1) avg",
        fast: true,
        why: "same hash, same bucket — no scanning the rest.",
      },
      {
        op: "Delete a key",
        cost: "O(1) avg",
        fast: true,
        why: "find the bucket the same way, remove the entry.",
      },
      {
        op: "Worst case: everything collides",
        cost: "O(n)",
        fast: false,
        why: "if all keys land in one bucket, lookups walk a long chain.",
      },
    ],
    uses: [
      { where: "Python & JavaScript", how: "every dict and object literal is a hash table." },
      { where: "Databases", how: "hash indexes jump straight to matching rows." },
      { where: "Caches", how: "'have I seen this before?' answered in one lookup." },
      { where: "Login systems", how: "passwords are stored as hashes — never as text." },
    ],
  },
  "tree-trojan": {
    ops: [
      {
        op: "Search a balanced BST",
        cost: "O(log n)",
        fast: true,
        why: "every comparison discards half the remaining tree.",
      },
      {
        op: "Insert into a balanced BST",
        cost: "O(log n)",
        fast: true,
        why: "walk the same halving path, attach a leaf.",
      },
      {
        op: "Visit every node",
        cost: "O(n)",
        fast: false,
        why: "seeing everything means touching everything.",
      },
      {
        op: "Search a lopsided tree",
        cost: "O(n)",
        fast: false,
        why: "a tree that grew into a chain is just a slow list.",
      },
    ],
    uses: [
      { where: "Your files", how: "folders inside folders — the file system is a tree." },
      { where: "This web page", how: "HTML is a tree of elements (the DOM)." },
      { where: "Databases", how: "B-trees find any row in a few hops." },
      { where: "Git & blockchains", how: "Merkle trees make tampering detectable." },
    ],
  },
  "graph-gauntlet": {
    ops: [
      {
        op: "Add a node or edge",
        cost: "O(1)",
        fast: true,
        why: "append to the adjacency list — done.",
      },
      {
        op: "List a node's neighbors",
        cost: "O(deg)",
        fast: true,
        why: "its adjacency list is exactly that — read it out.",
      },
      {
        op: "Visit everything (BFS/DFS)",
        cost: "O(V + E)",
        fast: false,
        why: "every node and every edge gets touched once.",
      },
      {
        op: "Check if a path exists",
        cost: "O(V + E)",
        fast: false,
        why: "in the worst case you explore the whole graph to be sure.",
      },
    ],
    uses: [
      { where: "Maps & GPS", how: "intersections are nodes, roads are edges, routes are paths." },
      { where: "Social networks", how: "you and your follows form a directed graph." },
      { where: "Package managers", how: "npm/pip resolve a dependency graph before installing." },
      { where: "Attackers", how: "they map networks as graphs and hunt for paths to the crown jewels." },
    ],
  },
  "heap-havoc": {
    ops: [
      {
        op: "Peek at the most urgent",
        cost: "O(1)",
        fast: true,
        why: "the heap keeps it at the very top, always.",
      },
      {
        op: "Insert a task",
        cost: "O(log n)",
        fast: true,
        why: "drop it at the bottom, bubble it up level by level.",
      },
      {
        op: "Pop the most urgent",
        cost: "O(log n)",
        fast: true,
        why: "take the top, move the last item up, sift it down.",
      },
      {
        op: "Find an arbitrary task",
        cost: "O(n)",
        fast: false,
        why: "heaps only order the top — everything else is loose.",
      },
    ],
    uses: [
      { where: "Operating systems", how: "the scheduler picks the highest-priority process from a heap." },
      { where: "GPS routing", how: "Dijkstra's algorithm pops the nearest unvisited spot from a heap." },
      { where: "Games & simulations", how: "the next event to happen sits on top of an event heap." },
      { where: "Leaderboards", how: "top-K scores fall out of a heap almost for free." },
    ],
  },
};
