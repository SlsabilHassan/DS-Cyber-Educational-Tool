"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 3 — a regular user shouldn't be able to raise a task above the
// user-priority cap; only admins can. Lower number = more urgent.
const CAP = 5;

export function EscalationDemo() {
  const [admin, setAdmin] = useState(false);
  const [enforce, setEnforce] = useState(false);
  const [priority, setPriority] = useState(5);
  const [note, setNote] = useState<string | null>(null);

  function setTo(p: number) {
    // "urgent" means priority number below the cap (e.g. 1)
    const wantsHigh = p < CAP;
    if (enforce && wantsHigh && !admin) {
      setNote(`AuthorizationError — a regular user can't set priority above the cap (${CAP}).`);
      return;
    }
    setPriority(p);
    setNote(
      wantsHigh && !admin
        ? "A regular user just escalated their task to the front of the queue."
        : `Priority set to ${p}.`,
    );
  }

  function reset() {
    setPriority(5);
    setNote(null);
  }

  const escalated = priority < CAP && !admin && !enforce;

  return (
    <div className="space-y-4">
      <Caption>
        {note ??
          `You're editing a task's priority (lower = more urgent). Try escalating it to priority 1 as a regular user, with the check off then on.`}
      </Caption>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted">You are:</span>
        {[false, true].map((isAdmin) => (
          <button
            key={String(isAdmin)}
            onClick={() => { setAdmin(isAdmin); reset(); }}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              admin === isAdmin
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:text-fg"
            }`}
          >
            {isAdmin ? "admin" : "regular user"}
          </button>
        ))}
      </div>

      <div
        className={`rounded-lg border px-4 py-3 text-center font-mono text-sm ${
          escalated
            ? "border-red-500/50 bg-red-500/10 text-red-400"
            : "border-border bg-surface text-fg"
        }`}
      >
        task priority = {priority}
        {escalated && "  ← escalated!"}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DemoButton variant="primary" onClick={() => setTo(1)}>
          Set to 1 (most urgent)
        </DemoButton>
        <DemoButton onClick={() => setTo(5)}>Set to 5 (allowed)</DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
        <span className="ml-auto">
          <Toggle checked={enforce} onChange={(v) => { setEnforce(v); reset(); }} label="Enforce user cap" />
        </span>
      </div>
    </div>
  );
}
