"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 4 — the same "pay" can be clicked twice and charge twice, unless a
// one-time guard blocks the repeat.
export function ReplayDemo() {
  const [balance, setBalance] = useState(1000);
  const [used, setUsed] = useState(false);
  const [protect, setProtect] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function pay() {
    if (protect && used) {
      setNote("Already paid once — this repeat click is ignored.");
      return;
    }
    setBalance((b) => b - 200);
    if (protect) setUsed(true);
    setNote(
      protect
        ? "Paid $200. The guard now blocks any repeat click."
        : "Paid $200. Nothing stops you from clicking again…",
    );
  }

  function reset() {
    setBalance(1000);
    setUsed(false);
    setNote(null);
  }

  return (
    <div className="space-y-4">
      <Caption>
        {note ??
          "Click Pay a few times — like double-clicking or hitting back and resubmitting."}
      </Caption>

      <div className="rounded-lg border border-border bg-[#0a0a0c] p-4 text-center">
        <div className="text-xs uppercase tracking-wider text-muted">
          Account balance
        </div>
        <div
          className={`mt-1 font-mono text-3xl font-semibold ${
            balance < 1000 ? "text-red-400" : "text-fg"
          }`}
        >
          ${balance}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DemoButton variant="primary" onClick={pay}>
          Pay $200
        </DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
        <span className="ml-auto">
          <Toggle
            checked={protect}
            onChange={(v) => {
              setProtect(v);
              setUsed(false);
            }}
            label="Block repeat clicks"
          />
        </span>
      </div>
    </div>
  );
}
