"use client";

import { useState } from "react";

// A hands-on hash table: type a key, it's hashed to a bucket, and you can see
// how different keys land in different buckets (and sometimes collide).
const BUCKETS = 4;

function hashOf(key: string): number {
  let h = 0;
  for (const c of key) h = (h + c.charCodeAt(0)) % BUCKETS;
  return h;
}

export function HashTableVisualizer() {
  const [buckets, setBuckets] = useState<string[][]>(() =>
    Array.from({ length: BUCKETS }, () => []),
  );
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function insert() {
    const key = input.trim();
    if (!key) return;
    const b = hashOf(key);
    setBuckets((prev) => prev.map((bk, i) => (i === b ? [...bk, key] : bk)));
    setInput("");
    setMessage(`hash("${key}") → bucket ${b}`);
  }

  function reset() {
    setBuckets(Array.from({ length: BUCKETS }, () => []));
    setMessage(null);
  }

  return (
    <div className="rounded-xl border border-border bg-[#0a0a0c] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && insert()}
          placeholder="Key (e.g. alice)…"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-accent"
        />
        <button
          onClick={insert}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          Insert
        </button>
        <button
          onClick={reset}
          className="rounded-lg border border-border px-4 py-2 text-sm text-fg transition-colors hover:border-white/25 hover:bg-white/5"
        >
          Reset
        </button>
      </div>

      <div className="mt-5 space-y-2">
        {buckets.map((chain, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-16 shrink-0 font-mono text-xs text-muted">
              bucket {i}
            </span>
            <div className="flex flex-1 flex-wrap gap-1.5">
              {chain.length === 0 ? (
                <span className="text-xs text-muted/40">empty</span>
              ) : (
                chain.map((k, j) => (
                  <span
                    key={j}
                    className={`rounded border px-2.5 py-1 font-mono text-xs ${
                      chain.length > 1
                        ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                        : "border-accent/40 bg-accent/10 text-fg"
                    }`}
                  >
                    {k}
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted">
          keys in the same bucket (amber) have collided
        </span>
        {message && <span className="font-mono text-accent">{message}</span>}
      </div>
    </div>
  );
}
