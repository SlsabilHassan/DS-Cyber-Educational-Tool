"use client";

import type { ReactNode } from "react";
import type { LessonStep } from "../LessonPlayer";
import type { Challenge } from "@/lib/modules";
import { ChallengeWorkbench } from "@/components/ChallengeWorkbench";
import { HintsPanel } from "@/components/HintsPanel";
import { SolutionReveal } from "@/components/SolutionReveal";

// Sudo's speech-bubble lines, rotated so consecutive steps don't repeat.
// Punchy on purpose — Sudo has opinions.
const PATTERN_LINES = [
  "Attackers know this trick. Now you do too.",
  "Poke the demo — breaking things is how we learn.",
  "Risky on the left, safer on the right. Spot the diff!",
  "This one shows up in real CVEs. Constantly.",
  "One tiny check. One huge difference.",
  "Tattoo this one on your brain. It's everywhere.",
  "I've watched this bug take down real systems. Fun times.",
];

const CHALLENGE_LINES = [
  "This bug won't squash itself.",
  "Fix it before an attacker finds it first.",
  "Stuck? The hints have your back. So do I.",
  "sudo fix the code. That's you — you have the power.",
  "Real vulnerability, real fix. Go get it.",
  "Green tests or it didn't happen.",
  "Patch it and this system sleeps safe tonight.",
  "I believe in you. Mostly. Okay, entirely.",
];

// One step per defensive pattern. The render callback lets each module bring
// its own card component (StackLesson has a bespoke one; the rest share
// ConceptCard from lessonui).
export function buildPatternSteps<T extends { title: string }>(
  concepts: T[],
  render: (concept: T) => ReactNode,
): LessonStep[] {
  return concepts.map((c, i) => ({
    title: `${i + 1}. ${c.title}`,
    sudo: PATTERN_LINES[i % PATTERN_LINES.length],
    wide: true,
    content: render(c),
  }));
}

export function patternsIntroStep(count: number, thing: string): LessonStep {
  return {
    title: `${count} patterns that keep ${thing} safe`,
    sudo: "Time for the defensive toolkit. Sudo up!",
    content: (
      <p>
        The challenges ahead are all variations on the same handful of ideas.
        Here&apos;s each one — an everyday analogy, what goes wrong, and{" "}
        <span className="text-red-400">risky</span> code beside a{" "}
        <span className="text-accent">safer</span> version.
      </p>
    ),
  };
}

export function challengesIntroStep(): LessonStep {
  return {
    title: "Now practice",
    sudo: "Hands on keyboard. This is the fun part.",
    content: (
      <p>
        Eight real vulnerabilities, one at a time. Fix the code and hit{" "}
        <span className="text-accent">Run tests</span> — passing unlocks the
        next one. Stuck? Take the hints. Truly stuck? Reveal the solution,
        study it, and move on. Your progress is saved as you go.
      </p>
    ),
  };
}

// One step per challenge, with the live in-browser editor. Each step is
// gated: Continue unlocks when the tests pass, with a "Skip for now" out.
export function buildChallengeSteps(
  slug: string,
  challenges: Challenge[],
): LessonStep[] {
  return challenges
    .filter((ch) => ch.starterCode && ch.tests)
    .map((ch, i) => ({
      title: ch.name,
      sudo: CHALLENGE_LINES[i % CHALLENGE_LINES.length],
      wide: true,
      gate: { slug, challengeId: ch.id },
      content: (
        // Keyed by challenge so hints, editor code, and the revealed solution
        // reset between steps instead of leaking into the next challenge.
        <div key={ch.id} className="space-y-4">
          {ch.vulnerability && (
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-accent">
              {ch.vulnerability}
            </div>
          )}
          {ch.background && <p className="text-muted">{ch.background}</p>}
          {ch.task && (
            <div className="rounded-xl border border-accent/25 bg-accent/5 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-accent">
                Your task
              </div>
              <p className="mt-2 text-sm leading-relaxed text-fg/90">
                {ch.task}
              </p>
            </div>
          )}
          {ch.hints && ch.hints.length > 0 && <HintsPanel hints={ch.hints} />}
          <ChallengeWorkbench
            slug={slug}
            challengeId={ch.id}
            starterCode={ch.starterCode!}
            tests={ch.tests!}
            filename={ch.file}
            language={ch.language}
          />
          {ch.solution && (
            <SolutionReveal
              slug={slug}
              challengeId={ch.id}
              explanation={ch.solution.explanation}
              code={ch.solution.code}
              language={ch.language}
            />
          )}
        </div>
      ),
    }));
}
