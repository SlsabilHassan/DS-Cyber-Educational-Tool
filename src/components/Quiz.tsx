"use client";

import { useState } from "react";
import { useStepUnlock } from "@/components/lessons/LessonPlayer";
import { track } from "@/lib/analytics";

export type QuizOption = {
  text: string;
  correct?: boolean;
  note?: string; // feedback shown when this option is picked
};

// A Brilliant-style check-in: the learner must commit to an answer before
// moving on. Wrong picks stay marked with feedback and they can retry; after
// two misses a "show me" escape hatch appears. A correct answer (or the
// reveal) unlocks the step's Continue button via useStepUnlock.
export function Quiz({
  question,
  options,
  explain,
}: {
  question: string;
  options: QuizOption[];
  explain?: string; // shown once the correct answer is on the table
}) {
  const unlock = useStepUnlock();
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [solved, setSolved] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const done = solved || revealed;
  const misses = [...picked].filter((i) => !options[i].correct).length;

  function pick(i: number) {
    if (done) return;
    setPicked((prev) => new Set(prev).add(i));
    track("quiz_answer", {
      question,
      choice: options[i].text,
      correct: !!options[i].correct,
    });
    if (options[i].correct) {
      setSolved(true);
      unlock();
    }
  }

  function reveal() {
    setRevealed(true);
    track("quiz_reveal", { question });
    unlock();
  }

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-fg">{question}</p>
        <span className="shrink-0 rounded-full border border-accent/40 px-2.5 py-1 text-[10px] uppercase tracking-wider text-accent">
          Quick check
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        {options.map((o, i) => {
          const wasPicked = picked.has(i);
          const showCorrect = done && o.correct;
          const showWrong = wasPicked && !o.correct;
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={done || showWrong}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                showCorrect
                  ? "border-accent bg-accent/10 text-fg"
                  : showWrong
                    ? "border-red-500/50 bg-red-500/10 text-fg/70"
                    : done
                      ? "border-border text-muted"
                      : "border-border bg-surface text-fg hover:border-accent/60"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span>{o.text}</span>
                {showCorrect && <span className="shrink-0 text-accent">✓</span>}
                {showWrong && <span className="shrink-0 text-red-400">✕</span>}
              </span>
              {showWrong && o.note && (
                <span className="mt-1.5 block text-xs leading-relaxed text-red-300/80">
                  {o.note}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {done ? (
        <p className="mt-4 rounded-lg border border-accent/25 bg-accent/5 px-4 py-3 text-sm leading-relaxed text-fg/90">
          <span className="font-semibold text-accent">
            {solved ? "Exactly right. " : "Here's the idea: "}
          </span>
          {explain ??
            options.find((o) => o.correct)?.note ??
            "That's the one."}
        </p>
      ) : (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {misses === 0
              ? "Commit to an answer — guessing is allowed."
              : "Not that one — take another look."}
          </p>
          {misses >= 2 && (
            <button
              onClick={reveal}
              className="shrink-0 text-xs text-muted underline underline-offset-4 transition-colors hover:text-fg"
            >
              Show me
            </button>
          )}
        </div>
      )}
    </div>
  );
}
