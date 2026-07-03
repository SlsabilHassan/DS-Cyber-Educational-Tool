import {
  TerminalIcon,
  ShieldIcon,
  ChartIcon,
  CursorIcon,
} from "./Icons";

const pillars = [
  {
    icon: TerminalIcon,
    title: "Hands-on labs",
    body: "Every concept comes with a live challenge you solve in the browser.",
  },
  {
    icon: ShieldIcon,
    title: "Security-first",
    body: "Each structure is paired with the attacks and defenses it enables.",
  },
  {
    icon: CursorIcon,
    title: "Learn by doing",
    body: "No slides to sit through — you break things and see what happens.",
  },
  {
    icon: ChartIcon,
    title: "Track progress",
    body: "Points and solves show exactly how far you've come.",
  },
];

export function FeaturePillars() {
  return (
    <section className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
      {pillars.map(({ icon: Icon, title, body }) => (
        <div
          key={title}
          className="rounded-2xl border border-border bg-surface p-5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface-2 text-accent">
            <Icon className="h-4.5 w-4.5" />
          </span>
          <h3 className="mt-4 font-medium text-fg">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
        </div>
      ))}
    </section>
  );
}
