"use client";

import { useState, type ReactNode } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 3 — a secret typed then "deleted" still lingers in saved history
// unless it's redacted on the way in.
const SSN = /\b\d{3}-\d{2}-\d{4}\b/g;

export function RedactionDemo() {
  const [text, setText] = useState("My SSN is 123-45-6789");
  const [history, setHistory] = useState<string[]>([]);
  const [redact, setRedact] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function save() {
    const snapshot = redact ? text.replace(SSN, "[REDACTED-SSN]") : text;
    setHistory((h) => [snapshot, ...h]);
    setText("");
    setNote(
      redact
        ? "Saved a cleaned snapshot — the secret was redacted first."
        : "Saved and cleared the box. The screen looks clean now…",
    );
  }

  function reset() {
    setHistory([]);
    setText("My SSN is 123-45-6789");
    setNote(null);
  }

  SSN.lastIndex = 0;
  const leaked = history.some((h) => {
    SSN.lastIndex = 0;
    return SSN.test(h);
  });

  function highlight(entry: string): ReactNode[] {
    const parts: ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    SSN.lastIndex = 0;
    while ((m = SSN.exec(entry)) !== null) {
      if (m.index > last) parts.push(entry.slice(last, m.index));
      parts.push(
        <span
          key={m.index}
          className="rounded bg-red-500/20 px-1 text-red-400"
        >
          {m[0]}
        </span>,
      );
      last = m.index + m[0].length;
    }
    if (last < entry.length) parts.push(entry.slice(last));
    return parts;
  }

  return (
    <div className="space-y-4">
      <Caption>
        {note ??
          "Type a note with the fake SSN, save it, and clear the box — then check the history."}
      </Caption>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="note text"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-fg outline-none focus:border-accent"
        />
        <DemoButton variant="primary" onClick={save}>
          Save &amp; clear
        </DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
        <span className="ml-auto">
          <Toggle checked={redact} onChange={setRedact} label="Redact secrets" />
        </span>
      </div>

      <div className="rounded-lg border border-border bg-[#0a0a0c] p-3">
        <div className="mb-2 text-xs uppercase tracking-wider text-muted">
          Saved history (undo buffer)
        </div>
        {history.length === 0 ? (
          <div className="rounded border border-dashed border-border py-4 text-center text-xs text-muted">
            nothing saved yet
          </div>
        ) : (
          <ul className="space-y-1.5">
            {history.map((h, i) => (
              <li
                key={i}
                className="rounded border border-border bg-surface px-3 py-2 font-mono text-sm text-fg/80"
              >
                {highlight(h)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {leaked && (
        <p className="text-xs text-red-400">
          The SSN is still sitting in the history, even though the box is empty.
          Turn on “Redact secrets” and try again.
        </p>
      )}
    </div>
  );
}
