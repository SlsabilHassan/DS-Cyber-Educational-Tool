"use client";

import { useRef, useState } from "react";

// A hands-on singly linked list: append adds a node at the end, remove takes
// the head off. Each node points to the next; the last points to null.
type Node = { id: number; value: string };
const SUGGEST = ["Alice", "Bob", "Carol", "Dan", "Eve"];

export function LinkedListVisualizer() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 1, value: "Alice" },
    { id: 2, value: "Bob" },
  ]);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const nextId = useRef(3);

  function append() {
    const value =
      input.trim() || SUGGEST[Math.floor(Math.random() * SUGGEST.length)];
    setNodes((prev) => [...prev, { id: nextId.current++, value }]);
    setInput("");
    setMessage(`Appended “${value}” — the old last node now points to it.`);
  }

  function removeFirst() {
    if (nodes.length === 0) {
      setMessage("The list is empty.");
      return;
    }
    const head = nodes[0];
    setNodes((prev) => prev.slice(1));
    setMessage(`Removed head “${head.value}” — head now points to the next node.`);
  }

  return (
    <div className="rounded-xl border border-border bg-[#0a0a0c] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && append()}
          placeholder="Node value…"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-accent"
        />
        <button
          onClick={append}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          Append
        </button>
        <button
          onClick={removeFirst}
          disabled={nodes.length === 0}
          className="rounded-lg border border-border px-4 py-2 text-sm text-fg transition-colors hover:border-white/25 hover:bg-white/5 disabled:opacity-40"
        >
          Remove head
        </button>
      </div>

      <div className="mt-5 flex min-h-16 items-center gap-1 overflow-x-auto p-1">
        {nodes.length === 0 ? (
          <span className="mx-auto text-sm text-muted">empty list → null</span>
        ) : (
          <>
            {nodes.map((node, idx) => (
              <div key={node.id} className="flex items-center gap-1">
                <div
                  className={`stack-item-enter flex items-center overflow-hidden rounded-lg border font-mono text-sm ${
                    idx === 0
                      ? "border-accent bg-accent/10"
                      : "border-border bg-surface-2"
                  }`}
                >
                  <span className="px-3 py-2 text-fg">{node.value}</span>
                  <span className="border-l border-border px-2 py-2 text-[10px] text-muted">
                    next
                  </span>
                </div>
                <span className="text-muted">→</span>
              </div>
            ))}
            <span className="font-mono text-xs text-muted">null</span>
          </>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted">
          {nodes.length} node{nodes.length === 1 ? "" : "s"}
          {nodes.length > 0 && " · head = " + nodes[0].value}
        </span>
        {message && <span className="text-accent">{message}</span>}
      </div>
    </div>
  );
}
