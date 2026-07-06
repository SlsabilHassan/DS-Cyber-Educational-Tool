"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 5 — an attacker piles colliding keys into one bucket; without a
// chain-length cap it grows without bound and lookups slow to a crawl.
const MAX = 4;

export function CollisionDemo() {
  const [chain, setChain] = useState<string[]>([]);
  const [cap, setCap] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function add(n: number) {
    if (cap) {
      const room = MAX - chain.length;
      if (room <= 0) {
        setNote("BucketOverflowError — the chain is capped, so extra colliding keys are rejected.");
        return;
      }
      const added = Math.min(room, n);
      setChain((c) => [...c, ...Array.from({ length: added }, (_, i) => "key" + (c.length + i))]);
      setNote(`Added ${added}. The chain is capped at ${MAX}.`);
      return;
    }
    setChain((c) => [...c, ...Array.from({ length: n }, (_, i) => "key" + (c.length + i))]);
    setNote("Colliding keys keep piling into the same bucket…");
  }

  function reset() {
    setChain([]);
    setNote(null);
  }

  const over = !cap && chain.length > MAX;

  return (
    <div className="space-y-4">
      <Caption>
        {note ??
          "Every key here collides into one bucket. Flood it, then turn on the chain-length cap."}
      </Caption>

      <div className="rounded-lg border border-border bg-[#0a0a0c] p-3">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>bucket 0 chain</span>
          <span>
            <span className={over ? "text-red-400" : "text-fg"}>{chain.length}</span> / cap {MAX}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {chain.length === 0 ? (
            <span className="text-xs text-muted/40">empty</span>
          ) : (
            chain.map((k, i) => (
              <span
                key={i}
                className={`rounded border px-2 py-1 font-mono text-xs ${
                  !cap && i >= MAX
                    ? "border-red-500/50 bg-red-500/10 text-red-400"
                    : "border-border bg-surface-2 text-fg/80"
                }`}
              >
                {k}
              </span>
            ))
          )}
        </div>
        {over && (
          <p className="mt-2 text-xs text-red-400">
            Chain past the safe length — every lookup in this bucket now scans them all.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DemoButton variant="primary" onClick={() => add(1)}>
          Add colliding key
        </DemoButton>
        <DemoButton onClick={() => add(10)}>Flood (+10)</DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
        <span className="ml-auto">
          <Toggle checked={cap} onChange={(v) => { setCap(v); reset(); }} label={`Cap chain (${MAX})`} />
        </span>
      </div>
    </div>
  );
}
