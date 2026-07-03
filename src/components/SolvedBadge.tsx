"use client";

import { useEffect, useState } from "react";
import { isSolved, onProgressChange } from "@/lib/progress";

// A small "Solved" pill that appears once the learner has passed a challenge.
export function SolvedBadge({
  slug,
  challengeId,
}: {
  slug: string;
  challengeId: string;
}) {
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    const update = () => setSolved(isSolved(slug, challengeId));
    update();
    return onProgressChange(update);
  }, [slug, challengeId]);

  if (!solved) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
      Solved
    </span>
  );
}
