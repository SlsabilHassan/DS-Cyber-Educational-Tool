"use client";

import { ModuleLesson, Snippet, type Concept, type GlossaryItem } from "./lessonui";
import { HashTableVisualizer } from "./interactives/HashTableVisualizer";
import { CollisionDemo } from "./interactives/CollisionDemo";
import { KeyValidationDemo } from "./interactives/KeyValidationDemo";

export function HashTableLesson() {
  return (
    <ModuleLesson
      title="What's a hash table?"
      intro={
        <>
          <p>
            Imagine a coat check. You hand over your coat and get a number; to
            find it again, the attendant goes straight to that numbered hook —
            no searching the whole rack. A hash table works the same way: it
            turns your <span className="text-fg">key</span> into a number and
            jumps straight to the right slot.
          </p>
          <p>
            That number comes from a <span className="text-fg">hash function</span>,
            and the slots are called <span className="text-fg">buckets</span>.
            It&apos;s what makes dictionaries and lookups near-instant — and when
            two keys land on the same bucket (a{" "}
            <span className="text-fg">collision</span>), they chain together in
            that bucket.
          </p>
        </>
      }
      tryIt={
        <>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Try it yourself
          </h3>
          <p className="mt-2 text-sm text-muted">
            Insert some keys and watch each get hashed to a bucket — insert a few
            and you&apos;ll see a collision (two keys sharing a bucket).
          </p>
          <div className="mt-4">
            <HashTableVisualizer />
          </div>
          <div className="mt-4">
            <Snippet
              code={`table = {}
table["alice"] = "AliceSecret"   # key -> hashed -> bucket -> stored
print(table["alice"])            # O(1) lookup, no scanning`}
            />
          </div>
        </>
      }
      patternsIntro={
        <>
          The eight challenges all come down to trusting the wrong thing: a
          bucket index, a key, a caller, or a chain length. Each idea pairs{" "}
          <span className="text-red-400">risky</span> code with a{" "}
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
    title: "Validate the bucket index",
    analogy:
      "a coat check with 4 hooks where someone hands you ticket #900 — there's no hook there to reach for.",
    explain: [
      "Entries live in a fixed array of buckets. Writing to a bucket index outside that array reaches into unintended memory — the hash-table version of an out-of-bounds write.",
      "The fix is to confirm the bucket index is an integer inside [0, bucket_count) before writing.",
    ],
    bad: `def insert_entry(table, bucket_index, entry):
    table.buckets[bucket_index].append(entry)   # trusts any index`,
    good: `def insert_entry(table, bucket_index, entry):
    if bucket_index < 0 or bucket_index >= len(table.buckets):
        raise InvalidBucketError
    table.buckets[bucket_index].append(entry)`,
    badCaption: "A bad bucket index writes out of range.",
    goodCaption: "Only valid buckets are written.",
    takeaway: "Bounds-check the bucket index like any other array index.",
  },
  {
    title: "Scrub deleted entries",
    analogy:
      "shredding a file but keeping a perfect photocopy in the 'recently deleted' tray.",
    explain: [
      "Deleting an entry should destroy its data, but a common bug files the removed entry — key and value intact — into a deletion log or freed slot, where it stays recoverable.",
      "The fix is to clear the key and value before recording or releasing the entry.",
    ],
    bad: `removed = table.bucket.pop(i)
table.deleted_entries.append(removed)   # data intact`,
    good: `removed = table.bucket.pop(i)
removed.key = None
removed.value = None                    # scrub it
table.deleted_entries.append(removed)`,
    badCaption: "The deletion log still holds the secret.",
    goodCaption: "The entry is scrubbed before logging.",
    takeaway: "Erase the contents when you delete, not just the reference.",
  },
  {
    title: "Check ownership before updating",
    analogy:
      "a locker room where anyone can change the contents of anyone else's locker.",
    explain: [
      "When entries have owners, an update should be allowed only for the owning user. Skipping the check lets one user overwrite another's value.",
      "The fix is to compare the entry's owner against the requesting user before writing.",
    ],
    bad: `if entry.key == key:
    entry.value = new_value   # no ownership check`,
    good: `if entry.key == key:
    if entry.owner != requesting_user:
        raise AuthorizationError
    entry.value = new_value`,
    badCaption: "Any user can overwrite any entry.",
    goodCaption: "Only the owner may update the entry.",
    takeaway: "Authorize the caller against the specific entry.",
  },
  {
    title: "Reject bad and duplicate keys",
    analogy:
      "a guest list that lets two people share a name, or a stranger sign in as 'blank'.",
    explain: [
      "Two key-hygiene bugs. First: inserting a key that already exists breaks the one-entry-per-key rule and makes lookups ambiguous — check for it and reject duplicates.",
      "Second: accepting malformed keys (None, empty strings, non-strings) poisons the table and breaks code that assumes valid keys — validate keys on the way in.",
      "Try the demo: insert good and malformed keys with validation off, then on.",
    ],
    demo: KeyValidationDemo,
    bad: `def insert_entry(table, key, value):
    table.bucket.append(HashEntry(key, value))   # any key, even duplicates`,
    good: `def insert_entry(table, key, value):
    if not isinstance(key, str) or key == "":
        raise InvalidKeyError
    if any(e.key == key for e in table.bucket):
        raise DuplicateKeyError
    table.bucket.append(HashEntry(key, value))`,
    badCaption: "Malformed and duplicate keys corrupt the table.",
    goodCaption: "Only well-formed, unique keys get in.",
    takeaway: "Validate key shape and uniqueness before inserting.",
  },
  {
    title: "Cap collision chains, and lock rehashing",
    analogy:
      "one coat hook with a thousand coats piled on it — and everyone rebuilding the rack at the same time.",
    explain: [
      "Two performance-and-safety bugs. An attacker who forces many keys into one bucket makes its chain grow without bound, slowing every lookup — a denial of service. Cap the chain length and reject inserts past it.",
      "And when the table resizes and rehashes, doing so without a lock lets concurrent inserts lose or misplace entries. Wrap the resize-and-insert in a lock.",
      "Try the demo: flood one bucket with colliding keys, with the cap off then on.",
    ],
    demo: CollisionDemo,
    bad: `def insert_entry(table, key, value):
    table.bucket.append(...)   # unbounded chain; unsynchronized rehash`,
    good: `if len(table.bucket) >= MAX_CHAIN_LENGTH:
    raise BucketOverflowError
# ...and for resizing:
with self.lock:
    ...rehash and insert...`,
    badCaption: "Chains grow forever; rehash races corrupt the table.",
    goodCaption: "Bounded chains, and locked rehashing.",
    takeaway: "Bound collision chains and synchronize the rehash.",
  },
  {
    title: "Export only the logical contents",
    analogy:
      "handing someone a tidy list of guests — not your entire clipboard with the crossed-out names and scratch notes.",
    explain: [
      "export() should return the real key-value pairs, not the raw bucket structure. Returning the buckets exposes empty slots and internal markers (like deleted-entry placeholders) that callers should never see.",
      "The fix is to flatten the buckets into a list of (key, value) pairs and skip internal marker entries.",
    ],
    bad: `def export(self):
    return self.buckets   # empty slots + internal markers and all`,
    good: `def export(self):
    return [(e.key, e.value)
            for bucket in self.buckets
            for e in bucket
            if e.key != "__DELETED__"]`,
    badCaption: "Leaks internal structure and markers.",
    goodCaption: "Only real key-value pairs escape.",
    takeaway: "Expose the logical contents, never the internal storage.",
  },
];

const GLOSSARY: GlossaryItem[] = [
  { term: "key / value", def: "The lookup label (key) and the data it maps to (value)." },
  { term: "hash function", def: "Turns a key into a number used to pick a bucket." },
  { term: "bucket", def: "One slot of the underlying array where entries with the same hash go." },
  { term: "collision", def: "When two different keys hash to the same bucket." },
  { term: "chain", def: "The list of entries sharing one bucket after collisions." },
  { term: "rehash", def: "Rebuilding the table into more buckets when it gets too full." },
];
