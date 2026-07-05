"use client";

import { useState } from "react";
import { Caption, Toggle, DemoButton } from "./demoKit";

// Pattern 1 — a list of trusted nodes accepts an untrusted node unless every
// insertion is checked for the trusted marker.
type Node = { value: string; trusted: boolean };

export function TrustDemo() {
  const [nodes, setNodes] = useState<Node[]>([
    { value: "Alice", trusted: true },
    { value: "Bob", trusted: true },
  ]);
  const [check, setCheck] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function addTrusted() {
    setNodes((prev) => [...prev, { value: "Carol", trusted: true }]);
    setNote("Appended a trusted node.");
  }

  function addUntrusted() {
    if (check) {
      setNote("UntrustedNodeError — the node isn't marked TRUSTED, so it's refused.");
      return;
    }
    setNodes((prev) => [...prev, { value: "Mallory", trusted: false }]);
    setNote("An untrusted node slipped into the trusted list.");
  }

  function reset() {
    setNodes([
      { value: "Alice", trusted: true },
      { value: "Bob", trusted: true },
    ]);
    setNote(null);
  }

  return (
    <div className="space-y-4">
      <Caption>
        {note ??
          "Append a trusted node, then an attacker's untrusted node — with the trust check off, then on."}
      </Caption>

      <div className="flex items-center gap-1 overflow-x-auto p-1 font-mono text-sm">
        {nodes.map((n, i) => (
          <div key={i} className="flex items-center gap-1">
            <span
              className={`rounded-lg border px-3 py-2 ${
                n.trusted
                  ? "border-border bg-surface-2 text-fg"
                  : "border-red-500/50 bg-red-500/10 text-red-400"
              }`}
            >
              {n.value}
            </span>
            <span className="text-muted">→</span>
          </div>
        ))}
        <span className="text-xs text-muted">null</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DemoButton variant="primary" onClick={addTrusted}>
          Append trusted node
        </DemoButton>
        <DemoButton onClick={addUntrusted}>Append attacker node</DemoButton>
        <DemoButton onClick={reset}>Reset</DemoButton>
        <span className="ml-auto">
          <Toggle checked={check} onChange={(v) => { setCheck(v); reset(); }} label="Verify trust" />
        </span>
      </div>
    </div>
  );
}
