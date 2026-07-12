"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  challengeKey,
  getSolvedSet,
  getRevealedSet,
  onProgressChange,
} from "@/lib/progress";

type Item = {
  id: string;
  name: string;
  vulnerability?: string;
  points?: number;
};

// The module page's challenge list, with sequential unlocking: a challenge
// opens once the one before it is done (solved, or its solution revealed).
export function ChallengeList({ slug, challenges }: { slug: string; challenges: Item[] }) {
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    const update = () => {
      const s = getSolvedSet();
      setSolved(s);
      setDone(new Set([...s, ...getRevealedSet()]));
    };
    update();
    return onProgressChange(update);
  }, []);

  return (
    <ul className="space-y-3">
      {challenges.map((challenge, i) => {
        const isSolved = solved.has(challengeKey(slug, challenge.id));
        const unlocked =
          i === 0 || done.has(challengeKey(slug, challenges[i - 1].id));

        const inner = (
          <>
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <span
                  className={`font-medium transition-colors ${
                    unlocked
                      ? "text-fg group-hover:text-accent"
                      : "text-muted"
                  }`}
                >
                  {challenge.name}
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  {unlocked
                    ? challenge.vulnerability
                    : "Finish the challenge above to unlock"}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {isSolved && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs text-accent">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Solved
                </span>
              )}
              {!unlocked && (
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              )}
              {challenge.points != null && unlocked && (
                <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
                  {challenge.points} pts
                </span>
              )}
            </div>
          </>
        );

        return (
          <li key={challenge.id}>
            {unlocked ? (
              <Link
                href={`/modules/${slug}/${challenge.id}`}
                className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-white/20 hover:bg-surface-2"
              >
                {inner}
              </Link>
            ) : (
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface/50 px-5 py-4 opacity-70">
                {inner}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
