"use client";

import { ModuleLesson, Snippet, type Concept, type GlossaryItem } from "./lessonui";
import { LinkedListVisualizer } from "./interactives/LinkedListVisualizer";
import { CycleDemo } from "./interactives/CycleDemo";
import { TrustDemo } from "./interactives/TrustDemo";

export function LinkedListLesson() {
  return (
    <ModuleLesson
      slug="linked-labyrinth"
      title="What's a linked list?"
      intro={
        <>
          <p>
            Think of a train. Each car holds some cargo and a coupling to the{" "}
            <span className="text-fg">next</span> car. To find a car you start
            at the front and follow the couplings one by one. Add or remove a
            car by re-hooking a single coupling — no need to shift everything
            else.
          </p>
          <p>
            That&apos;s a linked list: a chain of{" "}
            <span className="text-fg">nodes</span>, each holding a value and a{" "}
            <span className="font-mono text-accent">next</span> pointer to the
            following node. The last node points to{" "}
            <span className="font-mono text-accent">null</span>. All its power —
            and all its danger — comes from those pointers.
          </p>
        </>
      }
      tryIt={
        <>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Try it yourself
          </h3>
          <p className="mt-2 text-sm text-muted">
            Append nodes to the end, remove from the head, and watch the{" "}
            <span className="text-fg">next</span> pointers rewire.
          </p>
          <div className="mt-4">
            <LinkedListVisualizer />
          </div>
          <div className="mt-4">
            <Snippet
              code={`class Node:
    def __init__(self, value):
        self.value = value
        self.next = None      # points to the next node (or None)

a = Node("Alice")
a.next = Node("Bob")          # Alice -> Bob -> None`}
            />
          </div>
        </>
      }
      patternsIntro={
        <>
          Every one of the eight challenges comes down to protecting those
          pointers — what they point at, what they leave behind, and how far
          they run. Each idea has{" "}
          <span className="text-red-400">risky</span> code beside a{" "}
          <span className="text-accent">safer</span> version.
        </>
      }
      concepts={CONCEPTS}
      glossary={GLOSSARY}
      closing="That's the toolkit. Now try the challenges below — and lean on the hints if you get stuck. ↓"
    />
  );
}

export const CONCEPTS: Concept[] = [
  {
    title: "Validate a pointer before you trust it",
    analogy:
      "a train coupling that only latches onto certified cars — not whatever the yard hands you.",
    explain: [
      "A linked list is only as safe as the nodes in it. If you set a `next` pointer — or append a node — without checking what it is, an attacker can splice in a fake node and hijack every traversal that follows.",
      "In this module, real nodes carry a trusted marker. The fix is to verify that marker before linking; anything without it is refused.",
      "Try the demo: append an attacker's node into a trusted list with the check off, then turn it on.",
    ],
    demo: TrustDemo,
    bad: `def append_node(lst, node):
    ...
    current.next = node       # trusts any object`,
    good: `def append_node(lst, node):
    if getattr(node, "trust", None) != TRUSTED:
        raise UntrustedNodeError
    ...`,
    badCaption: "Any object can be spliced into the chain.",
    goodCaption: "Only nodes with the trusted marker get linked.",
    takeaway: "Never link a pointer you haven't verified.",
  },
  {
    title: "Erase what you remove",
    analogy:
      "unhooking a train car doesn't empty its cargo — the freight is still inside for anyone who climbs aboard.",
    explain: [
      "Unlinking a node just changes a pointer; the node itself — and its secret — still exists in memory. If any other reference to it survives, so does the secret.",
      "Worse, a removed node often still points into the live list, so a leftover reference can walk right back in.",
      "The fix is to wipe the sensitive field and null out the node's next pointer as you remove it.",
    ],
    bad: `def remove_first(lst):
    removed = lst.head
    lst.head = removed.next   # secret + next still intact
    return removed`,
    good: `def remove_first(lst):
    removed = lst.head
    lst.head = removed.next
    removed.secret = None      # wipe it
    removed.next = None        # detach it
    return removed`,
    badCaption: "The removed node still holds its secret and a live pointer.",
    goodCaption: "Wipe the data and detach the node.",
    takeaway: "'Unlinked' isn't 'erased' — clear the data and cut the pointer.",
  },
  {
    title: "Never create a cycle",
    analogy:
      "a train track that loops back on itself — the train circles forever and never reaches the station.",
    explain: [
      "Almost every list operation assumes the chain ends. Point a later node back at an earlier one and you've made a loop: traversal, search, and export all run forever — a denial of service.",
      "The fix is to check, before linking, whether the new link would close a cycle — by walking from the target and seeing if you loop back to the source.",
      "Try the demo: link the last node back to an earlier one, with the cycle check off and then on.",
    ],
    demo: CycleDemo,
    bad: `def link_nodes(current, next_node):
    current.next = next_node   # may close a loop`,
    good: `def link_nodes(current, next_node):
    walker = next_node
    while walker:
        if walker is current:
            raise CycleDetectedError
        walker = walker.next
    current.next = next_node`,
    badCaption: "Links blindly — a loop makes traversal never end.",
    goodCaption: "Refuses any link that would create a cycle.",
    takeaway: "Before you link, make sure you're not closing a loop.",
  },
  {
    title: "Keep identifiers unique",
    analogy:
      "two passengers with the same ticket number — now the conductor can't tell whose seat is whose.",
    explain: [
      "When records are keyed by an ID, search and update assume each ID appears once. Insert a second record with an existing ID and lookups start returning the wrong one.",
      "The fix is to check for an existing ID before inserting, and refuse duplicates.",
    ],
    bad: `def insert(lst, user_id, name):
    ...                       # appends without checking
    current.next = ListNode(user_id, name)`,
    good: `def insert(lst, user_id, name):
    if find(lst, user_id) is not None:
        raise DuplicateIDError
    ...`,
    badCaption: "Duplicate IDs corrupt every later lookup.",
    goodCaption: "Refuses an ID that already exists.",
    takeaway: "Enforce uniqueness at insertion, not after the damage is done.",
  },
  {
    title: "Cap how far you traverse",
    analogy:
      "a conductor who'll walk the train all day — until someone hands them a train a million cars long.",
    explain: [
      "Walking a list with no limit is fine until an attacker makes the list enormous (or cyclic). Then every traversal ties up the CPU — a denial of service.",
      "The fix is a hard traversal budget: stop and raise once you've visited MAX_VISITS nodes.",
    ],
    bad: `def count_nodes(head):
    while current:
        count += 1
        current = current.next`,
    good: `def count_nodes(head):
    while current:
        if count >= MAX_VISITS:
            raise TraversalLimitExceeded
        count += 1
        current = current.next`,
    badCaption: "An oversized list burns CPU forever.",
    goodCaption: "A visit budget cuts the traversal off.",
    takeaway: "Bound every walk over attacker-influenced data.",
  },
  {
    title: "Export the minimum, and keep integrity chains fresh",
    analogy:
      "a passenger manifest that shows names but hides everyone's home address and passport number.",
    explain: [
      "The last two challenges are about exposure and integrity. When you export a list to a client, return only the public fields — never the owner, allocation IDs, or memory addresses stored alongside them.",
      "And when a list is a hash chain (each node's hash depends on the previous), changing one node's data means every downstream hash must be recomputed — otherwise integrity checks silently break.",
    ],
    bad: `# leaks internals:
{"user_id": .., "name": ..,
 "owner": .., "memory_address": ..}

# re-hashes only the changed node:
node.hash = sha256(node.value + node.previous_hash)`,
    good: `# public only:
{"user_id": .., "name": ..}

# rebuild the whole suffix:
node.value = new_value
recompute_chain(node)`,
    badCaption: "Leaks metadata; leaves downstream hashes stale.",
    goodCaption: "Shows only public fields; keeps the chain consistent.",
    takeaway: "Reveal only what's needed, and keep tamper-evidence intact.",
  },
];

const GLOSSARY: GlossaryItem[] = [
  { term: "node", def: "One element of a linked list: a value plus a pointer to the next node." },
  { term: "next pointer", def: "The reference each node holds to the following node (or null at the end)." },
  { term: "head", def: "The first node — where every traversal starts." },
  { term: "cycle", def: "A loop in the pointers, where a node eventually points back to an earlier one." },
  { term: "use-after-free", def: "A bug where code keeps using an object (or node) that was already removed/freed." },
  { term: "hash chain", def: "A list where each node's hash depends on the previous node's — so tampering is detectable." },
];
