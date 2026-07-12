"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Mascot } from "@/components/Mascot";
import { isSolved, isChallengeDone, onProgressChange } from "@/lib/progress";

export type LessonStep = {
  title?: string;
  sudo?: string; // what Sudo says on this step
  content: ReactNode;
  wide?: boolean; // widen the card — side-by-side code and embedded editors need the room
  gate?: { slug: string; challengeId: string }; // Continue locks until this challenge is done
  lock?: boolean; // Continue locks until the content calls useStepUnlock() (e.g. a quiz)
};

// Content inside a `lock`ed step (like a Quiz) calls this to open Continue.
const StepUnlockContext = createContext<() => void>(() => {});
export function useStepUnlock() {
  return useContext(StepUnlockContext);
}

// A Brilliant-style stepped lesson: one screen at a time, a progress bar up
// top, Sudo cheering from the corner, and a "Continue" button that walks you
// through the steps to a completion screen. Gated steps keep Continue locked
// until the challenge is done — solved, or its solution revealed for the
// truly stuck. Locked steps (quizzes) open when the content says so.
export function LessonPlayer({
  steps,
  moduleSlug,
  xpPerStep = 15,
  completeTitle = "Lesson complete!",
  completeMessage = "You're ready for what's next.",
  cta,
}: {
  steps: LessonStep[];
  moduleSlug: string;
  xpPerStep?: number;
  completeTitle?: string;
  completeMessage?: string;
  cta?: { href: string; label: string };
}) {
  const [index, setIndex] = useState(0);
  const [unlocked, setUnlocked] = useState<Set<number>>(new Set());
  const total = steps.length;
  const finished = index >= total;
  const step = finished ? null : steps[index];
  const xp = Math.min(index, total) * xpPerStep;

  // Challenge gating: solves land via markSolved() in the embedded workbench
  // and reveals via the solution panel; we subscribe to the progress event so
  // the lock opens the moment either happens.
  const gateSlug = step?.gate?.slug;
  const gateChallengeId = step?.gate?.challengeId;
  const [gateState, setGateState] = useState<{ done: boolean; solved: boolean }>(
    { done: false, solved: false },
  );
  useEffect(() => {
    if (!gateSlug || !gateChallengeId) return;
    const update = () =>
      setGateState({
        done: isChallengeDone(gateSlug, gateChallengeId),
        solved: isSolved(gateSlug, gateChallengeId),
      });
    update();
    return onProgressChange(update);
  }, [gateSlug, gateChallengeId]);

  const unlockStep = useCallback(() => {
    setUnlocked((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, [index]);

  const gateLocked = !!step?.gate && !gateState.done;
  const quizLocked = !!step?.lock && !unlocked.has(index);
  const locked = gateLocked || quizLocked;
  const sudoLine =
    step?.gate && gateState.solved
      ? "Tests are green — through you go! 🎉"
      : step?.gate && gateState.done
        ? "Solution studied. Onward — the next one's yours."
        : step?.sudo;
  const widthClass = step?.wide ? "max-w-6xl" : "max-w-2xl";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-bg">
      {/* Top bar: exit + progress + XP */}
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6">
        <Link
          href={`/modules/${moduleSlug}`}
          aria-label="Exit lesson"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-fg"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
        <div className="flex flex-1 gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent transition-all duration-300"
                style={{ width: i < index ? "100%" : i === index ? "45%" : "0%" }}
              />
            </div>
          ))}
        </div>
        <span className="shrink-0 font-mono text-sm font-semibold text-accent">
          {finished ? total * xpPerStep : xp} ✦
        </span>
      </div>

      {finished ? (
        <Complete
          moduleSlug={moduleSlug}
          xp={total * xpPerStep}
          steps={total}
          title={completeTitle}
          message={completeMessage}
          cta={cta}
        />
      ) : (
        <>
          {/* Step content — centered when short, scrolls when tall */}
          <div className="flex-1 overflow-y-auto">
            <div className={`mx-auto flex min-h-full ${widthClass} items-center px-4 pb-44 pt-4 sm:px-6`}>
              <div className="w-full">
                <div className="rounded-2xl border border-accent/25 bg-surface/40 p-6 sm:p-8">
                  {step!.title && (
                    <h2 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">
                      {step!.title}
                    </h2>
                  )}
                  {/* Keyed by step so interactive state never leaks between steps */}
                  <div key={index} className="mt-4 space-y-4 leading-relaxed text-fg/90">
                    <StepUnlockContext.Provider value={unlockStep}>
                      {step!.content}
                    </StepUnlockContext.Provider>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar: Sudo + Continue */}
          <div className="fixed inset-x-0 bottom-0 border-t border-border bg-bg/95 backdrop-blur">
            <div className={`mx-auto flex ${widthClass} items-center justify-between gap-3 px-4 py-4 sm:px-6`}>
              <div className="flex items-end gap-2">
                <div className="h-14 w-14 shrink-0">
                  <Mascot size={56} />
                </div>
                {sudoLine && (
                  <div className="mb-2 hidden max-w-xs rounded-2xl rounded-bl-sm border border-border bg-surface px-3 py-2 text-sm text-fg/90 sm:block">
                    {sudoLine}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {index > 0 && (
                  <button
                    onClick={() => setIndex((n) => n - 1)}
                    className="rounded-full border border-border px-4 py-3 text-sm text-muted transition-colors hover:text-fg"
                  >
                    Back
                  </button>
                )}
                {locked ? (
                  <button
                    disabled
                    title={
                      gateLocked
                        ? "Pass the tests — or reveal the solution — to continue"
                        : "Answer the question to continue"
                    }
                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-surface-2 px-8 py-3.5 text-base font-semibold text-muted"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    {gateLocked ? "Pass to continue" : "Answer to continue"}
                  </button>
                ) : (
                  <button
                    onClick={() => setIndex((n) => n + 1)}
                    className="rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-bg transition-opacity hover:opacity-90"
                  >
                    {index === total - 1 ? "Finish" : "Continue"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Complete({
  moduleSlug,
  xp,
  steps,
  title,
  message,
  cta,
}: {
  moduleSlug: string;
  xp: number;
  steps: number;
  title: string;
  message: string;
  cta?: { href: string; label: string };
}) {
  const action = cta ?? {
    href: `/modules/${moduleSlug}`,
    label: "Back to the module",
  };
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 pb-24 text-center">
      <Mascot size={120} />
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-fg">
        {title}
      </h1>
      <p className="mt-2 text-muted">{message}</p>

      <div className="mt-8 flex gap-4">
        <div className="w-36 rounded-2xl border border-border bg-surface p-5 text-center">
          <div className="text-3xl font-bold text-accent">{xp} ✦</div>
          <div className="mt-1 text-xs uppercase tracking-wider text-muted">
            Total XP
          </div>
        </div>
        <div className="w-36 rounded-2xl border border-border bg-surface p-5 text-center">
          <div className="text-3xl font-bold text-fg">
            {steps}
            <span className="text-muted">/{steps}</span>
          </div>
          <div className="mt-1 text-xs uppercase tracking-wider text-muted">
            Steps
          </div>
        </div>
      </div>

      <Link
        href={action.href}
        className="mt-10 inline-flex w-full max-w-sm items-center justify-center rounded-full bg-accent px-6 py-4 text-base font-semibold text-bg transition-opacity hover:opacity-90"
      >
        {action.label}
      </Link>
    </div>
  );
}
