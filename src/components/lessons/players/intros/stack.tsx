"use client";

import type { LessonStep } from "../../LessonPlayer";
import { Snippet } from "../../lessonui";
import { StackVisualizer } from "../../StackLesson";
import { BreakTheStack } from "../../BreakTheStack";
import { Quiz } from "@/components/Quiz";
import { OpsCosts, UsesGrid } from "../../FactsPanel";
import { DS_FACTS } from "@/lib/ds-facts";

const FACTS = DS_FACTS["stack-smashing"];

export const stackIntroSteps: LessonStep[] = [
  {
    title: "What's a stack?",
    sudo: "Plates first. Hacking later. Promise.",
    content: (
      <>
        <p>
          Imagine a stack of plates. You add a new plate on{" "}
          <span className="text-fg">top</span>, and when you need one, you take
          it from the <span className="text-fg">top</span> too.
        </p>
        <p>
          You can&apos;t slide a plate out of the middle without lifting the ones
          above it. That&apos;s a stack: the{" "}
          <span className="text-fg">last thing in is the first thing out</span> —
          programmers call it <span className="text-accent">LIFO</span>.
        </p>
      </>
    ),
  },
  {
    title: "Two moves: push and pop",
    sudo: "Two moves. Easier than chess.",
    content: (
      <>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface-2 p-4">
            <div className="font-mono text-sm text-accent">push</div>
            <p className="mt-1 text-sm text-muted">
              Put something new on the top of the stack.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface-2 p-4">
            <div className="font-mono text-sm text-accent">pop</div>
            <p className="mt-1 text-sm text-muted">
              Take the top thing off — and you get it back.
            </p>
          </div>
        </div>
        <p className="text-sm text-muted">
          Everything a stack can do is built from these two. No inserting in
          the middle, no peeking at the bottom — and that discipline is
          exactly what makes stacks fast.
        </p>
      </>
    ),
  },
  {
    title: "Predict before you touch",
    sudo: "No pressure. Okay, some pressure.",
    lock: true,
    content: (
      <>
        <p>
          You push <span className="font-mono text-accent">A</span>, then{" "}
          <span className="font-mono text-accent">B</span>, then{" "}
          <span className="font-mono text-accent">C</span>. Now you pop twice.
        </p>
        <Quiz
          question="What do the two pops hand back, in order?"
          options={[
            {
              text: "A, then B",
              note: "That would be a queue — first in, first out. A stack works from the top.",
            },
            {
              text: "C, then B",
              correct: true,
            },
            {
              text: "C, then A",
              note: "Close — the first pop is C, but B is now on top, so it goes next.",
            },
          ]}
          explain="C went on last, so it's on top and pops first. That exposes B, which pops second. Last in, first out."
        />
      </>
    ),
  },
  {
    title: "Now verify it yourself",
    sudo: "Push a few, then pop. Were you right?",
    content: (
      <>
        <p className="text-sm text-muted">
          Push <span className="font-mono">A</span>,{" "}
          <span className="font-mono">B</span>,{" "}
          <span className="font-mono">C</span> and pop twice — watch your
          prediction come true.
        </p>
        <StackVisualizer />
      </>
    ),
  },
  {
    title: "How a stack lives in memory",
    sudo: "Peek behind the curtain with me.",
    content: (
      <>
        <p>
          Under the hood, a stack is usually just an{" "}
          <span className="text-fg">array plus one number</span>: a marker
          that remembers where the top is.
        </p>
        <Snippet
          code={`slots:  [ "a" | "b" | "c" |  ?  |  ?  ]
                    ▲
                   top = 2   (index of the top item)`}
        />
        <p>
          <span className="font-mono text-accent">push</span> writes at{" "}
          <span className="font-mono">top + 1</span> and moves the marker up.{" "}
          <span className="font-mono text-accent">pop</span> reads the top slot
          and moves the marker <span className="text-fg">down</span> — notice
          it doesn&apos;t erase anything. Keep that detail in your pocket;
          it&apos;ll matter later.
        </p>
      </>
    ),
  },
  {
    title: "How fast is it?",
    sudo: "Speed isn't luck — it's design.",
    content: (
      <>
        <p>
          <span className="font-mono text-accent">O(1)</span>{" "}
          means &quot;the same tiny cost no matter how big the stack is&quot; —{" "}
          <span className="font-mono text-amber-400">O(n)</span>{" "}
          means &quot;the cost grows with the size.&quot; Here&apos;s the
          stack&apos;s report card, with the reasons:
        </p>
        <OpsCosts ops={FACTS.ops} />
      </>
    ),
  },
  {
    title: "Check your intuition",
    sudo: "Think about that top marker…",
    lock: true,
    content: (
      <Quiz
        question="A stack holds 10 items. Another holds 10 million. How much longer does push take on the big one?"
        options={[
          {
            text: "About a million times longer",
            note: "Push never looks at the other items — it only touches the top slot.",
          },
          {
            text: "A little longer, maybe double",
            note: "Even 'a little' is too much — push does the exact same two things either way.",
          },
          { text: "No longer at all", correct: true },
        ]}
        explain="Push writes one slot and moves one marker — the same work whether the stack holds 10 items or 10 million. That's what O(1) means."
      />
    ),
  },
  {
    title: "You've used a stack today. Several.",
    sudo: "Stacks are hiding everywhere. Everywhere!",
    content: (
      <>
        <p>
          Once you know the shape, you&apos;ll spot it constantly:
        </p>
        <UsesGrid uses={FACTS.uses} />
      </>
    ),
  },
  {
    title: "The hidden stack: the call stack",
    sudo: "Here's the part most courses skip.",
    content: (
      <>
        <p>
          The most important stack on your computer is one you never see.
          Every time your program calls a function, it pushes a little
          &quot;frame&quot; onto the <span className="text-fg">call stack</span>{" "}
          — the function&apos;s local variables{" "}
          <span className="text-fg">and</span> a{" "}
          <span className="text-fg">return address</span> (where to jump back
          to when it&apos;s done). When the function returns, its frame is
          popped.
        </p>
        <Snippet
          code={`def greet():
    name = "Sam"          # lives in greet's frame
    return welcome(name)  # pushes welcome's frame on top`}
        />
        <p className="text-sm text-muted">
          That&apos;s why a function that calls itself forever crashes with
          &quot;stack overflow&quot; — the pushes never stop.
        </p>
      </>
    ),
  },
  {
    title: "What's in a frame?",
    sudo: "This one matters. A lot.",
    lock: true,
    content: (
      <Quiz
        question="A function's frame on the call stack holds its local variables and…"
        options={[
          {
            text: "A copy of the whole program",
            note: "Far too big — a frame is tiny, just what one call needs.",
          },
          {
            text: "The return address: where to jump back to",
            correct: true,
          },
          {
            text: "A list of every function ever called",
            note: "The stack as a whole records the active calls — each frame only knows its own way back.",
          },
        ]}
        explain="Each frame carries the address to jump back to when the function finishes. Your data and that address sit side by side in memory — remember that."
      />
    ),
  },
  {
    title: "The key idea",
    sudo: "Lean in. This is the whole module.",
    content: (
      <div className="rounded-xl border border-accent/25 bg-accent/5 p-5">
        <p>
          Because that &quot;return address&quot; sits right next to your data on
          the stack, if you can write <span className="font-semibold">past</span>{" "}
          where your data should stop, you can overwrite the address — and send
          the program somewhere it should never go. A huge share of real-world
          attacks, from the 1988 Morris worm onward, start exactly here.
        </p>
      </div>
    ),
  },
  {
    title: "Break the stack yourself",
    sudo: "Go on, overflow it. I won't tell anyone.",
    content: (
      <>
        <p className="text-sm text-muted">
          Overflow the buffer and watch what it does to the return address. Then
          flip on the bounds check and stop it.
        </p>
        <BreakTheStack />
      </>
    ),
  },
];
