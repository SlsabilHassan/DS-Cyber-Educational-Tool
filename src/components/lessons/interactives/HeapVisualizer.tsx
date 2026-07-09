"use client";

import { useRef, useState } from "react";

// A hands-on priority queue (min-heap): insert tasks with a priority number
// (lower = more urgent). The queue always serves the most urgent task first.
type Task = { id: number; name: string; priority: number };
const NAMES = ["Backup", "Scan", "Deploy", "Email", "Report", "Cleanup"];

export function HeapVisualizer() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, name: "Backup", priority: 3 },
    { id: 2, name: "Scan", priority: 1 },
  ]);
  const [name, setName] = useState("");
  const [priority, setPriority] = useState("2");
  const [message, setMessage] = useState<string | null>(null);
  const nextId = useRef(3);

  const sorted = [...tasks].sort((a, b) => a.priority - b.priority);

  function insert() {
    const p = parseInt(priority, 10);
    if (Number.isNaN(p)) return;
    const n = name.trim() || NAMES[Math.floor(Math.random() * NAMES.length)];
    setTasks((prev) => [...prev, { id: nextId.current++, name: n, priority: p }]);
    setName("");
    setMessage(`Inserted “${n}” (priority ${p}).`);
  }

  function pop() {
    if (sorted.length === 0) {
      setMessage("The queue is empty.");
      return;
    }
    const top = sorted[0];
    setTasks((prev) => prev.filter((t) => t.id !== top.id));
    setMessage(`Served “${top.name}” — the most urgent task (priority ${top.priority}).`);
  }

  return (
    <div className="rounded-xl border border-border bg-[#0a0a0c] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && insert()}
          placeholder="Task name…"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-accent"
        />
        <input
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          aria-label="priority"
          className="w-20 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-accent"
        />
        <button
          onClick={insert}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          Insert
        </button>
        <button
          onClick={pop}
          disabled={sorted.length === 0}
          className="rounded-lg border border-border px-4 py-2 text-sm text-fg transition-colors hover:border-white/25 hover:bg-white/5 disabled:opacity-40"
        >
          Serve top
        </button>
      </div>

      <div className="mt-5 space-y-1.5">
        {sorted.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted">
            empty queue
          </div>
        ) : (
          sorted.map((t, i) => (
            <div
              key={t.id}
              className={`stack-item-enter flex items-center justify-between rounded-lg border px-4 py-2 font-mono text-sm ${
                i === 0
                  ? "border-accent bg-accent/10 text-fg"
                  : "border-border bg-surface-2 text-fg/80"
              }`}
            >
              <span>{t.name}</span>
              <span className="flex items-center gap-3 text-xs">
                <span className="text-muted">priority {t.priority}</span>
                {i === 0 && <span className="text-accent">← next to run</span>}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted">
          lower number = more urgent · {tasks.length} task{tasks.length === 1 ? "" : "s"}
        </span>
        {message && <span className="text-accent">{message}</span>}
      </div>
    </div>
  );
}
