"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 1 — a path with ../ climbs out of the intended root unless traversal
// is confined. The tree: root/{docs/report.txt, photos}.
export function PathTraversalDemo() {
  const [path, setPath] = useState("../../etc/passwd");
  const [confine, setConfine] = useState(false);
  const [result, setResult] = useState<null | { escaped: boolean; text: string }>(null);

  function open() {
    const parts = path.split("/").filter(Boolean);
    let depth = 0; // depth below root; negative = escaped
    let escaped = false;
    for (const p of parts) {
      if (p === "..") {
        if (depth === 0) {
          if (confine) {
            setResult({ escaped: false, text: "PathTraversalError — blocked from climbing above the root." });
            return;
          }
          escaped = true;
        } else {
          depth -= 1;
        }
      } else {
        depth += 1;
      }
    }
    if (escaped) {
      setResult({ escaped: true, text: "Escaped the root → reached /" + parts.filter((p) => p !== "..").join("/") });
    } else {
      setResult({ escaped: false, text: "Resolved safely inside the root." });
    }
  }

  return (
    <div className="space-y-4">
      <Caption>
        Try a path like <span className="font-mono text-fg">../../etc/passwd</span>{" "}
        with the boundary off, then on.
      </Caption>

      <div className="rounded-lg border border-border bg-surface p-3 font-mono text-xs text-muted">
        root/
        <br />
        &nbsp;&nbsp;├─ docs/report.txt
        <br />
        &nbsp;&nbsp;└─ photos/
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && open()}
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-fg outline-none focus:border-accent"
        />
        <DemoButton variant="primary" onClick={open}>
          Open path
        </DemoButton>
        <span className="ml-auto">
          <Toggle checked={confine} onChange={(v) => { setConfine(v); setResult(null); }} label="Confine to root" />
        </span>
      </div>

      {result && (
        <p
          className={`rounded-lg border px-4 py-2.5 font-mono text-sm ${
            result.escaped
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : "border-accent/40 bg-accent/10 text-accent"
          }`}
        >
          {result.text}
        </p>
      )}
    </div>
  );
}
