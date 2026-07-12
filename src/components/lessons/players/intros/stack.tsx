"use client";

import type { LessonStep } from "../../LessonPlayer";
import { Snippet } from "../../lessonui";
import { StackVisualizer } from "../../StackLesson";
import { BreakTheStack } from "../../BreakTheStack";

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
    ),
  },
  {
    title: "Try it yourself",
    sudo: "Push a few, then pop. Watch the order!",
    content: (
      <>
        <p className="text-sm text-muted">
          The <span className="text-fg">last</span> item you push always comes
          out <span className="text-fg">first</span>.
        </p>
        <StackVisualizer />
      </>
    ),
  },
  {
    title: "The hidden stack: the call stack",
    sudo: "Here's the part most courses skip.",
    content: (
      <>
        <p>
          Every time your program calls a function, it pushes a little
          &quot;frame&quot; onto a stack — the function&apos;s data{" "}
          <span className="text-fg">and</span> a{" "}
          <span className="text-fg">return address</span> (where to jump back to
          when it&apos;s done). When the function returns, its frame is popped.
        </p>
        <Snippet
          code={`def greet():
    name = "Sam"          # lives in greet's frame
    return welcome(name)  # pushes welcome's frame on top`}
        />
      </>
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
          the program somewhere it should never go.
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
