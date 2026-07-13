"use client";

import { useEffect, useState } from "react";
import { getConsent, setConsent } from "@/lib/analytics";
import { isSupabaseConfigured } from "@/lib/supabase";

// A one-time consent banner. No learning events are recorded until the visitor
// chooses "I agree" — declining keeps everything local, as before. Required for
// this being a human-subjects research study.
export function ResearchConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only prompt when there's actually somewhere to send data.
    if (isSupabaseConfigured && getConsent() === "unset") setShow(true);
  }, []);

  if (!show) return null;

  function choose(state: "granted" | "declined") {
    setConsent(state);
    setShow(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm leading-relaxed text-muted">
          <span className="font-medium text-fg">Help improve Hacky Stacky.</span>{" "}
          This is a research project. With your consent we record anonymous
          learning activity — which challenges you attempt, hints used, and
          quiz answers — to study how people learn. No names, no message
          contents, and you can decline and use the site exactly the same.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => choose("declined")}
            className="rounded-full border border-border px-4 py-2.5 text-sm text-muted transition-colors hover:text-fg"
          >
            No thanks
          </button>
          <button
            onClick={() => choose("granted")}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
          >
            I agree
          </button>
        </div>
      </div>
    </div>
  );
}
