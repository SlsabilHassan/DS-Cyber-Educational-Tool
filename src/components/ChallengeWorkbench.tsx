"use client";

import { useEffect, useRef, useState } from "react";
import { runTests } from "@/lib/pyodide";
import { markSolved, isSolved } from "@/lib/progress";
import { track } from "@/lib/analytics";
import { syncMyProfile } from "@/lib/leaderboard";

type Props = {
  slug: string;
  challengeId: string;
  starterCode: string;
  tests: string;
  filename?: string;
  language?: string;
};

export function ChallengeWorkbench({
  slug,
  challengeId,
  starterCode,
  tests,
  filename,
  language,
}: Props) {
  const [code, setCode] = useState(starterCode);
  const [phase, setPhase] = useState<"idle" | "booting" | "running" | "done">(
    "idle",
  );
  const [output, setOutput] = useState<string[]>([]);
  const [summary, setSummary] = useState<{ passed: number; failed: number } | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const bootedRef = useRef(false);

  // Reflect any previously-saved solve on mount.
  useEffect(() => {
    setSolved(isSolved(slug, challengeId));
  }, [slug, challengeId]);

  const busy = phase === "booting" || phase === "running";
  const dirty = code !== starterCode;

  async function handleRun() {
    setErrorMsg(null);
    setSummary(null);
    setOutput([]);
    setPhase(bootedRef.current ? "running" : "booting");
    try {
      const res = await runTests(code, tests);
      bootedRef.current = true;
      setOutput(res.lines);
      setSummary({ passed: res.passed, failed: res.failed });
      setPhase("done");
      const passed = res.failed === 0 && res.passed > 0;
      track("challenge_attempt", {
        module: slug,
        challengeId,
        passed,
        testsPassed: res.passed,
        testsFailed: res.failed,
        edited: code !== starterCode,
      });
      if (passed) {
        const firstTime = !isSolved(slug, challengeId);
        markSolved(slug, challengeId);
        setSolved(true);
        if (firstTime) {
          track("challenge_solved", { module: slug, challengeId });
          void syncMyProfile(); // update leaderboard stats (no-op if signed out)
        }
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e));
      setPhase("done");
      track("challenge_error", { module: slug, challengeId });
    }
  }

  const allGreen =
    summary !== null && summary.failed === 0 && summary.passed > 0;

  return (
    <div className="space-y-4">
      {solved && (
        <div className="flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm text-accent">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          You&apos;ve solved this one — nice. Your progress is saved on this
          device.
        </div>
      )}

      <DiffEditor
        value={code}
        onChange={setCode}
        filename={filename}
        language={language}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleRun}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {phase === "booting"
            ? "Loading Python…"
            : phase === "running"
              ? "Running…"
              : "Run tests"}
        </button>
        <button
          onClick={() => {
            setCode(starterCode);
            setSummary(null);
            setOutput([]);
            setErrorMsg(null);
            setPhase("idle");
          }}
          disabled={busy || !dirty}
          className="rounded-full border border-border px-5 py-2.5 text-sm text-fg transition-colors hover:border-white/25 hover:bg-white/5 disabled:opacity-40"
        >
          Reset
        </button>
        {phase === "booting" && (
          <span className="text-xs text-muted">
            First run downloads the Python runtime (~10&nbsp;MB) — one time only.
          </span>
        )}
      </div>

      {/* Results */}
      {(summary || errorMsg) && (
        <div className="overflow-hidden rounded-xl border border-border bg-[#0a0a0c]">
          <div
            className={`flex items-center justify-between border-b border-border px-4 py-2 text-sm font-medium ${
              errorMsg
                ? "text-red-400"
                : allGreen
                  ? "text-accent"
                  : "text-amber-400"
            }`}
          >
            <span>
              {errorMsg
                ? "Runtime error"
                : allGreen
                  ? "All tests passed 🎉"
                  : `${summary?.passed ?? 0} passed · ${summary?.failed ?? 0} failed`}
            </span>
            <span className="text-xs text-muted">Results</span>
          </div>
          <pre className="max-h-72 overflow-auto p-4 font-mono text-xs leading-relaxed">
            {errorMsg ? (
              <span className="text-red-400">{errorMsg}</span>
            ) : (
              output.map((line, i) => (
                <div key={i} className={lineColor(line)}>
                  {line}
                </div>
              ))
            )}
          </pre>
        </div>
      )}
    </div>
  );
}

function lineColor(line: string): string {
  if (line.startsWith("PASS")) return "text-accent";
  if (line.startsWith("FAIL") || line.startsWith("ERROR"))
    return "text-red-400";
  return "text-muted";
}

// ── Editor with per-line diff highlighting ────────────────────────────
// A transparent <textarea> for editing sits over a <pre> that renders the
// same text; lines that differ from the original starter get a green tint +
// accent bar. Scrolling is mirrored via transforms.
function DiffEditor({
  value,
  onChange,
  filename,
  language,
}: {
  value: string;
  onChange: (v: string) => void;
  filename?: string;
  language?: string;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const codeInnerRef = useRef<HTMLDivElement>(null);
  const gutterInnerRef = useRef<HTMLDivElement>(null);

  const lines = value.split("\n");

  function syncScroll() {
    const ta = taRef.current;
    if (!ta) return;
    if (codeInnerRef.current) {
      codeInnerRef.current.style.transform = `translate(${-ta.scrollLeft}px, ${-ta.scrollTop}px)`;
    }
    if (gutterInnerRef.current) {
      gutterInnerRef.current.style.transform = `translateY(${-ta.scrollTop}px)`;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = value.slice(0, start) + "    " + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  }

  const monoLine = "font-mono text-[13px] leading-6";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[#0a0a0c]">
      {/* header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2 text-xs text-muted">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </span>
          {filename && <span className="ml-1 font-mono">{filename}</span>}
          {language && (
            <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
              {language}
            </span>
          )}
        </div>
      </div>

      {/* editor body */}
      <div className="flex h-96">
        {/* gutter */}
        <div className="relative w-11 shrink-0 overflow-hidden border-r border-border bg-white/[0.02]">
          <div
            ref={gutterInnerRef}
            className={`absolute right-0 top-0 px-2 py-3 text-right ${monoLine}`}
          >
            {lines.map((_, i) => (
              <div key={i} className="text-muted/60">
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* code area */}
        <div className="relative flex-1 overflow-hidden">
          <div
            ref={codeInnerRef}
            aria-hidden
            className={`pointer-events-none absolute left-0 top-0 whitespace-pre p-3 ${monoLine} text-fg/90`}
            style={{ willChange: "transform" }}
          >
            {lines.map((l, i) => (
              <div
                key={i}
                className="w-max min-w-full"
              >
                {l === "" ? " " : l}
              </div>
            ))}
          </div>
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={syncScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            wrap="off"
            className={`absolute inset-0 h-full w-full resize-none whitespace-pre bg-transparent p-3 text-transparent caret-white outline-none ${monoLine}`}
            style={{ tabSize: 4 }}
          />
        </div>
      </div>
    </div>
  );
}
