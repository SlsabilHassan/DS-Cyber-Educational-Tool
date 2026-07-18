"use client";

import Link from "next/link";
import { Mascot } from "@/components/Mascot";
import { getConsent } from "@/lib/analytics";
import { useEffect, useState } from "react";

// The study entry point: explains the three steps and routes to the pre-test.
// Nudges the participant to consent first (the banner handles the actual
// recording gate).
export function StudyLanding() {
  const [consent, setConsent] = useState<string>("unset");
  useEffect(() => setConsent(getConsent()), []);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <Mascot size={110} />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-fg">
        The Hacky Stacky study
      </h1>
      <p className="mt-3 text-muted">
        Thanks for taking part! Here&apos;s how it works — about 30–45 minutes,
        all on your own device, completely anonymous.
      </p>

      <ol className="mx-auto mt-8 max-w-md space-y-3 text-left">
        {[
          ["1", "A short pre-test", "Interactive questions to see what you already know (~10–15 min)."],
          ["2", "Work through the modules", "Learn and fix vulnerable code at your own pace."],
          ["3", "A post-test + quick survey", "The same style of questions, plus your experience (~10–15 min)."],
        ].map(([n, t, d]) => (
          <li
            key={n}
            className="flex gap-4 rounded-2xl border border-border bg-surface p-4"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/15 font-mono text-sm text-accent">
              {n}
            </span>
            <div>
              <div className="font-medium text-fg">{t}</div>
              <div className="mt-0.5 text-sm text-muted">{d}</div>
            </div>
          </li>
        ))}
      </ol>

      {consent !== "granted" && (
        <p className="mt-6 text-sm text-amber-400">
          Please accept the research consent banner (bottom of the screen) so
          your responses can be recorded.
        </p>
      )}

      <Link
        href="/study/pre"
        className="mt-8 inline-flex rounded-full bg-accent px-8 py-4 text-base font-semibold text-bg transition-opacity hover:opacity-90"
      >
        Start the pre-test →
      </Link>
      <p className="mt-4 text-xs text-muted">
        Already did the pre-test and finished the modules?{" "}
        <Link href="/study/post" className="text-link hover:text-fg">
          Go to the post-test
        </Link>
        .
      </p>
    </div>
  );
}
