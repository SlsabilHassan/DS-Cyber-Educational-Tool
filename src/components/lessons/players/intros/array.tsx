"use client";

import type { LessonStep } from "../../LessonPlayer";
import { Snippet } from "../../lessonui";
import { ArrayVisualizer } from "../../interactives/ArrayVisualizer";
import { Quiz } from "@/components/Quiz";
import { OpsCosts, UsesGrid } from "../../FactsPanel";
import { DS_FACTS } from "@/lib/ds-facts";

const FACTS = DS_FACTS["array-armory"];

export const arrayIntroSteps: LessonStep[] = [
  {
    title: "What's an array?",
    sudo: "Lockers. It all starts with lockers.",
    content: (
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
          <span className="text-fg">index</span> that starts at{" "}
          <span className="font-mono text-accent">0</span>, not 1.
        </p>
      </>
    ),
  },
  {
    title: "Why start counting at 0?",
    sudo: "The famous off-by-one trap starts here.",
    content: (
      <>
        <p>
          The index isn&apos;t a label — it&apos;s a{" "}
          <span className="text-fg">distance from the start</span>. Slot{" "}
          <span className="font-mono">[0]</span> is &quot;zero steps in,&quot;
          slot <span className="font-mono">[3]</span> is &quot;three steps
          in.&quot; The computer finds any slot with one line of arithmetic:
        </p>
        <Snippet code={`address = start + index × slot_size`} />
        <p>
          So a 5-slot array has valid indices{" "}
          <span className="font-mono text-accent">0, 1, 2, 3, 4</span> — there
          is no slot <span className="font-mono">[5]</span>. That missing last
          number is the source of endless bugs.
        </p>
      </>
    ),
  },
  {
    title: "Predict the last index",
    sudo: "Count carefully now…",
    lock: true,
    content: (
      <Quiz
        question="An array has 8 slots. What's the index of the very last one?"
        options={[
          { text: "8", note: "That's the count, not an index — indices stop one below the count." },
          { text: "7", correct: true },
          { text: "It depends on the language", note: "Not here — this array is zero-indexed, so the last index is always count − 1." },
        ]}
        explain="Indices run 0 through 7 for 8 slots — the last is always count − 1. Reaching for [8] steps one slot past the end, into memory that isn't yours."
      />
    ),
  },
  {
    title: "Try it yourself",
    sudo: "Click around. Arrays don't bite. Usually.",
    content: (
      <>
        <p className="text-sm text-muted">
          Insert values (they fill from index 0), then click a cell to remove
          it and watch the rest shift left to close the gap.
        </p>
        <ArrayVisualizer />
      </>
    ),
  },
  {
    title: "How fast is it?",
    sudo: "Instant reads, pricey middle-inserts.",
    content: (
      <>
        <p>
          <span className="font-mono text-accent">O(1)</span>{" "}
          is &quot;same cost at any size&quot;;{" "}
          <span className="font-mono text-amber-400">O(n)</span>{" "}
          grows with the array. The pattern to notice: arrays are unbeatable at{" "}
          <span className="text-fg">jumping to a known slot</span>, but slow
          whenever data has to <span className="text-fg">shift</span>.
        </p>
        <OpsCosts ops={FACTS.ops} />
      </>
    ),
  },
  {
    title: "Why is the middle slow?",
    sudo: "Picture the dominoes falling.",
    lock: true,
    content: (
      <Quiz
        question="Removing the first item of a 1,000-element array is O(n). Why?"
        options={[
          { text: "The computer has to search for it first", note: "No search needed — it's at index 0. The cost is what happens after." },
          { text: "All 999 items behind it shift left by one", correct: true },
          { text: "Arrays can't remove items at all", note: "They can — it just means shifting everything after the gap to close it." },
        ]}
        explain="There are no gaps allowed in an array, so removing from the front drags every later item one slot left — 999 moves. Removing from the end costs nothing."
      />
    ),
  },
  {
    title: "You've used arrays today. Constantly.",
    sudo: "They're the atoms of everything.",
    content: (
      <>
        <p>
          Arrays are so fundamental that most other structures are secretly
          built on them:
        </p>
        <UsesGrid uses={FACTS.uses} />
      </>
    ),
  },
  {
    title: "Why hackers care",
    sudo: "And THIS is why we bounds-check.",
    content: (
      <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
        <p>
          That one-line address formula has no built-in guardrail. Ask for
          locker <span className="font-mono">[500]</span> in a row of 5 and the
          computer computes an address and reaches in anyway — into memory that{" "}
          <span className="font-semibold">isn&apos;t yours</span>.
          Out-of-bounds reads leak secrets; out-of-bounds writes corrupt or
          hijack the program. It&apos;s one of the oldest and deadliest bug
          classes in computing.
        </p>
      </div>
    ),
  },
];
