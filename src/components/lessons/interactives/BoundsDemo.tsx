"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 1 — writing to an out-of-bounds index spills into the neighbor that
// lives right after the array, unless the index is validated.
const CAP = 5;

export function BoundsDemo() {
  const [data, setData] = useState<(string | null)[]>(Array(CAP).fill(null));
  const [neighbor, setNeighbor] = useState("user");
  const [index, setIndex] = useState("5");
  const [check, setCheck] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function write() {
    const i = parseInt(index, 10);
    if (Number.isNaN(i)) return;
    if (check && (i < 0 || i >= CAP)) {
      setNote(`InvalidIndexError — index ${i} is outside 0..${CAP - 1}, rejected.`);
      return;
    }
    if (i >= 0 && i < CAP) {
      const next = [...data];
      next[i] = "0x41";
      setData(next);
      setNote(`Wrote to index ${i}.`);
    } else {
      // out of bounds, no check: corrupt the adjacent "admin" flag
      setNeighbor("ADMIN");
      setNote(`Index ${i} is out of bounds — the write spilled into the neighbor!`);
    }
  }

  function reset() {
    setData(Array(CAP).fill(null));
    setNeighbor("user");
    setNote(null);
  }

  return (
    <div className="space-y-4">
      <Caption>
        {note ??
          `The array has indices 0..${CAP - 1}. Try writing to index 5 (out of bounds) with the check off, then on.`}
      </Caption>

      <div className="flex flex-wrap items-center gap-1.5">
        {data.map((v, i) => (
          <div
            key={i}
            className={`flex h-11 w-11 flex-col items-center justify-center rounded border font-mono text-xs ${
              v !== null
                ? "border-white/20 bg-surface-2 text-fg"
                : "border-border text-muted/40"
            }`}
          >
            <span>{v ?? "·"}</span>
            <span className="text-[9px] text-muted">[{i}]</span>
          </div>
        ))}
        <span className="mx-1 text-muted">›</span>
        <div
          className={`flex h-11 items-center justify-center rounded border px-3 font-mono text-xs ${
            neighbor === "ADMIN"
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : "border-accent/40 bg-accent/10 text-accent"
          }`}
        >
          admin={neighbor}
        </div>
      </div>

      {neighbor === "ADMIN" && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          Out-of-bounds write corrupted the neighbor — the attacker is now admin.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={index}
          onChange={(e) => setIndex(e.target.value)}
          className="w-24 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-fg outline-none focus:border-accent"
          aria-label="index to write"
        />
        <DemoButton variant="primary" onClick={write}>
          Write 0x41
        </DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
        <span className="ml-auto">
          <Toggle checked={check} onChange={(v) => { setCheck(v); reset(); }} label="Bounds check" />
        </span>
      </div>
    </div>
  );
}
