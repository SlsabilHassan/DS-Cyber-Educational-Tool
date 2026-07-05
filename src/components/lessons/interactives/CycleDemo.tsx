"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 3 — pointing a later node back at an earlier one creates a loop, and
// traversal never ends. A cycle check refuses the link.
const NODES = ["Alice", "Bob", "Charlie"];

export function CycleDemo() {
  const [cyclic, setCyclic] = useState(false);
  const [check, setCheck] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function makeCycle() {
    if (check) {
      setNote("CycleDetectedError — the link is refused, so the list stays safe.");
      return;
    }
    setCyclic(true);
    setNote("Charlie now points back to Bob. Traversal never terminates.");
  }

  function reset() {
    setCyclic(false);
    setNote(null);
  }

  return (
    <div className="space-y-4">
      <Caption>
        {note ??
          "The attacker wants to link the last node back to an earlier one. Try it with the cycle check off, then on."}
      </Caption>

      <div className="flex items-center gap-1 overflow-x-auto p-1 font-mono text-sm">
        {NODES.map((n, i) => (
          <div key={n} className="flex items-center gap-1">
            <span
              className={`rounded-lg border px-3 py-2 ${
                cyclic && (i === 1 || i === 2)
                  ? "border-red-500/50 bg-red-500/10 text-red-400"
                  : "border-border bg-surface-2 text-fg"
              }`}
            >
              {n}
            </span>
            <span className="text-muted">→</span>
          </div>
        ))}
        {cyclic ? (
          <span className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-red-400">
            back to Bob ↺
          </span>
        ) : (
          <span className="text-xs text-muted">null</span>
        )}
      </div>

      {cyclic && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 font-mono text-xs text-red-400">
          traverse() → Alice → Bob → Charlie → Bob → Charlie → … (forever)
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <DemoButton variant="primary" onClick={makeCycle}>
          Link Charlie → Bob
        </DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
        <span className="ml-auto">
          <Toggle checked={check} onChange={(v) => { setCheck(v); reset(); }} label="Reject cycles" />
        </span>
      </div>
    </div>
  );
}
