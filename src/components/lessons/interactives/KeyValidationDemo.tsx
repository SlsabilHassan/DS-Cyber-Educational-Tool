"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 4 — a table meant for non-empty string keys accepts malformed ones
// unless keys are validated on insertion.
type Entry = { label: string; valid: boolean };

const SAMPLES: Entry[] = [
  { label: '"alice"', valid: true },
  { label: '"" (empty)', valid: false },
  { label: "42 (number)", valid: false },
  { label: "None", valid: false },
];

export function KeyValidationDemo() {
  const [validate, setValidate] = useState(false);
  const [stored, setStored] = useState<Entry[]>([]);
  const [note, setNote] = useState<string | null>(null);

  function tryInsert(e: Entry) {
    if (validate && !e.valid) {
      setNote(`InvalidKeyError — ${e.label} is not a valid key, rejected.`);
      return;
    }
    setStored((s) => [...s, e]);
    setNote(
      e.valid
        ? `Inserted key ${e.label}.`
        : `Inserted ${e.label} — a malformed key just poisoned the table.`,
    );
  }

  function reset() {
    setStored([]);
    setNote(null);
  }

  return (
    <div className="space-y-4">
      <Caption>
        {note ??
          "This table should hold non-empty string keys. Try inserting good and bad keys, with validation off then on."}
      </Caption>

      <div className="rounded-lg border border-border bg-[#0a0a0c] p-3">
        <div className="mb-2 text-xs uppercase tracking-wider text-muted">
          keys in the table
        </div>
        <div className="flex flex-wrap gap-1.5">
          {stored.length === 0 ? (
            <span className="text-xs text-muted/40">empty</span>
          ) : (
            stored.map((e, i) => (
              <span
                key={i}
                className={`rounded border px-2.5 py-1 font-mono text-xs ${
                  e.valid
                    ? "border-accent/40 bg-accent/10 text-fg"
                    : "border-red-500/50 bg-red-500/10 text-red-400"
                }`}
              >
                {e.label}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {SAMPLES.map((e) => (
          <DemoButton key={e.label} onClick={() => tryInsert(e)}>
            Insert {e.label}
          </DemoButton>
        ))}
        <DemoButton onClick={reset}>Reset</DemoButton>
        <span className="ml-auto">
          <Toggle checked={validate} onChange={(v) => { setValidate(v); reset(); }} label="Validate keys" />
        </span>
      </div>
    </div>
  );
}
