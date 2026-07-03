"use client";

import { useEffect, useRef, useState } from "react";

// "Break the Stack" — a guided-but-explorable playground where the learner
// causes a buffer overflow themselves, then fixes it with a bounds check.
// Conceptual memory diagram only (illustrative addresses, no real exploit).
//
// Memory model (indices): 0..7 = buffer, 8 = saved frame pointer,
// 9 = return address. Writing char i lands in cell i, so writing past the
// 8-slot buffer spills up into the frame pointer, then the return address.

const CELL_TIPS = {
  ret: {
    label: "return address",
    text: "A note saying where to jump back to when this function finishes. Overwrite it and you decide where the program goes next.",
  },
  fp: {
    label: "saved frame pointer",
    text: "A bookmark to the previous function's frame. It sits between your buffer and the return address.",
  },
  buffer: {
    label: "buffer",
    text: "A box with 8 slots for your data. Writing more than 8 characters spills into the cells above it.",
  },
};

type Returned = null | "safe" | "crash";

export function BreakTheStack() {
  const [input, setInput] = useState("");
  const [buffer, setBuffer] = useState<(string | null)[]>(Array(8).fill(null));
  const [fpChar, setFpChar] = useState<string | null>(null);
  const [retChar, setRetChar] = useState<string | null>(null);
  const [boundsOn, setBoundsOn] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [returned, setReturned] = useState<Returned>(null);
  const [tip, setTip] = useState<keyof typeof CELL_TIPS | null>(null);
  const [writeSeq, setWriteSeq] = useState(0);
  const [seen, setSeen] = useState({
    frame: false,
    safe: false,
    overflow: false,
    hijack: false,
    fix: false,
  });

  const reduced = useRef(false);
  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const fpOverwritten = fpChar !== null;
  const retOverwritten = retChar !== null;
  const retGarbage = retChar
    ? "0x" + retChar.charCodeAt(0).toString(16).padStart(2, "0").repeat(4)
    : null;
  const filledCount = buffer.filter(Boolean).length;

  function fillBuffer(chars: string[]) {
    const b: (string | null)[] = Array(8).fill(null);
    chars.forEach((c, i) => (b[i] = c));
    return b;
  }

  function handleWrite() {
    const chars = [...input];
    setReturned(null);
    setWriteSeq((n) => n + 1);

    if (boundsOn && chars.length > 8) {
      // Validate first, write second: refuse to spill past the buffer.
      setBuffer(fillBuffer(chars.slice(0, 8)));
      setFpChar(null);
      setRetChar(null);
      setBlocked(true);
      setSeen((s) => ({ ...s, fix: true }));
      return;
    }

    setBlocked(false);
    setBuffer(fillBuffer(chars.slice(0, 8)));
    setFpChar(chars.length > 8 ? chars[8] : null);
    setRetChar(chars.length > 9 ? chars[9] : null);
    if (chars.length > 8) setSeen((s) => ({ ...s, overflow: true }));
  }

  function handleReturn() {
    if (retOverwritten) {
      setReturned("crash");
      setSeen((s) => ({ ...s, hijack: true }));
    } else {
      setReturned("safe");
      if (filledCount > 0) setSeen((s) => ({ ...s, safe: true }));
    }
  }

  function handleReset() {
    setInput("");
    setBuffer(Array(8).fill(null));
    setFpChar(null);
    setRetChar(null);
    setBlocked(false);
    setReturned(null);
    setTip(null);
  }

  function showTip(cell: keyof typeof CELL_TIPS) {
    setTip((prev) => (prev === cell ? null : cell));
    setSeen((s) => ({ ...s, frame: true }));
  }

  // Narration above the canvas.
  let caption: string;
  if (blocked) {
    caption =
      "Bounds check stopped the write at slot 8 — ValueError: too big. The return address stays safe. That's Pattern 1 below in action.";
  } else if (returned === "crash") {
    caption =
      "The pointer followed the corrupted address and jumped to attacker-controlled code. That jump is the whole idea behind a huge share of real-world hacks.";
  } else if (returned === "safe") {
    caption = "The pointer read the return address and jumped back to main() safely.";
  } else if (retOverwritten) {
    caption =
      "Your extra characters overflowed the buffer and overwrote the return address. Now press Return.";
  } else if (fpOverwritten) {
    caption =
      "You spilled into the saved frame pointer. One more character reaches the return address.";
  } else if (filledCount > 0) {
    caption = "That fit inside the buffer. Press Return to jump back.";
  } else {
    caption =
      "Click any cell to see what it holds, or type something and press Write.";
  }

  const enter = (filled: boolean) =>
    filled && !reduced.current ? "stack-item-enter" : "";

  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Interactive — break it yourself
        </span>
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-fg">
        Break the stack
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        This is a picture of memory, not a real attack. Overflow the buffer and
        watch what it does to the return address — then switch on a bounds check
        and stop it.
      </p>

      {/* Beat checklist */}
      <ol className="mt-4 flex flex-wrap gap-2">
        {[
          ["frame", "Meet the frame"],
          ["safe", "Safe write"],
          ["overflow", "Overflow"],
          ["hijack", "Hijack"],
          ["fix", "The fix"],
        ].map(([key, label]) => {
          const done = seen[key as keyof typeof seen];
          return (
            <li
              key={key}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                done
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-border text-muted"
              }`}
            >
              {done ? "✓ " : ""}
              {label}
            </li>
          );
        })}
      </ol>

      {/* Caption */}
      <p
        aria-live="polite"
        className="mt-5 min-h-10 rounded-lg border border-border bg-[#0a0a0c] px-4 py-2.5 text-sm leading-relaxed text-fg/90"
      >
        {caption}
      </p>

      {/* Memory canvas */}
      <div className="mt-4 space-y-2">
        {/* Return address */}
        <button
          onClick={() => showTip("ret")}
          aria-label={`Return address cell, currently ${
            retOverwritten ? `overwritten with ${retGarbage}` : "pointing to main, safe"
          }`}
          className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left font-mono text-sm transition-colors ${
            retOverwritten
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : "border-accent/40 bg-accent/10 text-accent"
          }`}
        >
          <span className="text-xs uppercase tracking-wider opacity-70">
            return address
          </span>
          <span>{retOverwritten ? `→ ${retGarbage}` : "→ main()"}</span>
        </button>

        {/* Saved frame pointer */}
        <button
          onClick={() => showTip("fp")}
          aria-label={`Saved frame pointer cell, ${
            fpOverwritten ? `overwritten with ${fpChar}` : "intact"
          }`}
          className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left font-mono text-sm transition-colors ${
            fpOverwritten
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : "border-border bg-surface text-muted"
          }`}
        >
          <span className="text-xs uppercase tracking-wider opacity-70">
            saved frame pointer
          </span>
          <span>{fpOverwritten ? fpChar : "(saved)"}</span>
        </button>

        {/* Buffer */}
        <button
          onClick={() => showTip("buffer")}
          aria-label={`Buffer, ${filledCount} of 8 slots filled`}
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-left"
        >
          <span className="font-mono text-xs uppercase tracking-wider text-muted opacity-70">
            buffer &nbsp;(8 slots)
          </span>
          <div key={writeSeq} className="mt-2 grid grid-cols-8 gap-1">
            {buffer.map((ch, i) => (
              <span
                key={i}
                className={`flex h-9 items-center justify-center rounded border font-mono text-sm ${enter(
                  ch !== null,
                )} ${
                  ch !== null
                    ? "border-white/20 bg-surface-2 text-fg"
                    : "border-border text-muted/30"
                }`}
              >
                {ch ?? "·"}
              </span>
            ))}
          </div>
        </button>
      </div>

      {/* Tooltip */}
      {tip && (
        <p className="mt-3 rounded-lg border border-accent/25 bg-accent/5 px-4 py-2.5 text-sm text-fg/90">
          <span className="font-medium text-accent">{CELL_TIPS[tip].label}: </span>
          {CELL_TIPS[tip].text}
        </p>
      )}

      {/* Jump target */}
      {returned && (
        <div className="mt-3 text-center text-xs text-muted">
          <div>▲ pointer jumps to the return address ▲</div>
          <div
            className={`mt-2 rounded-lg border px-4 py-3 font-mono text-sm ${
              returned === "crash"
                ? `border-red-500/50 bg-red-500/10 text-red-400 ${
                    reduced.current ? "" : "animate-shake"
                  }`
                : "border-accent/40 bg-accent/10 text-accent"
            }`}
          >
            {returned === "crash"
              ? "??? crash / attacker code"
              : "main() — continues safely"}
          </div>
        </div>
      )}

      {/* Bounds-check blocked banner */}
      {blocked && (
        <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 font-mono text-sm text-red-400">
          ValueError: too big — write rejected before it could overflow.
        </p>
      )}

      {/* Controls */}
      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleWrite()}
            placeholder="Type text to write into the buffer…"
            aria-label="Text to write into the buffer"
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-fg outline-none placeholder:text-muted/60 focus:border-accent"
          />
          <button
            onClick={handleWrite}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            Write
          </button>
          <button
            onClick={handleReturn}
            disabled={filledCount === 0 && !fpOverwritten && !retOverwritten}
            className="rounded-lg border border-border px-4 py-2 text-sm text-fg transition-colors hover:border-white/25 hover:bg-white/5 disabled:opacity-40"
          >
            Return
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-white/25 hover:text-fg"
          >
            Reset
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-muted">Try:</span>
          <button
            onClick={() => setInput("hello")}
            className="rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-fg"
          >
            hello
          </button>
          <button
            onClick={() => setInput("AAAAAAAAAAAA")}
            className="rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-fg"
          >
            AAAAAAAAAAAA
          </button>

          <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-sm text-fg">
            <span className="text-muted">Bounds check</span>
            <button
              role="switch"
              aria-checked={boundsOn}
              onClick={() => setBoundsOn((v) => !v)}
              className={`relative h-6 w-11 rounded-full border transition-colors ${
                boundsOn
                  ? "border-accent bg-accent/30"
                  : "border-border bg-surface-2"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${
                  boundsOn
                    ? "left-[22px] bg-accent"
                    : "left-0.5 bg-muted"
                }`}
              />
            </button>
          </label>
        </div>
      </div>
    </div>
  );
}
