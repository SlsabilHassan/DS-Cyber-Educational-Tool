"use client";

import { useMemo, useState } from "react";
import type {
  ChoiceItem,
  OrderItem,
  SpotBugItem,
  LikertItem,
} from "@/lib/assessment";

// Each item component reports the participant's answer up via `onAnswer`,
// which carries the raw response and whether it was correct (null for likert).
// Components do NOT reveal correctness — this is a test, not a lesson.
export type AnswerFn = (
  response: Record<string, unknown>,
  correct: boolean | null,
) => void;

function seededShuffle<T>(arr: T[], seed: string): T[] {
  // Deterministic shuffle so the same item looks the same within a session.
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const a = arr.map((v, i) => ({ v, k: (h = (h * 1103515245 + 12345 + i) >>> 0) }));
  a.sort((x, y) => x.k - y.k);
  return a.map((o) => o.v);
}

// ── Choice / predict-the-output ───────────────────────────────────────
export function ChoiceView({
  item,
  onAnswer,
}: {
  item: ChoiceItem;
  onAnswer: AnswerFn;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div>
      {item.code && (
        <pre className="mb-4 overflow-x-auto rounded-lg border border-border bg-[#0a0a0c] p-4 font-mono text-[13px] leading-relaxed text-fg/90">
          <code>{item.code}</code>
        </pre>
      )}
      <div className="grid gap-2">
        {item.options.map((o, i) => (
          <button
            key={i}
            onClick={() => {
              setPicked(i);
              onAnswer({ choice: i, text: o.text }, !!o.correct);
            }}
            className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
              picked === i
                ? "border-accent bg-accent/10 text-fg"
                : "border-border bg-surface text-fg hover:border-accent/60"
            }`}
          >
            {o.text}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Ordering (click steps into sequence) ──────────────────────────────
export function OrderView({
  item,
  onAnswer,
}: {
  item: OrderItem;
  onAnswer: AnswerFn;
}) {
  // Display shuffled; the correct order is the item.steps array order.
  const shuffled = useMemo(
    () => seededShuffle(item.steps.map((text, idx) => ({ text, idx })), item.id),
    [item],
  );
  const [seq, setSeq] = useState<number[]>([]); // original indices, in chosen order

  function toggle(origIdx: number) {
    const next = seq.includes(origIdx)
      ? seq.filter((x) => x !== origIdx)
      : [...seq, origIdx];
    setSeq(next);
    // Report from the event handler (not inside a state updater).
    if (next.length === item.steps.length) {
      onAnswer({ order: next }, next.every((v, i) => v === i));
    } else {
      onAnswer({ order: next }, null); // incomplete → not yet answerable
    }
  }

  return (
    <div>
      <p className="mb-3 text-xs text-muted">
        Click the steps in order — the number shows your placement.
      </p>
      <div className="grid gap-2">
        {shuffled.map(({ text, idx }) => {
          const pos = seq.indexOf(idx);
          const placed = pos !== -1;
          return (
            <button
              key={idx}
              onClick={() => toggle(idx)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                placed
                  ? "border-accent bg-accent/10 text-fg"
                  : "border-border bg-surface text-fg hover:border-accent/60"
              }`}
            >
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                  placed
                    ? "bg-accent text-bg"
                    : "border border-border text-muted"
                }`}
              >
                {placed ? pos + 1 : ""}
              </span>
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Spot the vulnerable line ───────────────────────────────────────────
export function SpotBugView({
  item,
  onAnswer,
}: {
  item: SpotBugItem;
  onAnswer: AnswerFn;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[#0a0a0c]">
      {item.codeLines.map((line, i) => (
        <button
          key={i}
          onClick={() => {
            setPicked(i);
            onAnswer({ line: i }, i === item.buggyLine);
          }}
          className={`flex w-full items-start gap-3 px-4 py-1.5 text-left font-mono text-[13px] leading-relaxed transition-colors ${
            picked === i
              ? "bg-accent/15 text-fg"
              : "text-fg/90 hover:bg-white/5"
          }`}
        >
          <span className="w-5 shrink-0 select-none text-right text-muted/50">
            {i + 1}
          </span>
          <span className="whitespace-pre">{line || " "}</span>
        </button>
      ))}
    </div>
  );
}

// ── Likert self-report (no correct answer) ────────────────────────────
const LIKERT = [
  "Strongly disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly agree",
];

export function LikertView({
  item,
  onAnswer,
}: {
  item: LikertItem;
  onAnswer: AnswerFn;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div>
      <p className="mb-4 rounded-lg border-l-2 border-accent/40 bg-accent/5 px-4 py-3 text-sm text-fg/90">
        {item.statement}
      </p>
      <div className="grid gap-2 sm:grid-cols-5">
        {LIKERT.map((label, i) => (
          <button
            key={i}
            onClick={() => {
              setPicked(i);
              onAnswer({ value: i + 1, label }, null);
            }}
            className={`rounded-xl border px-3 py-3 text-center text-xs transition-colors ${
              picked === i
                ? "border-accent bg-accent/10 text-fg"
                : "border-border bg-surface text-muted hover:border-accent/60 hover:text-fg"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
