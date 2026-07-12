"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Mascot } from "@/components/Mascot";
import {
  isChallengeDone,
  onProgressChange,
} from "@/lib/progress";

// Wraps a challenge page: if the previous challenge in the module isn't done
// yet (solved or solution revealed), shows a lock screen instead of the
// challenge. Progress lives in localStorage, so this renders after mount.
export function ChallengeGuard({
  slug,
  prev,
  moduleTitle,
  children,
}: {
  slug: string;
  prev: { id: string; name: string } | null; // null → first challenge, never locked
  moduleTitle: string;
  children: ReactNode;
}) {
  const [state, setState] = useState<"checking" | "locked" | "open">(
    prev ? "checking" : "open",
  );

  useEffect(() => {
    if (!prev) return;
    const update = () =>
      setState(isChallengeDone(slug, prev.id) ? "open" : "locked");
    update();
    return onProgressChange(update);
  }, [slug, prev?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state === "open") return <>{children}</>;
  if (state === "checking") return null;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <Mascot size={100} />
      <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        Locked
      </span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-fg">
        One step at a time!
      </h1>
      <p className="mt-3 text-muted">
        Finish <span className="text-fg">{prev!.name}</span>{" "}
        first — pass its tests, or if you&apos;re truly stuck, reveal its
        solution and study it. Then this one opens up.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href={`/modules/${slug}/${prev!.id}`}
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
        >
          Go to {prev!.name}
        </Link>
        <Link
          href={`/modules/${slug}`}
          className="rounded-full border border-border px-6 py-3 text-sm text-fg transition-colors hover:border-accent"
        >
          Back to {moduleTitle}
        </Link>
      </div>
    </div>
  );
}

// Bottom-of-page navigation to the next challenge — locked until the current
// one is done.
export function NextChallengeLink({
  slug,
  challengeId,
  next,
}: {
  slug: string;
  challengeId: string;
  next: { id: string; name: string } | null;
}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const update = () => setDone(isChallengeDone(slug, challengeId));
    update();
    return onProgressChange(update);
  }, [slug, challengeId]);

  if (!next) {
    return (
      <Link
        href={`/modules/${slug}`}
        className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-fg transition-colors hover:border-accent"
      >
        Finish — back to module
      </Link>
    );
  }

  if (!done) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-muted">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        Pass the tests to unlock: {next.name}
      </span>
    );
  }

  return (
    <Link
      href={`/modules/${slug}/${next.id}`}
      className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
    >
      Next: {next.name} →
    </Link>
  );
}
