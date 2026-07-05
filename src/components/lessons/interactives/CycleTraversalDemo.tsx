"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 5/6 — traversing a graph with a cycle loops forever unless you track
// which nodes you've already visited.
export function CycleTraversalDemo() {
  const [track, setTrack] = useState(false);
  const [steps, setSteps] = useState<string[] | null>(null);
  const [looping, setLooping] = useState(false);

  function run() {
    if (track) {
      setSteps(["Alice", "Bob", "Carol"]);
      setLooping(false);
    } else {
      setSteps(["Alice", "Bob", "Carol", "Bob", "Carol", "Bob", "Carol"]);
      setLooping(true);
    }
  }

  function reset() {
    setSteps(null);
    setLooping(false);
  }

  return (
    <div className="space-y-4">
      <Caption>
        This graph has a cycle: Alice → Bob → Carol → <span className="text-fg">back to Bob</span>.
        Traverse it with visited-tracking off, then on.
      </Caption>

      <div className="rounded-lg border border-border bg-surface p-3 font-mono text-xs text-muted">
        Alice → Bob → Carol
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↑&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─────┘
      </div>

      {steps && (
        <div
          className={`rounded-lg border px-4 py-2.5 font-mono text-sm ${
            looping
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : "border-accent/40 bg-accent/10 text-accent"
          }`}
        >
          visits: {steps.join(" → ")}
          {looping ? " → … (never ends)" : " ✓ done"}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <DemoButton variant="primary" onClick={run}>
          Traverse
        </DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
        <span className="ml-auto">
          <Toggle
            checked={track}
            onChange={(v) => { setTrack(v); reset(); }}
            label="Track visited nodes"
          />
        </span>
      </div>
    </div>
  );
}
