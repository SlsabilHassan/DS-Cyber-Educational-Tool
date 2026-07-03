import { HeroGlow } from "./HeroGlow";

// Reusable placeholder for nav destinations that aren't built yet.
export function ComingSoon({
  title,
  note,
}: {
  title: string;
  note?: string;
}) {
  return (
    <div className="relative overflow-hidden px-4 py-32 text-center">
      <HeroGlow />
      <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Coming soon
      </span>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight text-fg">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        {note ?? "This page is under construction."}
      </p>
    </div>
  );
}
