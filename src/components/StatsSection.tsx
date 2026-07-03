import { getOrderedModules } from "@/lib/modules";

// A clean stat band with big numbers, in the reference style. Numbers are
// derived from the module data where possible, with placeholders otherwise.
export function StatsSection() {
  const modules = getOrderedModules();
  const challengeCount = modules.reduce(
    (sum, m) => sum + m.challenges.length,
    0,
  );

  const stats = [
    { value: String(modules.length), label: "Modules" },
    { value: String(challengeCount), label: "Challenges" },
    { value: "100%", label: "Browser-based" },
    { value: "0", label: "Setup required" },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4">
      <div className="grid grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface sm:grid-cols-4 sm:divide-y-0">
        {stats.map((s) => (
          <div key={s.label} className="p-8 text-center">
            <div className="text-4xl font-semibold tracking-tight text-fg">
              {s.value}
            </div>
            <div className="mt-1 text-sm text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
