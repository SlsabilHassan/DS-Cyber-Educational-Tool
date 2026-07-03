"use client";

import { useState } from "react";

// A dark code panel with a filename/language header and a copy button.
export function CodeBlock({
  code,
  filename,
  language,
}: {
  code: string;
  filename?: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable (e.g. insecure context); ignore.
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[#0a0a0c]">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-muted">
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
        <button
          onClick={copy}
          className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-white/5 hover:text-fg"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono text-fg/90">{code}</code>
      </pre>
    </div>
  );
}
