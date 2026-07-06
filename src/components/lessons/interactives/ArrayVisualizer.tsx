"use client";

import { useState } from "react";

// A hands-on fixed-capacity array: insert appends at the next slot, remove
// shifts everything after it left. Indices are shown so O(1) access is visible.
const CAP = 6;

export function ArrayVisualizer() {
  const [data, setData] = useState<(string | null)[]>(Array(CAP).fill(null));
  const [count, setCount] = useState(0);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function insert() {
    if (count >= CAP) {
      setMessage("The array is full.");
      return;
    }
    const value = input.trim() || String.fromCharCode(65 + count);
    const next = [...data];
    next[count] = value;
    setData(next);
    setCount(count + 1);
    setInput("");
    setMessage(`Inserted “${value}” at index ${count}.`);
  }

  function removeAt(index: number) {
    if (index >= count) return;
    const removed = data[index];
    const next = [...data];
    for (let i = index; i < count - 1; i++) next[i] = next[i + 1];
    next[count - 1] = null;
    setData(next);
    setCount(count - 1);
    setMessage(`Removed “${removed}” from index ${index}; the rest shifted left.`);
  }

  return (
    <div className="rounded-xl border border-border bg-[#0a0a0c] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && insert()}
          placeholder="Value…"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-accent"
        />
        <button
          onClick={insert}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          Insert
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {data.map((v, i) => (
          <button
            key={i}
            onClick={() => removeAt(i)}
            disabled={i >= count}
            title={i < count ? "Click to remove" : ""}
            className={`flex h-14 w-14 flex-col items-center justify-center rounded-lg border font-mono text-sm transition-colors ${
              i < count
                ? "border-accent/40 bg-accent/10 text-fg hover:border-red-500/50 hover:bg-red-500/10"
                : "border-border text-muted/40"
            }`}
          >
            <span>{v ?? "·"}</span>
            <span className="mt-0.5 text-[9px] text-muted">[{i}]</span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted">
          count = {count} · capacity = {CAP} · click a filled cell to remove it
        </span>
        {message && <span className="text-accent">{message}</span>}
      </div>
    </div>
  );
}
