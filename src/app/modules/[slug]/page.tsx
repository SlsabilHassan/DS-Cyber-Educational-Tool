import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule, getAllModuleSlugs } from "@/lib/modules";
import { NodesIcon } from "@/components/Icons";
import { lessons } from "@/components/lessons";
import { SolvedBadge } from "@/components/SolvedBadge";
import { ModuleProgress } from "@/components/ModuleProgress";

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
        <ul className="space-y-3">
          {module.challenges.map((challenge, i) => (
            <li key={challenge.id}>
              <Link
                href={`/modules/${module.slug}/${challenge.id}`}
                className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-white/20 hover:bg-surface-2"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="font-medium text-fg transition-colors group-hover:text-accent">
                      {challenge.name}
                    </span>
                    {challenge.vulnerability && (
                      <span className="mt-0.5 block text-xs text-muted">
                        {challenge.vulnerability}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <SolvedBadge slug={module.slug} challengeId={challenge.id} />
                  {challenge.points != null && (
                    <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
                      {challenge.points} pts
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
