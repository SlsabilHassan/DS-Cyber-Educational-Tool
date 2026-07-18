"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mascot } from "@/components/Mascot";
import { getConsent, onConsentChange } from "@/lib/analytics";
import { hasPretest, hasPosttest, onStudyFlowChange } from "@/lib/study-flow";
import {
  getSolvedSet,
  getRevealedSet,
  challengeKey,
  onProgressChange,
} from "@/lib/progress";

// Weaves the research pre/post tests into the module page:
//  • a pre-test prompt the first time you open a module (after consent), plus a
//    persistent pre-test card above the lesson,
//  • a post-test prompt once every challenge in the module is finished.
export function ModuleStudyFlow({
  slug,
  moduleTitle,
  challengeIds,
}: {
  slug: string;
  moduleTitle: string;
  challengeIds: string[];
}) {
  const [consent, setConsentState] = useState("unset");
  const [pre, setPre] = useState(false);
  const [post, setPost] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [modalDismissed, setModalDismissed] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setConsentState(getConsent());
      setPre(hasPretest(slug));
      setPost(hasPosttest(slug));
      const solved = getSolvedSet();
      const revealed = getRevealedSet();
      setAllDone(
        challengeIds.length > 0 &&
          challengeIds.every((id) => {
            const k = challengeKey(slug, id);
            return solved.has(k) || revealed.has(k);
          }),
      );
    };
    refresh();
    const unsubs = [
      onConsentChange(refresh),
      onStudyFlowChange(refresh),
      onProgressChange(refresh),
    ];
    return () => unsubs.forEach((u) => u());
  }, [slug, challengeIds]);

  const showPre = consent === "granted" && !pre;
  const showPost = allDone && !post;
  const modal = modalDismissed ? null : showPost ? "post" : showPre ? "pre" : null;

  if (!showPre && !showPost) return null;

  return (
    <>
      <div className="mt-8 space-y-3">
        {showPost && (
          <FlowCard
            href={`/modules/${slug}/posttest`}
            emoji="🏁"
            title="Finish the study — take the post-test"
            blurb="You've completed every challenge! One short anonymous test to measure what you learned."
            accent
          />
        )}
        {showPre && (
          <FlowCard
            href={`/modules/${slug}/pretest`}
            emoji="📋"
            title="Take the pre-test first (for research)"
            blurb="A quick, anonymous check of what you already know — before you start the module."
            accent={!showPost}
          />
        )}
      </div>

      {modal && (
        <FlowModal
          type={modal}
          slug={slug}
          moduleTitle={moduleTitle}
          onClose={() => setModalDismissed(true)}
        />
      )}
    </>
  );
}

function FlowCard({
  href,
  emoji,
  title,
  blurb,
  accent,
}: {
  href: string;
  emoji: string;
  title: string;
  blurb: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 transition-colors ${
        accent
          ? "border-accent/40 bg-accent/10 hover:bg-accent/15"
          : "border-border bg-surface hover:border-white/20 hover:bg-surface-2"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{emoji}</span>
        <div>
          <div className="font-semibold text-fg">{title}</div>
          <div className="mt-0.5 text-sm text-muted">{blurb}</div>
        </div>
      </div>
      <span className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-bg">
        Start
      </span>
    </Link>
  );
}

function FlowModal({
  type,
  slug,
  moduleTitle,
  onClose,
}: {
  type: "pre" | "post";
  slug: string;
  moduleTitle: string;
  onClose: () => void;
}) {
  const isPre = type === "pre";
  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-bg/80 p-4 backdrop-blur">
      <div className="w-full max-w-md rounded-3xl border border-accent/30 bg-surface p-8 text-center shadow-2xl">
        <div className="mx-auto w-fit">
          <Mascot size={90} />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-fg">
          {isPre ? "Before you dive in" : `You crushed ${moduleTitle}! 🎉`}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {isPre
            ? `This is a research study. Take a short, anonymous pre-test so we can measure what you learn from ${moduleTitle}. About 5 minutes — no names, no grades.`
            : "Take the short anonymous post-test to complete the study for this module. About 5 minutes — it's how we measure your learning gains."}
        </p>
        <div className="mt-7 flex flex-col gap-2">
          <Link
            href={`/modules/${slug}/${isPre ? "pretest" : "posttest"}`}
            className="rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-bg transition-opacity hover:opacity-90"
          >
            {isPre ? "Take the pre-test →" : "Take the post-test →"}
          </Link>
          <button
            onClick={onClose}
            className="rounded-full px-6 py-2.5 text-sm text-muted transition-colors hover:text-fg"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
