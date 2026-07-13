"use client";

import { CodeBlock } from "@/components/CodeBlock";
import { markRevealed } from "@/lib/progress";
import { track } from "@/lib/analytics";

// The "Stuck for good?" panel. Opening it records the reveal, which counts
// as finishing the challenge for unlocking purposes (though not as a solve)
// — so a truly stuck learner can study the answer and move on.
export function SolutionReveal({
  slug,
  challengeId,
  explanation,
  code,
  language,
}: {
  slug: string;
  challengeId: string;
  explanation: string[];
  code: string;
  language?: string;
}) {
  return (
    <details
      className="group rounded-xl border border-border bg-surface"
      onToggle={(e) => {
        if (e.currentTarget.open) {
          markRevealed(slug, challengeId);
          track("solution_reveal", { module: slug, challengeId });
        }
      }}
    >
      <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-fg">
        <span>Stuck for good? Reveal the detailed solution</span>
        <span className="text-lg text-muted transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="space-y-4 border-t border-border p-5">
        <ol className="space-y-2">
          {explanation.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-fg/90">
              <span className="font-medium text-accent">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <CodeBlock code={code} filename="one working solution" language={language} />
        <p className="text-xs text-muted">
          Revealing counts as finishing this challenge, so the next one is now
          unlocked — but do study the fix before moving on.
        </p>
      </div>
    </details>
  );
}
