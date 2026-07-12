import type { DsFacts, OpCost } from "@/lib/ds-facts";

// "How fast is it?" — each operation with its cost and, more importantly,
// the one-line reason why. Costs are teaching moments, not trivia.
export function OpsCosts({ ops }: { ops: OpCost[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {ops.map((o, i) => (
        <div
          key={o.op}
          className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4 ${
            i > 0 ? "border-t border-border" : ""
          }`}
        >
          <div className="flex shrink-0 items-baseline gap-3 sm:w-64">
            <span
              className={`rounded-md border px-1.5 py-0.5 font-mono text-xs ${
                o.fast
                  ? "border-accent/40 text-accent"
                  : "border-amber-400/40 text-amber-400"
              }`}
            >
              {o.cost}
            </span>
            <span className="text-sm font-medium text-fg">{o.op}</span>
          </div>
          <p className="text-sm leading-relaxed text-muted">{o.why}</p>
        </div>
      ))}
    </div>
  );
}

// "Where you've already met one today" — real-world anchors.
export function UsesGrid({ uses }: { uses: DsFacts["uses"] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {uses.map((u) => (
        <div key={u.where} className="rounded-xl border border-border bg-surface-2 p-4">
          <div className="text-sm font-semibold text-accent">{u.where}</div>
          <p className="mt-1 text-sm leading-relaxed text-muted">{u.how}</p>
        </div>
      ))}
    </div>
  );
}
