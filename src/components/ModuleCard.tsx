import Link from "next/link";
import type { Module } from "@/lib/modules";
import { NodesIcon, ArrowIcon } from "./Icons";

export function ModuleCard({ module }: { module: Module }) {
  return (
    <Link
      href={`/modules/${module.slug}`}
      className="group relative flex flex-col rounded-2xl border border-border bg-surface p-6 transition-all hover:border-white/20 hover:bg-surface-2"
    >
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface-2 text-accent">
          <NodesIcon className="h-5 w-5" />
        </span>
        <ArrowIcon className="h-4 w-4 text-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>

      <span className="mt-5 text-xs uppercase tracking-wider text-muted">
        {module.concept}
      </span>
      <h3 className="mt-1 text-xl font-semibold tracking-tight text-fg">
        {module.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {module.blurb}
      </p>

      <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted">
        <span className="text-accent">{module.challenges.length}</span>
        challenges
        <span className="mx-1 text-border">•</span>
        {module.security}
      </div>
    </Link>
  );
}
