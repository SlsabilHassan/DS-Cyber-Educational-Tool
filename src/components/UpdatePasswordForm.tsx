"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Mascot } from "./Mascot";

// Step 2 of password recovery: the user arrives here from the email link (which
// establishes a temporary recovery session), and sets a new password.
export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const longEnough = password.length >= 8;
  const matches = password.length > 0 && password === confirm;
  const canSubmit = longEnough && matches;

  async function submit() {
    setError(null);
    if (!supabase) {
      setError("Accounts aren't set up yet.");
      return;
    }
    if (!canSubmit) return;
    setStatus("loading");
    const { error } = await supabase.auth.updateUser({ password });
    setStatus("idle");
    if (error) {
      setError(
        /session|expired|missing/i.test(error.message)
          ? "This reset link has expired. Request a new one."
          : error.message,
      );
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/modules"), 1400);
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-accent";

  return (
    <div className="mx-auto flex min-h-[78vh] max-w-sm flex-col items-center px-4 pt-16 text-center">
      <Mascot size={110} />
      {done ? (
        <>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-fg">
            Password updated ✅
          </h1>
          <p className="mt-2 text-sm text-muted">
            You&apos;re all set — taking you to your modules…
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-fg">
            Choose a new password
          </h1>
          <p className="mt-1 text-sm text-muted">
            Pick something at least 8 characters long.
          </p>

          <div className="mt-8 w-full space-y-3 text-left">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted transition-colors hover:text-fg"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Confirm new password"
              autoComplete="new-password"
              className={inputClass}
            />
            {confirm.length > 0 && !matches && (
              <p className="text-xs text-red-400">Passwords don&apos;t match yet.</p>
            )}
            {error && (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                {error}
              </p>
            )}
            <button
              onClick={submit}
              disabled={status === "loading" || !canSubmit}
              className="w-full rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? "Updating…" : "Update password"}
            </button>
          </div>

          <p className="mt-6 text-sm text-muted">
            <Link href="/login" className="text-link transition-colors hover:text-fg">
              Back to login
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
