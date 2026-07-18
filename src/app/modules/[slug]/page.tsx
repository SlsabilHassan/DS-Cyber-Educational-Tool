import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule, getAllModuleSlugs } from "@/lib/modules";
import { NodesIcon } from "@/components/Icons";
import { lessons } from "@/components/lessons";
import { ModuleProgress } from "@/components/ModuleProgress";
import { StartPlayerCard } from "@/components/StartPlayerCard";
import { ChallengeList } from "@/components/ChallengeList";
import { ModuleStudyFlow } from "@/components/assessment/ModuleStudyFlow";
import { getModuleAssessment } from "@/lib/module-assessments";

// Pre-render a static page for every module at build time.
export function generateStaticParams() {
  return getAllModuleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const module = getModule(slug);
  return { title: module ? module.title : "Module not found" };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const module = getModule(slug);

  if (!module) notFound();

  const Lesson = lessons[module.slug];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <Link
        href="/modules"
        className="text-sm text-muted transition-colors hover:text-fg"
      >
        ← All modules
      </Link>

      {/* Header */}
      <div className="mt-8 flex items-start gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-border bg-surface-2 text-accent">
          <NodesIcon className="h-7 w-7" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border px-3 py-1 text-xs text-accent">
              {module.concept}
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
              {module.security}
            </span>
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
            {module.title}
          </h1>
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
        {module.description}
      </p>

      {/* Research flow: pre-test prompt on open, post-test after the last challenge */}
      {getModuleAssessment(module.slug) && (
        <ModuleStudyFlow
          slug={module.slug}
          moduleTitle={module.title}
          challengeIds={module.challenges.map((c) => c.id)}
        />
      )}

      {/* Stepped, Brilliant-style lesson — learn the basics one step at a time */}
      <div id="start" className="mt-8 scroll-mt-24">
        <StartPlayerCard
          href={`/modules/${module.slug}/learn/basics`}
          title="Learn the basics, step by step"
          blurb="Bite-sized steps with Sudo — or just scroll and read it all below."
        />
      </div>

      {/* Learn-first lesson (if this module has one) */}
      {Lesson && (
        <div className="mt-10">
          <Lesson />
        </div>
      )}

      {/* Challenges */}
      <section className="mt-14">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-fg">
            Challenges
          </h2>
          <ModuleProgress
            slug={module.slug}
            challengeIds={module.challenges.map((c) => c.id)}
          />
        </div>
        <div className="mb-5">
          <StartPlayerCard
            href={`/modules/${module.slug}/learn/challenges`}
            title="Do the challenges as a guided run"
            blurb="One challenge at a time — pass the tests to advance, with Sudo cheering."
          />
        </div>
        <ChallengeList
          slug={module.slug}
          challenges={module.challenges.map((c) => ({
            id: c.id,
            name: c.name,
            vulnerability: c.vulnerability,
            points: c.points,
          }))}
        />
      </section>
    </div>
  );
}
