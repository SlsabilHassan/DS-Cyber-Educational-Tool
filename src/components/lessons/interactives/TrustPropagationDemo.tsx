"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 3 — trust granted to a node should reach only its direct neighbors,
// not everyone down a chain.
const CHAIN = ["Alice", "Bob", "Carol", "Dave"];

export function TrustPropagationDemo() {
  const [oneHop, setOneHop] = useState(false);
  const [granted, setGranted] = useState(false);

  const trusted = granted
    ? oneHop
      ? [0, 1]
      : [0, 1, 2, 3]
    : [];

  return (
    <div className="space-y-4">
      <Caption>
        Grant trust to <span className="font-mono text-fg">Alice</span> — with
        the one-hop limit off, then on. Watch how far it spreads.
      </Caption>

      <div className="flex flex-wrap items-center gap-1 font-mono text-sm">
        {CHAIN.map((name, i) => {
          const isTrusted = trusted.includes(i);
          const overReach = isTrusted && !oneHop && i >= 2;
          return (
            <div key={name} className="flex items-center gap-1">
              <span
                className={`rounded-lg border px-3 py-2 ${
                  overReach
                    ? "border-red-500/50 bg-red-500/10 text-red-400"
                    : isTrusted
                      ? "border-accent/50 bg-accent/10 text-accent"
                      : "border-border bg-surface-2 text-fg/70"
                }`}
              >
                {name}
                {isTrusted && " ✓"}
              </span>
              {i < CHAIN.length - 1 && <span className="text-muted">→</span>}
            </div>
          );
        })}
      </div>

      {granted && !oneHop && (
        <p className="text-xs text-red-400">
          Carol and Dave gained trust just by being reachable through a chain —
          far beyond what Alice should grant.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <DemoButton variant="primary" onClick={() => setGranted(true)}>
          Grant trust to Alice
        </DemoButton>
        <DemoButton onClick={() => setGranted(false)}>Reset</DemoButton>
        <span className="ml-auto">
          <Toggle
            checked={oneHop}
            onChange={(v) => { setOneHop(v); setGranted(false); }}
            label="Direct neighbors only"
          />
        </span>
      </div>
    </div>
  );
}
