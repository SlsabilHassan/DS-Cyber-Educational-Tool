"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Mascot } from "./Mascot";

// Live password rules. The first three are required to sign up; the symbol
// is recommended (it bumps you to "Strong") but not mandatory.
function passwordChecks(pw: string) {
  return [
    { label: "At least 8 characters", met: pw.length >= 8, required: true },
    {
      label: "Upper & lowercase letters",
      met: /[a-z]/.test(pw) && /[A-Z]/.test(pw),
      required: true,
    },
    { label: "A number", met: /[0-9]/.test(pw), required: true },
    { label: "A symbol (recommended)", met: /[^A-Za-z0-9]/.test(pw), required: false },
  ];
}

const STRENGTH = [
  { label: "Too weak", color: "bg-red-500", text: "text-red-400" },
  { label: "Weak", color: "bg-red-500", text: "text-red-400" },
  { label: "Fair", color: "bg-amber-400", text: "text-amber-400" },
  { label: "Good", color: "bg-lime-400", text: "text-lime-400" },
  { label: "Strong", color: "bg-accent", text: "text-accent" },
];

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const checks = passwordChecks(password);
  const score = checks.filter((c) => c.met).length; // 0–4
  const meetsRequired = checks.every((c) => !c.required || c.met);
  const passwordsMatch = password.length > 0 && password === confirm;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Every field must be filled and valid before registration is allowed.
  const canSubmit = isLogin
    ? Boolean(email && password)
    : Boolean(
        firstName.trim() &&
          lastName.trim() &&
          validEmail &&
          meetsRequired &&
          passwordsMatch,
      );

  async function handleSubmit() {
    setError(null);
    setNotice(null);

    if (!supabase) {
      setError("Accounts aren't set up yet — add your Supabase keys to enable sign-in.");
      return;
    }

    // Login: keep it simple.
    if (isLogin) {
      if (!email || !password) {
        setError("Enter your email and password.");
        return;
      }
      setStatus("loading");
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/modules");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        setStatus("idle");
      }
      return;
    }

    // Register: validate the full form.
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    if (!email) {
      setError("Enter your email address.");
      return;
    }
    if (!meetsRequired) {
      setError("Please choose a stronger password (see the checklist below).");
      return;
    }
    if (!passwordsMatch) {
      setError("The two passwords don't match.");
      return;
    }

    setStatus("loading");
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`,
          },
        },
      });
      if (error) throw error;
      if (data.session) {
        router.push("/modules");
      } else {
        setNotice("Account created! Check your email to confirm, then log in.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setStatus("idle");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-accent";

  return (
    <div className="mx-auto flex min-h-[78vh] max-w-sm flex-col items-center px-4 pb-16 pt-16">
      <Mascot size={110} />
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-fg">
        {isLogin ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 text-center text-sm text-muted">
        {isLogin
          ? "Log in to save your progress across devices."
          : "Sign up to track your solved challenges and pick up where you left off."}
      </p>

      <div className="mt-8 w-full space-y-3">
        {/* Names (register only) */}
        {!isLogin && (
          <div className="grid grid-cols-2 gap-3">
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              autoComplete="given-name"
              className={inputClass}
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              autoComplete="family-name"
              className={inputClass}
            />
          </div>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="you@example.com"
          autoComplete="email"
          className={inputClass}
        />

        {/* Password with show/hide */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted transition-colors hover:text-fg"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {isLogin && (
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-muted transition-colors hover:text-fg"
            >
              Forgot password?
            </Link>
          </div>
        )}

        {/* Strength meter + checklist (register only, once typing) */}
        {!isLogin && password.length > 0 && (
          <div className="rounded-lg border border-border bg-surface-2 p-3">
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i < score ? STRENGTH[score].color : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <span className={`text-xs font-medium ${STRENGTH[score].text}`}>
                {STRENGTH[score].label}
              </span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-xs">
                  <span
                    className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ${
                      c.met ? "bg-accent/20 text-accent" : "bg-white/5 text-muted"
                    }`}
                  >
                    {c.met ? "✓" : "•"}
                  </span>
                  <span className={c.met ? "text-fg/80" : "text-muted"}>
                    {c.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Confirm password (register only) */}
        {!isLogin && (
          <div>
            <input
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Confirm password"
              autoComplete="new-password"
              className={inputClass}
            />
            {confirm.length > 0 && !passwordsMatch && (
              <p className="mt-1.5 text-xs text-red-400">
                Passwords don&apos;t match yet.
              </p>
            )}
          </div>
        )}

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
          disabled={status === "loading" || !canSubmit}
          className="w-full rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading"
            ? "Please wait…"
            : isLogin
              ? "Log in"
              : "Create account"}
        </button>
        {!isLogin && !canSubmit && (
          <p className="text-center text-xs text-muted">
            Fill in every field to create your account.
          </p>
        )}
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
