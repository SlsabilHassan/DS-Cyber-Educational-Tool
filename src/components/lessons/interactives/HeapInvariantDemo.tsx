"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 6 — changing a task's priority breaks the heap order unless it's
// restored. Lower number = more urgent (front of the queue).
type Task = { name: string; priority: number };
const START: Task[] = [
  { name: "Backup", priority: 1 },
  { name: "Updates", priority: 3 },
  { name: "Logs", priority: 5 },
];

export function HeapInvariantDemo() {
  const [tasks, setTasks] = useState<Task[]>(START.map((t) => ({ ...t })));
  const [restore, setRestore] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function makeUrgent() {
    // give "Logs" top urgency (priority 0) — should move to the front
    const next = tasks.map((t) => (t.name === "Logs" ? { ...t, priority: 0 } : t));
    if (restore) next.sort((a, b) => a.priority - b.priority);
    setTasks(next);
    setNote(
      restore
        ? "Logs became most urgent and the heap was re-sorted — it's now at the front."
        : "Logs became most urgent, but the heap wasn't restored — the front is still wrong.",
    );
  }

  function reset() {
    setTasks(START.map((t) => ({ ...t })));
    setNote(null);
  }

  const brokenFront = tasks.length > 0 && tasks[0].priority !== Math.min(...tasks.map((t) => t.priority));

  return (
    <div className="space-y-4">
      <Caption>
        {note ??
          "The front of a heap must be the most urgent task. Make Logs most urgent, with heap-restore off then on."}
      </Caption>

      <div className="space-y-1.5">
        {tasks.map((t, i) => (
          <div
            key={t.name}
            className={`flex items-center justify-between rounded-lg border px-4 py-2 font-mono text-sm ${
              i === 0
                ? brokenFront
                  ? "border-red-500/50 bg-red-500/10 text-red-400"
                  : "border-accent bg-accent/10 text-fg"
                : "border-border bg-surface-2 text-fg/80"
            }`}
          >
            <span>{t.name}</span>
            <span className="flex items-center gap-3 text-xs">
              <span className="text-muted">priority {t.priority}</span>
              {i === 0 && (
                <span className={brokenFront ? "text-red-400" : "text-accent"}>
                  ← front
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {brokenFront && (
        <p className="text-xs text-red-400">
          The front task isn&apos;t the most urgent one — the queue will serve the wrong task next.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <DemoButton variant="primary" onClick={makeUrgent}>
          Make Logs most urgent
        </DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
        <span className="ml-auto">
          <Toggle checked={restore} onChange={(v) => { setRestore(v); reset(); }} label="Restore heap" />
        </span>
      </div>
    </div>
  );
}
