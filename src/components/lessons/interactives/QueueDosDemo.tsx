"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 6 — an unbounded queue grows until memory runs out; a size cap
// rejects the flood instead.
const MAX = 10;

export function QueueDosDemo() {
  const [count, setCount] = useState(0);
  const [cap, setCap] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function send(n: number) {
    if (cap) {
      const room = MAX - count;
      if (room <= 0) {
        setNote("QueueFullError — the queue is at its limit, so extra jobs are rejected.");
        return;
      }
      const added = Math.min(room, n);
      setCount(count + added);
      setNote(`Accepted ${added} job(s). The queue is capped at ${MAX}.`);
      return;
    }
    setCount(count + n);
    setNote(`Accepted ${n} job(s). Nothing is stopping the queue from growing…`);
  }

  function reset() {
    setCount(0);
    setNote(null);
  }

  const over = !cap && count > MAX;
  const barPct = Math.min(100, (count / (MAX * 1.5)) * 100);

  return (
    <div className="space-y-4">
      <Caption>
        {note ??
          "Play the attacker: flood the queue with jobs and watch it grow. Then turn on the size cap."}
      </Caption>

      <div className="rounded-lg border border-border bg-[#0a0a0c] p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>queue length</span>
          <span>
            <span className={over ? "text-red-400" : "text-fg"}>{count}</span> / cap {MAX}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-surface-2">
          <div
            className={`h-full rounded-full transition-all ${over ? "bg-red-500" : "bg-accent"}`}
            style={{ width: `${barPct}%` }}
          />
        </div>
        {over && (
          <p className="mt-2 text-xs text-red-400">
            Past the safe limit — a real server would be running out of memory here.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DemoButton variant="primary" onClick={() => send(1)}>
          Send a job
        </DemoButton>
        <DemoButton onClick={() => send(25)}>Flood (+25)</DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
        <span className="ml-auto">
          <Toggle checked={cap} onChange={(v) => { setCap(v); reset(); }} label={`Enforce max (${MAX})`} />
        </span>
      </div>
    </div>
  );
}
