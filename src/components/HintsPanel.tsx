"use client";

import { useState } from "react";

// Reveals hints one at a time so learners can take the smallest nudge they
// need instead of seeing the whole answer at once.
export function HintsPanel({ hints }: { hints: string[] }) {
  const [revealed, setRevealed] = useState(0);

  if (hints.length === 0) return null;

  const allShown = revealed >= hints.length;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Stuck? Take a hint
          </h3>
          <p className="mt-1 text-xs text-muted">
            Revealed one at a time — stop as soon as you&apos;ve got it.
          </p>
        </div>
        {revealed > 0 && (
          <span className="shrink-0 text-xs text-muted">
            {Math.min(revealed, hints.length)} / {hints.length}
          </span>
        )}
      </div>

      {revealed > 0 && (
        <ol className="mt-4 space-y-3">
          {hints.slice(0, revealed).map((hint, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-lg border border-border bg-surface-2 p-3"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-fg/90">{hint}</p>
            </li>
          ))}
        </ol>
      )}

      {!allShown && (
        <button
          onClick={() => setRevealed((n) => n + 1)}
          className="mt-4 rounded-full border border-border px-4 py-2 text-sm text-fg transition-colors hover:border-accent hover:bg-white/5"
        >
          {revealed === 0
            ? "Reveal a hint"
            : `Show next hint (${revealed + 1} of ${hints.length})`}
        </button>
      )}

      {allShown && (
        <p className="mt-4 text-xs text-muted">
          That&apos;s every hint — the rest is yours to figure out. You&apos;ve
          got this.
        </p>
      )}
    </div>
  );
}
