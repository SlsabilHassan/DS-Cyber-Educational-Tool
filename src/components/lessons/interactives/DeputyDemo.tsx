"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 5 — a request routed through a trusted service reaches admin data,
// unless the original caller's own permission is checked.
type Role = "regular user" | "admin";
type Result = { leak: boolean; ok: boolean; text: string };

export function DeputyDemo() {
  const [role, setRole] = useState<Role>("regular user");
  const [check, setCheck] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  function ask() {
    const allowed = role === "admin";
    if (check && !allowed) {
      setResult({
        leak: false,
        ok: false,
        text: "Blocked — you're not allowed to read the admin report.",
      });
      return;
    }
    setResult({
      leak: !allowed,
      ok: true,
      text: "admin_report: “Confidential — salaries, layoffs, incidents.”",
    });
  }

  return (
    <div className="space-y-4">
      <Caption>
        You send your request through a trusted internal service, which fetches
        the report for you.
      </Caption>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">You are:</span>
        {(["regular user", "admin"] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => {
              setRole(r);
              setResult(null);
            }}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              role === r
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:text-fg"
            }`}
          >
            {r}
          </button>
        ))}
        <span className="ml-auto">
          <Toggle
            checked={check}
            onChange={(v) => {
              setCheck(v);
              setResult(null);
            }}
            label="Check my real permission"
          />
        </span>
      </div>

      <DemoButton variant="primary" onClick={ask}>
        Ask for the admin report
      </DemoButton>

      {result && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            result.leak
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : result.ok
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border bg-surface text-fg/80"
          }`}
        >
          {result.leak && (
            <div className="mb-1 font-semibold">
              Leak — a regular user just read the admin-only report!
            </div>
          )}
          <span className="font-mono">{result.text}</span>
        </div>
      )}
    </div>
  );
}
