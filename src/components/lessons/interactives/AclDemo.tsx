"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 3 — a child created under an ADMIN folder should inherit ADMIN, not
// silently reset to PUBLIC.
type Dir = { name: string; perm: "ADMIN" | "PUBLIC" };

export function AclDemo() {
  const [inherit, setInherit] = useState(false);
  const [dirs, setDirs] = useState<Dir[]>([{ name: "root", perm: "ADMIN" }]);

  function createChild() {
    const parent = dirs[dirs.length - 1];
    const perm = inherit ? parent.perm : "PUBLIC";
    const name = ["finance", "payroll", "records", "secrets"][dirs.length - 1] ?? `sub${dirs.length}`;
    setDirs([...dirs, { name, perm }]);
  }

  function reset() {
    setDirs([{ name: "root", perm: "ADMIN" }]);
  }

  const leaked = dirs.some((d, i) => i > 0 && d.perm === "PUBLIC");

  return (
    <div className="space-y-4">
      <Caption>
        The root is <span className="font-mono text-accent">ADMIN</span>. Create
        nested folders — with inheritance off, then on.
      </Caption>

      <div className="space-y-1">
        {dirs.map((d, i) => (
          <div key={i} style={{ marginLeft: i * 18 }} className="flex items-center gap-2 font-mono text-sm">
            <span className="text-muted">{i === 0 ? "" : "└─"}</span>
            <span className="text-fg">{d.name}</span>
            <span
              className={`rounded px-1.5 py-0.5 text-xs ${
                d.perm === "ADMIN"
                  ? "bg-accent/15 text-accent"
                  : "bg-red-500/15 text-red-400"
              }`}
            >
              {d.perm}
            </span>
          </div>
        ))}
      </div>

      {leaked && (
        <p className="text-xs text-red-400">
          A folder under ADMIN became PUBLIC — its contents are now world-readable.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <DemoButton variant="primary" onClick={createChild} disabled={dirs.length >= 5}>
          Create child folder
        </DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
        <span className="ml-auto">
          <Toggle checked={inherit} onChange={(v) => { setInherit(v); reset(); }} label="Inherit permission" />
        </span>
      </div>
    </div>
  );
}
