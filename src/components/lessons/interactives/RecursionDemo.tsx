"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 6 — each call stacks a frame; too many overflow the stack. A safe
// cap stops it cleanly instead of crashing.
const LIMIT = 8;

export function RecursionDemo() {
  const [frames, setFrames] = useState(1);
  const [safe, setSafe] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [stopped, setStopped] = useState(false);

  function callAgain() {
    if (crashed || stopped) return;
    if (frames >= LIMIT) {
      if (safe) setStopped(true);
      else setCrashed(true);
      return;
    }
    setFrames((f) => f + 1);
  }

  function reset() {
    setFrames(1);
    setCrashed(false);
    setStopped(false);
  }

  let note =
    "Each call stacks another frame. Keep calling and watch what happens when the stack fills up.";
  if (crashed)
    note =
      "RecursionError — the call stack overflowed and the whole program crashed.";
  else if (stopped)
    note =
      "InputTooDeepError — safe mode stopped at the limit instead of crashing.";
  else if (frames >= LIMIT)
    note = safe
      ? "You're at the limit. One more call gets stopped safely."
      : "You're at the limit. One more call overflows the stack!";

  return (
    <div className="space-y-4">
      <Caption>{note}</Caption>

      <div className="rounded-lg border border-border bg-[#0a0a0c] p-3">
        <div className="mb-2 flex justify-between text-xs text-muted">
          <span>call stack</span>
          <span>limit {LIMIT}</span>
        </div>
        <div className="flex flex-col-reverse gap-1">
          {Array.from({ length: frames }).map((_, i) => (
            <div
              key={i}
              className="rounded border border-border bg-surface px-3 py-1 font-mono text-xs text-fg/70"
            >
              frame #{i + 1}
            </div>
          ))}
          {crashed && (
            <div className="rounded border border-red-500/50 bg-red-500/10 px-3 py-1 font-mono text-xs text-red-400">
              💥 stack overflow
            </div>
          )}
          {stopped && (
            <div className="rounded border border-accent/50 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
              stopped safely at the cap
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DemoButton
          variant="primary"
          onClick={callAgain}
          disabled={crashed || stopped}
        >
          Call the function again
        </DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
        <span className="ml-auto">
          <Toggle
            checked={safe}
            onChange={(v) => {
              setSafe(v);
              reset();
            }}
            label="Safe mode (cap the depth)"
          />
        </span>
      </div>
    </div>
  );
}
