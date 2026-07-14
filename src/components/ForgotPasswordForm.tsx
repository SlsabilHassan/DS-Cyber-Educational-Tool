"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Mascot } from "./Mascot";

// Step 1 of password recovery: ask for the email and send a reset link.
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit() {
    setError(null);
    if (!supabase) {
      setError("Accounts aren't set up yet.");
      return;
    }
    if (!email) {
      setError("Enter your email address.");
      return;
    }
    setStatus("loading");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setStatus("idle");
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="mx-auto flex min-h-[78vh] max-w-sm flex-col items-center px-4 pt-16 text-center">
      <Mascot size={110} />
      {sent ? (
        <>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-fg">
            Check your email 📬
          </h1>
          <p className="mt-2 text-sm text-muted">
            If an account exists for{" "}
            <span className="text-fg">{email}</span>, we&apos;ve sent a link to
            reset your password. It may take a minute — check spam too.
          </p>
          <Link
            href="/login"
            className="mt-8 rounded-full border border-border px-6 py-3 text-sm text-fg transition-colors hover:border-accent"
          >
            Back to login
          </Link>
        </>
      ) : (
        <>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-fg">
            Reset your password
          </h1>
          <p className="mt-1 text-sm text-muted">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          <div className="mt-8 w-full space-y-3 text-left">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-accent"
            />
            {error && (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                {error}
              </p>
            )}
            <button
              onClick={submit}
              disabled={status === "loading"}
              className="w-full rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {status === "loading" ? "Sending…" : "Send reset link"}
            </button>
          </div>

          <p className="mt-6 text-sm text-muted">
            Remembered it?{" "}
            <Link href="/login" className="text-link transition-colors hover:text-fg">
              Log in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
