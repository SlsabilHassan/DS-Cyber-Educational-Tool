"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { modules } from "@/lib/modules";
import { Mascot } from "@/components/Mascot";

type Result = {
  type: "module" | "challenge";
  title: string;
  subtitle: string;
  href: string;
  score: number;
};

const SUGGESTIONS = [
  "overflow",
  "hash",
  "replay",
  "race condition",
  "denial of service",
  "pointer",
];

// The whole course is local data, so search is instant and client-side:
// score every module and challenge against the query, best matches first.
function search(query: string): Result[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const score = (title: string, ...fields: (string | undefined)[]) => {
    const t = title.toLowerCase();
    if (t.startsWith(q)) return 4;
    if (t.includes(q)) return 3;
    let s = 0;
    for (const f of fields) {
      if (f && f.toLowerCase().includes(q)) s = Math.max(s, 1);
    }
    return s;
  };

  const results: Result[] = [];
  for (const m of modules) {
    const ms = score(m.title, m.concept, m.security, m.blurb, m.description);
    if (ms > 0) {
      results.push({
        type: "module",
        title: m.title,
        subtitle: `${m.concept} · ${m.security}`,
        href: `/modules/${m.slug}`,
        score: ms + 0.5, // modules edge out equally-scored challenges
      });
    }
    for (const c of m.challenges) {
      const cs = score(c.name, c.vulnerability, c.background, c.task);
      if (cs > 0) {
        results.push({
          type: "challenge",
          title: c.name,
          subtitle: `${m.title}${c.vulnerability ? ` · ${c.vulnerability}` : ""}`,
          href: `/modules/${m.slug}/${c.id}`,
          score: cs,
        });
      }
    }
  }
  return results.sort((a, b) => b.score - a.score);
}

// Wraps the matched part of a title in an accent highlight.
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase();
  const i = text.toLowerCase().indexOf(q);
  if (q.length < 2 || i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="rounded bg-accent/20 text-accent">
        {text.slice(i, i + q.length)}
      </span>
      {text.slice(i + q.length)}
    </>
  );
}

export function SearchClient() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => search(query), [query]);
  const active = query.trim().length >= 2;
  const moduleHits = results.filter((r) => r.type === "module");
  const challengeHits = results.filter((r) => r.type === "challenge");

  return (
    <div>
      {/* Search box */}
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search modules, challenges, vulnerabilities…"
          className="w-full rounded-2xl border border-border bg-surface py-4 pr-5 text-base text-fg outline-none placeholder:text-muted/60 focus:border-accent"
          style={{ paddingLeft: "3.25rem" }}
        />
      </div>

      {/* Suggestion chips */}
      {!active && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">Try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {active && (
        <p className="mt-5 text-sm text-muted">
          {results.length === 0
            ? "No matches."
            : `${results.length} result${results.length === 1 ? "" : "s"}`}
        </p>
      )}

      {active && results.length === 0 && (
        <div className="mt-10 flex flex-col items-center text-center">
          <Mascot size={90} />
          <p className="mt-5 max-w-xs text-muted">
            Nothing matched &quot;{query.trim()}&quot; — even Sudo came up
            empty. Try one of the suggestions, or fewer letters.
          </p>
        </div>
      )}

      {moduleHits.length > 0 && (
        <ResultGroup label="Modules">
          {moduleHits.map((r) => (
            <ResultRow key={r.href} result={r} query={query} badge="module" />
          ))}
        </ResultGroup>
      )}

      {challengeHits.length > 0 && (
        <ResultGroup label="Challenges">
          {challengeHits.map((r) => (
            <ResultRow key={r.href} result={r} query={query} badge="challenge" />
          ))}
        </ResultGroup>
      )}
    </div>
  );
}

function ResultGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </h2>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

function ResultRow({
  result,
  query,
  badge,
}: {
  result: Result;
  query: string;
  badge: string;
}) {
  return (
    <li>
      <Link
        href={result.href}
        className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-white/20 hover:bg-surface-2"
      >
        <div>
          <div className="font-medium text-fg transition-colors group-hover:text-accent">
            <Highlight text={result.title} query={query} />
          </div>
          <div className="mt-0.5 text-xs text-muted">{result.subtitle}</div>
        </div>
        <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted">
          {badge}
        </span>
      </Link>
    </li>
  );
}
