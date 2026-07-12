import Link from "next/link";

// The "prefer bite-sized?" entry card that sits above each section of a
// module page and launches the corresponding stepped lesson player. The
// long-scroll content below it always remains available — the player is a
// choice, never a requirement.
export function StartPlayerCard({
  href,
  title,
  blurb,
}: {
  href: string;
  title: string;
  blurb: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-2xl border border-accent/40 bg-accent/10 px-5 py-4 transition-colors hover:bg-accent/15"
    >
      <div>
        <div className="font-semibold text-fg">{title}</div>
        <div className="mt-0.5 text-sm text-muted">{blurb}</div>
      </div>
      <span className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-bg">
        ▶ Start
      </span>
    </Link>
  );
}
