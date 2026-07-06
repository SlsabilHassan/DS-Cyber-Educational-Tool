"use client";

import { ModuleLesson, Snippet, type Concept, type GlossaryItem } from "./lessonui";
import { ArrayVisualizer } from "./interactives/ArrayVisualizer";
import { BoundsDemo } from "./interactives/BoundsDemo";
import { ArrayGhostDemo } from "./interactives/ArrayGhostDemo";

export function ArrayLesson() {
  return (
    <ModuleLesson
      title="What's an array?"
      intro={
        <>
          <p>
            Think of a row of numbered lockers. Each locker holds one item, and
            you reach any of them instantly if you know its number. You
            don&apos;t walk past the others — you go straight to locker{" "}
            <span className="font-mono text-accent">[3]</span>.
          </p>
          <p>
            That&apos;s an array: a block of slots laid out back-to-back in
            memory, each reached by a numeric{" "}
            <span className="text-fg">index</span> starting at 0. That instant,
            direct access is what makes arrays fast — and it&apos;s exactly why a
            bad index is dangerous: it reaches straight into memory it
            shouldn&apos;t.
          </p>
        </>
      }
      tryIt={
        <>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Try it yourself
          </h3>
          <p className="mt-2 text-sm text-muted">
            Insert values (they fill from index 0), then click a cell to remove
            it and watch the rest shift left.
          </p>
          <div className="mt-4">
            <ArrayVisualizer />
          </div>
          <div className="mt-4">
            <Snippet
              code={`data = [None] * 5       # 5 slots: indices 0..4
data[0] = "Alice"       # O(1) — jump straight to slot 0
data[1] = "Bob"
print(data[1])          # -> "Bob"`}
            />
          </div>
        </>
      }
      patternsIntro={
        <>
          The eight challenges all come down to the same thing: an array trusts
          its index, its values, and its callers a little too much. Each idea
          pairs <span className="text-red-400">risky</span> code with a{" "}
          <span className="text-accent">safer</span> version.
        </>
      }
      concepts={CONCEPTS}
      glossary={GLOSSARY}
      closing="That's the toolkit. Now try the challenges below — and lean on the hints if you get stuck. ↓"
    />
  );
}

const CONCEPTS: Concept[] = [
  {
    title: "Validate the index before you write",
    analogy:
      "reaching for locker 500 in a row of 5 — you end up grabbing something that isn't yours.",
    explain: [
      "An array reserves a fixed set of slots. Writing to an index outside that range reaches into whatever memory sits next to the array — the classic out-of-bounds write behind countless exploits.",
      "The fix is to check that the index is an integer inside [0, length) before writing.",
      "Try the demo: write to index 5 of a 5-slot array (indices 0..4), with the bounds check off then on.",
    ],
    demo: BoundsDemo,
    bad: `def write_value(array, index, value):
    array.data[index] = value      # trusts any index`,
    good: `def write_value(array, index, value):
    if index < 0 or index >= len(array.data):
        raise InvalidIndexError
    array.data[index] = value`,
    badCaption: "A bad index writes outside the array.",
    goodCaption: "Only in-range indices are written.",
    takeaway: "Bounds-check every index before you touch memory.",
  },
  {
    title: "Erase the slot you vacate",
    analogy:
      "clearing your name off the top locker but leaving your valuables inside it.",
    explain: [
      "Removing an element shifts the rest left, but the old last slot still holds a leftover copy of the value. If it was sensitive, it lingers for anyone who reads the backing array.",
      "The fix is to overwrite that vacated slot with None as part of the removal.",
      "Try the demo: remove an element and inspect the backing array, with wiping off then on.",
    ],
    demo: ArrayGhostDemo,
    bad: `for i in range(index, count - 1):
    data[i] = data[i + 1]
count -= 1                    # last slot still holds a copy`,
    good: `for i in range(index, count - 1):
    data[i] = data[i + 1]
data[count - 1] = None        # wipe it
count -= 1`,
    badCaption: "The vacated slot keeps a ghost copy.",
    goodCaption: "The vacated slot is cleared.",
    takeaway: "Shifting isn't erasing — clear the slot you free.",
  },
  {
    title: "Check ownership before modifying",
    analogy:
      "a shared filing cabinet where anyone can edit anyone else's folder.",
    explain: [
      "When array slots belong to different users, a write should be allowed only if the caller owns that slot. Skipping the check lets one user overwrite another's data.",
      "The fix is to compare the slot's recorded owner against the caller before writing.",
    ],
    bad: `def update_value(array, user, index, value):
    array.data[index] = value      # no ownership check`,
    good: `def update_value(array, user, index, value):
    if array.owners[index] != user:
        raise AuthorizationError
    array.data[index] = value`,
    badCaption: "Anyone can overwrite anyone's slot.",
    goodCaption: "Only the slot's owner may write.",
    takeaway: "Authorize the caller against the specific slot.",
  },
  {
    title: "Validate values on the way in",
    analogy:
      "a form that's supposed to take an ID number but silently accepts 'DROP TABLE'.",
    explain: [
      "An array that should hold only certain values (say, positive integer IDs) but accepts anything can be poisoned with strings, None, or negatives that break code reading it later.",
      "The fix is to validate each value against the expected policy before storing it.",
    ],
    bad: `def insert(self, value):
    ...
    self.data[self.count] = value   # accepts anything`,
    good: `def insert(self, value):
    if not isinstance(value, int) or value <= 0:
        raise InvalidValueError
    ...`,
    badCaption: "Junk values corrupt the array.",
    goodCaption: "Only values that fit the policy are stored.",
    takeaway: "Enforce your data's type and range at insertion.",
  },
  {
    title: "Cap growth, and lock resizing",
    analogy:
      "a self-expanding warehouse with no size limit and one loading dock everyone crowds at once.",
    explain: [
      "Two resize dangers. First, a dynamic array that doubles forever lets an attacker exhaust memory — cap it at a maximum capacity and reject inserts past it.",
      "Second, if two threads resize at the same time they corrupt the storage; wrap the insert-and-resize step in a lock so only one runs at a time.",
    ],
    bad: `if count == len(data):
    data = grow(data)   # unbounded, and unsynchronized`,
    good: `with self.lock:                       # one thread at a time
    if count == len(data):
        if len(data) * 2 > MAX_CAPACITY:
            raise ArrayCapacityError
        data = grow(data)`,
    badCaption: "Grows without limit; races under threads.",
    goodCaption: "Bounded growth, protected by a lock.",
    takeaway: "Bound resource growth and guard shared resizing.",
  },
  {
    title: "Never hand out your internals",
    analogy:
      "giving a visitor the master key instead of a photocopy of the page they asked for.",
    explain: [
      "Two exposure bugs. Returning the real backing list lets a caller mutate the array behind its own interface — return a copy instead.",
      "And returning the full backing store (not just the used portion) exposes stale, unused slots that may hold old secrets — return only the first `count` elements.",
    ],
    bad: `def export(self):
    return self.data          # the real list — and all unused slots`,
    good: `def export(self):
    return list(self.data[:self.count])   # a copy of the active part`,
    badCaption: "Callers can mutate internals and read stale slots.",
    goodCaption: "A copy of just the active elements.",
    takeaway: "Expose copies of only the data that's actually in use.",
  },
];

const GLOSSARY: GlossaryItem[] = [
  { term: "index", def: "The numeric position of a slot in an array, starting at 0." },
  { term: "bounds", def: "The valid range of indices (0 to length-1); going outside is 'out of bounds'." },
  { term: "out-of-bounds write", def: "Writing past the array's slots, into adjacent memory — a classic exploit." },
  { term: "capacity vs count", def: "Capacity is how many slots exist; count is how many are actually in use." },
  { term: "dynamic array", def: "An array that grows (usually by doubling) when it runs out of room." },
  { term: "race condition", def: "Two threads modifying shared data at once, leaving it in a wrong state." },
];
