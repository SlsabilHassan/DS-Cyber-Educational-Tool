"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 2 — popping leaves a readable "ghost" unless you wipe the slot.
const SECRETS = ["PIN 4477", "token_9f3", "pw: hunter2"];
const WIPED = "•••••";
const CAP = 6;

export function GhostDemo() {
  const [storage, setStorage] = useState<(string | null)[]>(
    Array(CAP).fill(null),
  );
  const [top, setTop] = useState(-1);
  const [wipe, setWipe] = useState(false);
  const [pushIdx, setPushIdx] = useState(0);
  const [note, setNote] = useState<string | null>(null);

  function push() {
    if (top >= CAP - 1) {
      setNote("Stack is full for this little demo — pop or reset first.");
      return;
    }
    const value = SECRETS[pushIdx % SECRETS.length];
    const s = [...storage];
    s[top + 1] = value;
    setStorage(s);
    setTop(top + 1);
    setPushIdx(pushIdx + 1);
    setNote(`Pushed “${value}”.`);
  }

  function pop() {
    if (top < 0) {
      setNote("Nothing to pop.");
      return;
    }
    const value = storage[top];
    const s = [...storage];
    if (wipe) s[top] = WIPED;
    setStorage(s);
    setTop(top - 1);
    setNote(
      wipe
        ? `Popped “${value}” and wiped its slot. Raw memory no longer holds it.`
        : `Popped “${value}”. Now look at raw memory — it is still sitting there.`,
    );
  }

  function reset() {
    setStorage(Array(CAP).fill(null));
    setTop(-1);
    setPushIdx(0);
    setNote(null);
  }

  const ghostPresent = storage.some(
    (v, i) => i > top && v !== null && v !== WIPED,
  );

  return (
    <div className="space-y-4">
      <Caption>
        {note ??
          "Push a secret, then pop it — then read the raw memory an attacker could see."}
      </Caption>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-[#0a0a0c] p-3">
          <div className="mb-2 text-xs uppercase tracking-wider text-muted">
            What the program sees
          </div>
          <div className="space-y-1.5">
            {top < 0 ? (
              <div className="rounded border border-dashed border-border py-4 text-center text-xs text-muted">
                empty
              </div>
            ) : (
              Array.from({ length: top + 1 }).map((_, i) => {
                const idx = top - i;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between rounded border px-3 py-2 font-mono text-sm ${
                      idx === top
                        ? "border-accent/40 bg-accent/10 text-fg"
                        : "border-border bg-surface text-fg/80"
                    }`}
                  >
                    <span>{storage[idx]}</span>
                    {idx === top && (
                      <span className="text-xs text-accent">top</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-[#0a0a0c] p-3">
          <div className="mb-2 text-xs uppercase tracking-wider text-muted">
            Raw memory (attacker&apos;s view)
          </div>
          <div className="space-y-1.5">
            {storage.map((v, i) => {
              const freed = i > top;
              const ghost = freed && v !== null && v !== WIPED;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded border px-3 py-2 font-mono text-sm ${
                    ghost
                      ? "border-red-500/50 bg-red-500/10 text-red-400"
                      : v !== null && !freed
                        ? "border-border bg-surface text-fg/80"
                        : "border-border text-muted/40"
                  }`}
                >
                  <span>{v ?? "—"}</span>
                  {ghost && <span className="text-xs">still readable</span>}
                  {freed && v === WIPED && (
                    <span className="text-xs text-muted">wiped</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DemoButton variant="primary" onClick={push}>
          Push a secret
        </DemoButton>
        <DemoButton onClick={pop} disabled={top < 0}>
          Pop
        </DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
        <span className="ml-auto">
          <Toggle checked={wipe} onChange={setWipe} label="Wipe on pop" />
        </span>
      </div>

      {ghostPresent && (
        <p className="text-xs text-red-400">
          A popped secret is still readable in raw memory. Turn on “Wipe on pop”
          and try again.
        </p>
      )}
    </div>
  );
}
