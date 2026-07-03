import { SectionHeading } from "./SectionHeading";

// Native <details> accordions — no JS needed. The +/× is rotated on open.
const faqs = [
  {
    q: "Do I need any prior experience?",
    a: "No. Modules start from the fundamentals and build up. Basic comfort with a command line helps but isn't required.",
  },
  {
    q: "How do the security concepts fit in?",
    a: "Each data structure is taught alongside the vulnerabilities and defenses it relates to — like buffer overflows on stacks or use-after-free on linked lists.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Everything runs in your browser. Just pick a module and start.",
  },
  {
    q: "Is it free?",
    a: "This is an educational project, so yes — the core content is free.",
  },
];

export function FAQ() {
  return (
    <section className="mx-auto max-w-3xl px-4">
      <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
      <div className="mt-10 space-y-3">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="group rounded-xl border border-border bg-surface px-5 py-4"
          >
            <summary className="flex items-center justify-between gap-4 font-medium text-fg">
              {f.q}
              <span className="text-lg text-muted transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
