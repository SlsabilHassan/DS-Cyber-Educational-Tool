import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getModule,
  getChallenge,
  getAllChallengeParams,
} from "@/lib/modules";
import { CodeBlock } from "@/components/CodeBlock";
import { ChallengeWorkbench } from "@/components/ChallengeWorkbench";
import { HintsPanel } from "@/components/HintsPanel";
import { ShieldIcon } from "@/components/Icons";

export function generateStaticParams() {
  return getAllChallengeParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; challengeId: string }>;
}): Promise<Metadata> {
  const { slug, challengeId } = await params;
  const challenge = getChallenge(slug, challengeId);
  return { title: challenge ? challenge.name : "Challenge not found" };
}

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ slug: string; challengeId: string }>;
}) {
  const { slug, challengeId } = await params;
  const module = getModule(slug);
  const challenge = getChallenge(slug, challengeId);

  if (!module || !challenge) notFound();

  const index = module.challenges.findIndex((c) => c.id === challenge.id);
  const nextChallenge = module.challenges[index + 1];
  const authored = Boolean(challenge.background || challenge.starterCode);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link href="/modules" className="transition-colors hover:text-fg">
          Modules
        </Link>
        <span className="text-border">/</span>
        <Link
          href={`/modules/${module.slug}`}
          className="transition-colors hover:text-fg"
        >
          {module.title}
        </Link>
      </div>

      {/* Header */}
      <div className="mt-6 flex items-center gap-2">
        <span className="font-mono text-sm text-muted">
          {String(index + 1).padStart(2, "0")}
        </span>
        {challenge.points != null && (
          <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
            {challenge.points} pts
          </span>
        )}
      </div>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-fg">
        {challenge.name}
      </h1>
      {challenge.vulnerability && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-accent">
          <ShieldIcon className="h-4 w-4" />
          {challenge.vulnerability}
        </div>
      )}

      {!authored && (
        <p className="mt-8 text-muted">
          This challenge is a placeholder — content coming soon.
        </p>
      )}

      {/* Background */}
      {challenge.background && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Background
          </h2>
          <p className="mt-3 leading-relaxed text-fg/90">
            {challenge.background}
          </p>
        </section>
      )}

      {/* Your task */}
      {challenge.task && (
        <section className="mt-8 rounded-xl border border-accent/25 bg-accent/5 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">
            Your task
          </h2>
          <p className="mt-3 leading-relaxed text-fg/90">{challenge.task}</p>
        </section>
      )}

      {/* Link back to the teaching for this idea */}
      {challenge.lessonAnchor && (
        <div className="mt-4">
          <Link
            href={`/modules/${module.slug}#${challenge.lessonAnchor}`}
            className="inline-flex items-center gap-2 text-sm text-link transition-colors hover:text-fg"
          >
            <span aria-hidden>📖</span>
            Learn the idea behind this in the lesson
          </Link>
        </div>
      )}

      {/* Progressive hints */}
      {challenge.hints && challenge.hints.length > 0 && (
        <section className="mt-6">
          {/* Keyed so revealed hints reset when navigating between challenges */}
          <HintsPanel key={challenge.id} hints={challenge.hints} />
        </section>
      )}

      {/* Solve it in the browser */}
      {challenge.starterCode && (
        <section className="mt-10">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Solve it here
            </h2>
            <span className="text-xs text-muted">
              Fix the code, don&apos;t patch the test.
            </span>
          </div>
          {challenge.tests ? (
            <ChallengeWorkbench
              key={challenge.id}
              slug={module.slug}
              challengeId={challenge.id}
              starterCode={challenge.starterCode}
              tests={challenge.tests}
              filename={challenge.file}
              language={challenge.language}
            />
          ) : (
            <CodeBlock
              code={challenge.starterCode}
              filename={challenge.file}
              language={challenge.language}
            />
          )}
        </section>
      )}

      {/* Detailed solution (hidden until asked for) */}
      {challenge.solution && (
        <section className="mt-10">
          <details
            key={challenge.id}
            className="group rounded-xl border border-border bg-surface"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-fg">
              <span>Stuck for good? Reveal the detailed solution</span>
              <span className="text-lg text-muted transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="space-y-4 border-t border-border p-5">
              <ol className="space-y-2">
                {challenge.solution.explanation.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-fg/90">
                    <span className="font-medium text-accent">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <CodeBlock
                code={challenge.solution.code}
                filename="one working solution"
                language={challenge.language}
              />
            </div>
          </details>
        </section>
      )}

      {/* Bottom navigation */}
      <div className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-6">
        <Link
          href={`/modules/${module.slug}`}
          className="text-sm text-muted transition-colors hover:text-fg"
        >
          ← {module.title}
        </Link>
        {nextChallenge ? (
          <Link
            href={`/modules/${module.slug}/${nextChallenge.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            Next: {nextChallenge.name} →
          </Link>
        ) : (
          <Link
            href={`/modules/${module.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-fg transition-colors hover:border-accent"
          >
            Finish — back to module
          </Link>
        )}
      </div>
    </div>
  );
}
