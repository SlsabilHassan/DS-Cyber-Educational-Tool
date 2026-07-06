"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 2 — removing an element shifts the rest left, but the vacated last
// slot still holds the old value unless it's wiped.
const START = ["pw-alice", "pw-bob", "pw-carol"];

export function ArrayGhostDemo() {
  const [data, setData] = useState<(string | null)[]>([...START, null, null]);
  const [count, setCount] = useState(3);
  const [wipe, setWipe] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function removeFirst() {
    if (count === 0) {
      setNote("Nothing left to remove.");
      return;
    }
    const removed = data[0];
    const next = [...data];
    for (let i = 0; i < count - 1; i++) next[i] = next[i + 1];
    if (wipe) next[count - 1] = null;
    setData(next);
    setCount(count - 1);
    setNote(
      wipe
        ? `Removed “${removed}” and wiped the vacated slot.`
        : `Removed “${removed}”. But look at the last slot — the ghost is still there.`,
    );
  }

  function reset() {
    setData([...START, null, null]);
    setCount(3);
    setNote(null);
  }

  const ghostIndex = !wipe ? count : -1; // the vacated slot still holding data

  return (
    <div className="space-y-4">
      <Caption>
        {note ??
          "Remove the first element, then inspect the backing array an attacker could read."}
      </Caption>

      <div className="flex flex-wrap gap-1.5">
        {data.map((v, i) => {
          const active = i < count;
          const ghost = i === ghostIndex && v !== null;
          return (
            <div
              key={i}
              className={`flex h-12 w-20 flex-col items-center justify-center rounded border font-mono text-xs ${
                ghost
                  ? "border-red-500/50 bg-red-500/10 text-red-400"
                  : active
                    ? "border-accent/40 bg-accent/10 text-fg"
                    : "border-border text-muted/40"
              }`}
            >
              <span>{v ?? "·"}</span>
              <span className="text-[9px] text-muted">
                [{i}]{ghost ? " ghost" : ""}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DemoButton variant="primary" onClick={removeFirst} disabled={count === 0}>
          Remove first
        </DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
        <span className="ml-auto">
          <Toggle checked={wipe} onChange={(v) => { setWipe(v); reset(); }} label="Wipe vacated slot" />
        </span>
      </div>
    </div>
  );
}
