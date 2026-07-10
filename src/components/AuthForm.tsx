"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Mascot } from "./Mascot";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setNotice(null);

    if (!supabase) {
      setError("Accounts aren't set up yet — add your Supabase keys to enable sign-in.");
      return;
    }
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    setStatus("loading");
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/modules");
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          router.push("/modules");
        } else {
          setNotice("Account created! Check your email to confirm, then log in.");
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="mx-auto flex min-h-[78vh] max-w-sm flex-col items-center px-4 pt-16">
      <Mascot size={110} />
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-fg">
        {isLogin ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {isLogin
          ? "Log in to save your progress across devices."
          : "Sign up to track your solved challenges."}
      </p>

      <div className="mt-8 w-full space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-accent"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-accent"
        />

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm text-accent">
            {notice}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="w-full rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "loading"
            ? "Please wait…"
            : isLogin
              ? "Log in"
              : "Sign up"}
        </button>
      </div>

      <p className="mt-6 text-sm text-muted">
        {isLogin ? "New here? " : "Already have an account? "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="text-link transition-colors hover:text-fg"
        >
          {isLogin ? "Create an account" : "Log in"}
        </Link>
      </p>
    </div>
  );
}
