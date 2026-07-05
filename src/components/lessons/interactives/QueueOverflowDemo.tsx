"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 1 — writing past a fixed-capacity queue spills into the admin flag
// that lives right after it, unless a capacity check blocks the write.
const CAP = 8;

export function QueueOverflowDemo() {
  const [slots, setSlots] = useState<(number | null)[]>(Array(CAP).fill(null));
  const [tail, setTail] = useState(0);
  const [admin, setAdmin] = useState(0); // 0 = user mode, 1 = admin mode
  const [check, setCheck] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function enqueue() {
    setBlocked(false);
    if (tail >= CAP) {
      if (check) {
        setBlocked(true);
        setNote("QueueOverflowError — the queue is full, so the write is rejected.");
        return;
      }
      // no capacity check: the write spills into the adjacent admin flag
      setAdmin(1);
      setNote("Write spilled past the queue and overwrote the admin flag!");
      return;
    }
    const next = [...slots];
    next[tail] = 0x41;
    setSlots(next);
    setTail(tail + 1);
    setNote(`Enqueued into slot ${tail}.`);
  }

  function reset() {
    setSlots(Array(CAP).fill(null));
    setTail(0);
    setAdmin(0);
    setBlocked(false);
    setNote(null);
  }

  return (
    <div className="space-y-4">
      <Caption>
        {note ??
          "Fill the 8-slot queue, then enqueue once more and watch what happens to the admin flag."}
      </Caption>

      <div className="flex flex-wrap items-center gap-1.5">
        {slots.map((v, i) => (
          <div
            key={i}
            className={`flex h-10 w-10 items-center justify-center rounded border font-mono text-xs ${
              v !== null
                ? "border-white/20 bg-surface-2 text-fg"
                : "border-border text-muted/40"
            }`}
          >
            {v !== null ? "0x41" : "·"}
          </div>
        ))}
        <span className="mx-1 text-muted">›</span>
        <div
          className={`flex h-10 items-center justify-center rounded border px-3 font-mono text-xs ${
            admin === 1
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : "border-accent/40 bg-accent/10 text-accent"
          }`}
        >
          admin={admin === 1 ? "ADMIN" : "user"}
        </div>
      </div>

      {blocked && (
        <p className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-sm text-accent">
          QueueOverflowError — write rejected, admin flag safe.
        </p>
      )}
      {admin === 1 && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          Exploit succeeded — the attacker is now in admin mode.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <DemoButton variant="primary" onClick={enqueue}>
          Enqueue 0x41
        </DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
        <span className="ml-auto">
          <Toggle checked={check} onChange={(v) => { setCheck(v); reset(); }} label="Capacity check" />
        </span>
      </div>
    </div>
  );
}
