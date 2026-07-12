import type { ComponentType, ReactNode } from "react";
import { StartPlayerCard } from "@/components/StartPlayerCard";
import { OpsCosts, UsesGrid } from "./FactsPanel";
import { DS_FACTS } from "@/lib/ds-facts";

// Shared building blocks so every module lesson looks and reads exactly like
// the Stack lesson: eyebrow → intro → hands-on hero → the "patterns" section
// (analogy + explanation + risky/safer code or a "how to build it" list) →
// glossary → closing line.

export type Concept = {
  title: string;
  analogy: string;
  explain: string[];
  demo?: ComponentType;
  bad?: string;
  good?: string;
  badCaption?: string;
  goodCaption?: string;
  steps?: string[];
  takeaway: string;
};

export type GlossaryItem = { term: string; def: string };

export function Snippet({
  code,
  label,
  tone = "neutral",
  caption,
}: {
  code: string;
  label?: string;
  tone?: "good" | "bad" | "neutral";
  caption?: string;
}) {
  const toneClass =
    tone === "good"
      ? "border-accent/40 text-accent"
      : tone === "bad"
        ? "border-red-500/40 text-red-400"
        : "border-border text-muted";
  return (
    <div>
      {label && (
        <div
          className={`mb-2 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${toneClass}`}
        >
          {label}
        </div>
      )}
      <pre className="overflow-x-auto rounded-lg border border-border bg-[#0a0a0c] p-4 font-mono text-[13px] leading-relaxed text-fg/90">
        <code>{code}</code>
      </pre>
      {caption && <p className="mt-2 text-sm text-muted">{caption}</p>}
    </div>
  );
}

export function CodeCompare({
  bad,
  good,
  badCaption,
  goodCaption,
}: {
  bad: string;
  good: string;
  badCaption?: string;
  goodCaption?: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Snippet tone="bad" label="✕ Risky" code={bad} caption={badCaption} />
      <Snippet tone="good" label="✓ Safer" code={good} caption={goodCaption} />
    </div>
  );
}

export function HowTo({ steps }: { steps: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-[#0a0a0c] p-5">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
        How to build the fix
      </div>
      <ol className="space-y-2.5">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-fg/90">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

// Renders one pattern (analogy → explanation → interactive → risky/safer code
// → takeaway). Reused by the full lesson page and by the stepped players.
export function ConceptCard({ concept: c }: { concept: Concept }) {
  const Demo = c.demo;
  return (
    <div>
      <p className="rounded-lg border-l-2 border-accent/40 bg-accent/5 px-3 py-2 text-sm leading-relaxed text-fg/80">
        <span className="font-medium text-accent">Picture this: </span>
        {c.analogy}
      </p>

      <div className="mt-3 space-y-3 leading-relaxed text-muted">
        {c.explain.map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </div>

      {Demo && (
        <div className="mt-5 rounded-2xl border border-border bg-surface-2 p-5">
          <Eyebrow>Try it</Eyebrow>
          <div className="mt-4">
            <Demo />
          </div>
        </div>
      )}

      {c.steps ? (
        <div className="mt-5">
          <HowTo steps={c.steps} />
        </div>
      ) : c.bad && c.good ? (
        <div className="mt-5">
          <CodeCompare
            bad={c.bad}
            good={c.good}
            badCaption={c.badCaption}
            goodCaption={c.goodCaption}
          />
        </div>
      ) : null}

      <p className="mt-3 text-sm">
        <span className="font-medium text-accent">Takeaway: </span>
        <span className="text-muted">{c.takeaway}</span>
      </p>
    </div>
  );
}

export function ModuleLesson({
  slug,
  title,
  intro,
  tryIt,
  patternsIntro,
  concepts,
  glossary,
  closing,
}: {
  slug?: string; // when set, shows a "do it step by step" card before the patterns
  title: string;
  intro: ReactNode; // paragraphs under the title
  tryIt?: ReactNode; // optional hands-on hero block(s)
  patternsIntro: ReactNode;
  concepts: Concept[];
  glossary: GlossaryItem[];
  closing: string;
}) {
  const facts = slug ? DS_FACTS[slug] : undefined;
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <Eyebrow>Learn first — no prior knowledge needed</Eyebrow>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
        {title}
      </h2>

      <div className="mt-4 space-y-4 leading-relaxed text-muted">{intro}</div>

      {tryIt && <div className="mt-8">{tryIt}</div>}

      {facts && (
        <>
          <h3 className="mt-12 text-xl font-semibold tracking-tight text-fg">
            How fast is it?
          </h3>
          <p className="mt-2 leading-relaxed text-muted">
            <span className="font-mono text-accent">O(1)</span>{" "}
            means the cost stays the same at any size;{" "}
            <span className="font-mono text-amber-400">O(n)</span>{" "}
            means it grows with the data. Each operation below comes with the
            reason why — the costs are the point, not the trivia.
          </p>
          <div className="mt-5">
            <OpsCosts ops={facts.ops} />
          </div>

          <h3 className="mt-12 text-xl font-semibold tracking-tight text-fg">
            Where you&apos;ve already met one
          </h3>
          <p className="mt-2 leading-relaxed text-muted">
            Once you know the shape, you&apos;ll spot it everywhere:
          </p>
          <div className="mt-5">
            <UsesGrid uses={facts.uses} />
          </div>
        </>
      )}

      <h3
        id="six-patterns"
        className="mt-12 scroll-mt-24 text-xl font-semibold tracking-tight text-fg"
      >
        Patterns that keep it safe
      </h3>
      <p className="mt-2 leading-relaxed text-muted">{patternsIntro}</p>

      {slug && (
        <div className="mt-6">
          <StartPlayerCard
            href={`/modules/${slug}/learn/patterns`}
            title="Prefer bite-sized?"
            blurb="Walk these patterns one step at a time, with Sudo — or keep reading below."
          />
        </div>
      )}

      <div className="mt-8 space-y-14">
        {concepts.map((c, i) => (
          <div key={c.title} id={`pattern-${i + 1}`} className="scroll-mt-24">
            <h4 className="text-lg font-semibold text-fg">
              <span className="mr-2 text-accent">{i + 1}.</span>
              {c.title}
            </h4>
            <div className="mt-3">
              <ConceptCard concept={c} />
            </div>
          </div>
        ))}
      </div>

      <h3 className="mt-12 text-xl font-semibold tracking-tight text-fg">
        Words you&apos;ll see (in plain English)
      </h3>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {glossary.map((g) => (
          <div
            key={g.term}
            className="rounded-xl border border-border bg-surface-2 p-4"
          >
            <dt className="font-mono text-sm text-accent">{g.term}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted">{g.def}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-10 text-center text-sm text-muted">{closing}</p>
    </section>
  );
}
