"use client";

import { useRef, useState } from "react";

// A hands-on FIFO queue: enqueue adds at the back, dequeue removes from the
// front — the oldest item always leaves first.
type Item = { id: number; value: string };
const SUGGEST = ["job", "email", "packet", "42", "req"];

export function QueueVisualizer() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, value: "A" },
    { id: 2, value: "B" },
  ]);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const nextId = useRef(3);

  function enqueue() {
    const value =
      input.trim() || SUGGEST[Math.floor(Math.random() * SUGGEST.length)];
    setItems((prev) => [...prev, { id: nextId.current++, value }]);
    setInput("");
    setMessage(`Enqueued “${value}” at the back.`);
  }

  function dequeue() {
    if (items.length === 0) {
      setMessage("The queue is empty — nothing to dequeue.");
      return;
    }
    const front = items[0];
    setItems((prev) => prev.slice(1));
    setMessage(`Dequeued “${front.value}” — the oldest item left first (FIFO).`);
  }

  return (
    <div className="rounded-xl border border-border bg-[#0a0a0c] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enqueue()}
          placeholder="Type a value…"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-accent"
        />
        <button
          onClick={enqueue}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          Enqueue
        </button>
        <button
          onClick={dequeue}
          disabled={items.length === 0}
          className="rounded-lg border border-border px-4 py-2 text-sm text-fg transition-colors hover:border-white/25 hover:bg-white/5 disabled:opacity-40"
        >
          Dequeue
        </button>
      </div>

      <div className="mt-5">
        <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-muted">
          <span>← front (dequeue here)</span>
          <span>back (enqueue here) →</span>
        </div>
        <div className="flex min-h-16 items-center gap-2 overflow-x-auto rounded-lg border border-border bg-surface p-3">
          {items.length === 0 ? (
            <span className="mx-auto text-sm text-muted">empty queue</span>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.id}
                className={`stack-item-enter flex min-w-14 flex-col items-center justify-center rounded-lg border px-4 py-2 font-mono text-sm ${
                  idx === 0
                    ? "border-accent bg-accent/10 text-fg"
                    : "border-border bg-surface-2 text-fg/80"
                }`}
              >
                <span>{item.value}</span>
                {idx === 0 && (
                  <span className="text-[10px] text-accent">front</span>
                )}
                {idx === items.length - 1 && idx !== 0 && (
                  <span className="text-[10px] text-muted">back</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-muted">
          {items.length} item{items.length === 1 ? "" : "s"} waiting
        </span>
        {message && <span className="text-accent">{message}</span>}
      </div>
    </div>
  );
}
