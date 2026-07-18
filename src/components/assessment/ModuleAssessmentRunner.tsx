"use client";

import { Assessment } from "./Assessment";
import { getModuleAssessment } from "@/lib/module-assessments";
import type { Phase } from "@/lib/assessment";

// Runs a module's pre- or post-test. Pre-test finishes back into the module
// (time to learn); post-test finishes back to the module page (done).
export function ModuleAssessmentRunner({
  slug,
  phase,
  moduleTitle,
}: {
  slug: string;
  phase: Phase;
  moduleTitle: string;
}) {
  const assessment = getModuleAssessment(slug);
  if (!assessment) return null;

  const items = phase === "pre" ? assessment.pre : assessment.post;
  const cta =
    phase === "pre"
      ? { href: `/modules/${slug}#start`, label: `Start ${moduleTitle} →` }
      : { href: `/modules/${slug}`, label: `Back to ${moduleTitle}` };

  return (
    <Assessment
      phase={phase}
      form={phase === "pre" ? "A" : "B"}
      items={items}
      moduleSlug={slug}
      cta={cta}
    />
  );
}
