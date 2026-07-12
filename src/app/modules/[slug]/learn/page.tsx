import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule, getAllModuleSlugs } from "@/lib/modules";

// A small chooser: the stepped lesson comes in three parts, each also
// reachable directly from its section on the module page.
const PARTS = [
  {
    part: "basics",
    title: "The basics",
    blurb: "What the structure is and how it works — with interactives.",
  },
  {
    part: "patterns",
    title: "Patterns that keep it safe",
    blurb: "The defensive ideas, with risky code beside a safer version.",
  },
  {
    part: "challenges",
    title: "The challenges",
    blurb: "Eight vulnerable programs to fix, one guided step at a time.",
  },
];

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
  return { title: module ? `${module.title} — Lesson` : "Lesson" };
}

export default async function LearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const module = getModule(slug);
  if (!module) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Link
        href={`/modules/${slug}`}
        className="text-sm text-muted transition-colors hover:text-fg"
      >
        ← {module.title}
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-fg">
        {module.title}, step by step
      </h1>
      <p className="mt-3 text-muted">
        Three bite-sized journeys with Sudo. Do them in order, or jump to the
        part you want.
      </p>

      <div className="mt-8 space-y-4">
        {PARTS.map((p, i) => (
          <Link
            key={p.part}
            href={`/modules/${slug}/learn/${p.part}`}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4 transition-colors hover:border-accent/40 hover:bg-accent/5"
          >
            <div className="flex items-center gap-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border font-mono text-sm text-accent">
                {i + 1}
              </span>
              <div>
                <div className="font-semibold text-fg transition-colors group-hover:text-accent">
                  {p.title}
                </div>
                <div className="mt-0.5 text-sm text-muted">{p.blurb}</div>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-bg">
              ▶ Start
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
