"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mascot } from "@/components/Mascot";
import {
  recordItemResponse,
  type AssessmentItem,
  type Phase,
} from "@/lib/assessment";
import {
  ChoiceView,
  OrderView,
  SpotBugView,
  LikertView,
  type AnswerFn,
} from "./items";

const CONFIDENCE = ["Guessing", "Unsure", "Fairly sure", "Confident", "Certain"];

// Runs a sequence of interactive items one screen at a time. Times each item,
// asks confidence on scored items, records every answer, and shows a finish
// screen. The participant can't go back (protects measurement integrity).
export function Assessment({
  phase,
  form,
  items,
  title,
  cta,
}: {
  phase: Phase;
  form: string;
  items: AssessmentItem[];
  title: string;
  cta: { href: string; label: string };
}) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<{
    response: Record<string, unknown>;
    correct: boolean | null;
  } | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const startedAt = useRef<number>(Date.now());

  const total = items.length;
  const finished = index >= total;
  const item = finished ? null : items[index];

  // Reset the clock and answer state whenever we land on a new item.
  useEffect(() => {
    startedAt.current = Date.now();
    setAnswer(null);
    setConfidence(null);
  }, [index]);

  const onAnswer: AnswerFn = (response, correct) =>
    setAnswer({ response, correct });

  const needsConfidence = !!item && item.kind !== "likert" && item.askConfidence;
  const answered = answer !== null;
  const canAdvance = answered && (!needsConfidence || confidence !== null);

  function next() {
    if (!item || !answer) return;
    void recordItemResponse(phase, form, {
      item,
      correct: answer.correct,
      confidence: needsConfidence ? confidence : null,
      timeMs: Date.now() - startedAt.current,
      response: answer.response,
    });
    setIndex((n) => n + 1);
  }

  if (finished) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <Mascot size={110} />
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-fg">
          {phase === "pre" ? "Pre-test complete!" : "All done — thank you!"}
        </h1>
        <p className="mt-2 text-muted">
          {phase === "pre"
            ? "Now work through your assigned module(s). Come back for the post-test when you're finished."
            : "Your responses are recorded anonymously. You can withdraw your data anytime by contacting the investigators."}
        </p>
        <Link
          href={cta.href}
          className="mt-8 rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-bg transition-opacity hover:opacity-90"
        >
          {cta.label}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1">
          {items.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < index ? "bg-accent" : i === index ? "bg-accent/40" : "bg-surface-2"
              }`}
            />
          ))}
        </div>
        <span className="shrink-0 text-xs text-muted">
          {index + 1} / {total}
        </span>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {item!.kind === "likert" ? "Your view" : "Question"}
        </span>
        <h2 className="mt-2 text-lg font-semibold text-fg">{item!.prompt}</h2>

        <div className="mt-5">
          {item!.kind === "choice" && <ChoiceView item={item!} onAnswer={onAnswer} />}
          {item!.kind === "order" && <OrderView item={item!} onAnswer={onAnswer} />}
          {item!.kind === "spotbug" && <SpotBugView item={item!} onAnswer={onAnswer} />}
          {item!.kind === "likert" && <LikertView item={item!} onAnswer={onAnswer} />}
        </div>

        {/* Confidence rating (scored items only, once answered) */}
        {needsConfidence && answered && (
          <div className="mt-6 border-t border-border pt-5">
            <p className="text-sm text-muted">How sure are you?</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-5">
              {CONFIDENCE.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setConfidence(i + 1)}
                  className={`rounded-xl border px-3 py-2.5 text-center text-xs transition-colors ${
                    confidence === i + 1
                      ? "border-accent bg-accent/10 text-fg"
                      : "border-border bg-surface-2 text-muted hover:border-accent/60 hover:text-fg"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={next}
          disabled={!canAdvance}
          className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {index === total - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
