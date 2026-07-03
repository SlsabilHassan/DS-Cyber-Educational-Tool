"use client";

import { useEffect, useState } from "react";
import { getSolvedSet, challengeKey, onProgressChange } from "@/lib/progress";

// "X / N solved" pill + progress bar for a module's challenges.
export function ModuleProgress({
  slug,
  challengeIds,
}: {
  slug: string;
  challengeIds: string[];
}) {
  const [solvedCount, setSolvedCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const set = getSolvedSet();
      setSolvedCount(
        challengeIds.filter((id) => set.has(challengeKey(slug, id))).length,
      );
    };
    update();
    return onProgressChange(update);
  }, [slug, challengeIds]);

  const total = challengeIds.length;
  const pct = total === 0 ? 0 : Math.round((solvedCount / total) * 100);

  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted">
        {solvedCount} / {total} solved
      </span>
    </div>
  );
}
