"use client";

import type { ReactNode } from "react";

// Shared UI primitives so every pattern demo looks and feels the same as the
// "Break the Stack" playground.

export function Caption({ children }: { children: ReactNode }) {
  return (
    <p
      aria-live="polite"
      className="min-h-10 rounded-lg border border-border bg-[#0a0a0c] px-4 py-2.5 text-sm leading-relaxed text-fg/90"
    >
      {children}
    </p>
  );
}

export function DemoButton({
  onClick,
  children,
  variant = "secondary",
  disabled = false,
}: {
  onClick: () => void;
  children: ReactNode;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}) {
  const styles =
    variant === "primary"
      ? "bg-accent text-bg hover:opacity-90"
      : "border border-border text-fg hover:border-white/25 hover:bg-white/5";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-40 ${styles}`}
    >
      {children}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-fg">
      <span className="text-muted">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full border transition-colors ${
          checked ? "border-accent bg-accent/30" : "border-border bg-surface-2"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${
            checked ? "left-[22px] bg-accent" : "left-0.5 bg-muted"
          }`}
        />
      </button>
    </label>
  );
}
