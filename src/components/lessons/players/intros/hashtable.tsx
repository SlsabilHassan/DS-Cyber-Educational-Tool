"use client";

import type { LessonStep } from "../../LessonPlayer";
import { Snippet } from "../../lessonui";
import { HashTableVisualizer } from "../../interactives/HashTableVisualizer";

export const hashTableIntroSteps: LessonStep[] = [
  {
    title: "What's a hash table?",
    sudo: "Coat check, but for data.",
    content: (
      <>
        <p>
          Imagine a coat check. You hand over your coat and get a number; to
          find it again, the attendant goes straight to that numbered hook — no
          searching the whole rack.
        </p>
        <p>
          A hash table works the same way: it turns your{" "}
          <span className="text-fg">key</span> into a number and jumps straight
          to the right slot.
        </p>
      </>
    ),
  },
  {
    title: "Hash functions, buckets, collisions",
    sudo: "Three words, one superpower.",
    content: (
      <>
        <p>
          The number comes from a{" "}
          <span className="text-fg">hash function</span>, and the slots are
          called <span className="text-fg">buckets</span>. That&apos;s what makes
          dictionary lookups near-instant.
        </p>
        <p>
          When two keys land on the same bucket, that&apos;s a{" "}
          <span className="text-accent">collision</span> — the entries chain
          together inside that bucket, and lookups walk the chain.
        </p>
      </>
    ),
  },
  {
    title: "Try it yourself",
    sudo: "Insert keys until two share a bucket!",
    content: (
      <>
        <p className="text-sm text-muted">
          Insert some keys and watch each get hashed to a bucket — add a few
          and you&apos;ll see a collision.
        </p>
        <HashTableVisualizer />
      </>
    ),
  },
  {
    title: "The same thing, in code",
    sudo: "Every Python dict is one of these.",
    content: (
      <Snippet
        code={`table = {}
table["alice"] = "AliceSecret"   # key -> hashed -> bucket -> stored
print(table["alice"])            # O(1) lookup, no scanning`}
      />
    ),
  },
  {
    title: "Why hackers care",
    sudo: "Hashing done wrong = passwords for free.",
    content: (
      <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
        <p>
          Hash tables guard two treasures: <span className="font-semibold">speed</span>{" "}
          and <span className="font-semibold">secrets</span>. Attackers force
          collisions to grind lookups to a crawl, slip bad keys into trusted
          tables — and when passwords are hashed carelessly, crack them by the
          million. How you hash decides whether a stolen database is a
          disaster or a dud.
        </p>
      </div>
    ),
  },
];
