"use client";

import type { LessonStep } from "../../LessonPlayer";
import { Snippet } from "../../lessonui";
import { HashTableVisualizer } from "../../interactives/HashTableVisualizer";
import { Quiz } from "@/components/Quiz";
import { OpsCosts, UsesGrid } from "../../FactsPanel";
import { DS_FACTS } from "@/lib/ds-facts";

const FACTS = DS_FACTS["hash-heist"];

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
          to the right slot. No scanning, no waiting.
        </p>
      </>
    ),
  },
  {
    title: "The magic step: hashing",
    sudo: "A number-blender for your keys.",
    content: (
      <>
        <p>
          A <span className="text-fg">hash function</span> takes any key —{" "}
          <span className="font-mono">&quot;alice&quot;</span>, an email, a
          whole file — and blends it into a number. Take that number{" "}
          <span className="font-mono">mod</span> the number of slots
          (&quot;buckets&quot;), and you get the bucket to use:
        </p>
        <Snippet
          code={`bucket = hash("alice") % num_buckets
#        └─ same key ─┘   └─ always the same bucket ┘`}
        />
        <p>
          The same key always hashes to the same bucket, so you can{" "}
          <span className="text-fg">store</span> and later{" "}
          <span className="text-fg">find</span> it without ever scanning.
        </p>
      </>
    ),
  },
  {
    title: "When two keys collide",
    sudo: "Pigeons, meet holes.",
    content: (
      <>
        <p>
          There are far more possible keys than buckets, so sometimes two
          different keys land in the <span className="text-fg">same</span>{" "}
          bucket. That&apos;s a <span className="text-accent">collision</span> —
          and it&apos;s normal, not a bug.
        </p>
        <p>
          The usual fix: each bucket holds a little{" "}
          <span className="text-fg">list</span>, and colliding entries chain up
          in it. Lookups hash to the bucket, then walk its short chain.
        </p>
      </>
    ),
  },
  {
    title: "Predict the collision cost",
    sudo: "What if the blender jams?",
    lock: true,
    content: (
      <Quiz
        question="A broken hash function sends ALL 1,000 keys into the same bucket. What does a lookup cost now?"
        options={[
          { text: "Still instant — O(1)", note: "Only if keys spread out. Piled in one bucket, you're back to scanning a list." },
          { text: "O(n) — you walk a 1,000-long chain", correct: true },
          { text: "The table refuses more than one key per bucket", note: "It won't refuse them — it chains them, and the chain is what gets slow." },
        ]}
        explain="A hash table is only O(1) when keys spread across buckets. Pile them all in one and lookups degrade to walking a list — O(n). Good hashing (and bounded chains) is what keeps it fast."
      />
    ),
  },
  {
    title: "Try it yourself",
    sudo: "Insert keys until two share a bucket!",
    content: (
      <>
        <p className="text-sm text-muted">
          Insert some keys and watch each get hashed to a bucket — add a few
          and you&apos;ll trigger a collision.
        </p>
        <HashTableVisualizer />
      </>
    ),
  },
  {
    title: "How fast is it?",
    sudo: "O(1) on a good day. Respect the caveat.",
    content: (
      <>
        <p>
          On average, a hash table does everything in{" "}
          <span className="font-mono text-accent">O(1)</span>{" "}
          — the fastest lookups in all of computing. The catch is that &quot;average&quot;:
          it assumes keys spread out. The worst case is{" "}
          <span className="font-mono text-amber-400">O(n)</span>, and attackers
          love to force it.
        </p>
        <OpsCosts ops={FACTS.ops} />
      </>
    ),
  },
  {
    title: "Where hash tables hide",
    sudo: "You used a dict five minutes ago.",
    content: (
      <>
        <p>They&apos;re everywhere you look something up by name:</p>
        <UsesGrid uses={FACTS.uses} />
      </>
    ),
  },
  {
    title: "Why hackers care",
    sudo: "Hashing done wrong = passwords for free.",
    content: (
      <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
        <p>
          Hash tables guard two treasures: <span className="font-semibold">speed</span>{" "}
          and <span className="font-semibold">secrets</span>. Attackers craft
          keys that all collide to grind a service to a halt, slip malformed
          keys into trusted tables — and when passwords are hashed carelessly,
          crack them by the million. How you hash decides whether a stolen
          database is a disaster or a dud.
        </p>
      </div>
    ),
  },
];
