import type { Metadata } from "next";
import Link from "next/link";
import { Mascot } from "@/components/Mascot";
import { HelpContact } from "@/components/HelpContact";

export const metadata: Metadata = { title: "Help" };

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "How do the challenges work?",
    a: (
      <>
        Every challenge is a small vulnerable Python program. You edit it right
        in the browser and hit <span className="text-accent">Run tests</span> —
        a real Python runs your code on the spot and grades it. All tests green
        means solved, and your solve is saved automatically.
      </>
    ),
  },
  {
    q: "Do I need to install anything?",
    a: (
      <>
        Nope. The very first test run downloads the Python runtime
        (~10&nbsp;MB) into your browser — one time only. After that everything
        is instant, and your code never leaves your machine.
      </>
    ),
  },
  {
    q: "Where is my progress saved?",
    a: (
      <>
        Solves are stored in this browser, on this device. Clearing your
        browser data resets them — syncing progress to your account is on the
        roadmap.
      </>
    ),
  },
  {
    q: "I'm stuck on a challenge. What now?",
    a: (
      <>
        Take the hints — they reveal one at a time, so grab the smallest nudge
        you need. Still stuck? Every challenge has a{" "}
        <span className="text-fg">Stuck for good?</span> panel with the full
        walkthrough and a working solution. And the lesson above each module
        teaches the exact idea the challenge uses.
      </>
    ),
  },
  {
    q: "What order should I do the modules in?",
    a: (
      <>
        They&apos;re numbered for a reason: arrays and stacks build the
        foundations the later modules stand on. That said, each module teaches
        itself from scratch — if hash tables are calling your name, answer.
      </>
    ),
  },
  {
    q: "What's the step-by-step lesson vs. the regular page?",
    a: (
      <>
        Same content, two speeds. Every module can be read as one long page, or
        played as three bite-sized journeys with Sudo — the basics, the safety
        patterns, and a guided challenge run. The{" "}
        <span className="text-accent">▶ Start</span> cards on each module page
        launch them; mix and match freely.
      </>
    ),
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      {/* Hero */}
      <div className="flex flex-col items-center text-center">
        <Mascot size={110} />
        <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          $ sudo --help
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-fg">
          How can we help?
        </h1>
        <p className="mt-3 max-w-md text-muted">
          Quick answers below — and a straight line to a human if you need
          more.
        </p>
      </div>

      {/* FAQ */}
      <h2 className="mt-14 text-xl font-semibold tracking-tight text-fg">
        Quick answers
      </h2>
      <div className="mt-5 space-y-3">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="group rounded-xl border border-border bg-surface"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-fg">
              <span>{item.q}</span>
              <span className="text-lg text-muted transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted">
              {item.a}
            </p>
          </details>
        ))}
      </div>

      {/* Contact */}
      <h2
        id="contact"
        className="mt-14 scroll-mt-24 text-xl font-semibold tracking-tight text-fg"
      >
        Talk to a human
      </h2>
      <p className="mt-2 text-muted">
        Question the FAQ can&apos;t answer? Found a bug? Have an idea that
        would make Hacky Stacky better? It all lands in the same inbox — and it
        all gets read.
      </p>
      <div className="mt-5">
        <HelpContact />
      </div>

      {/* Terminal easter egg */}
      <div className="mt-14 overflow-hidden rounded-xl border border-border bg-[#0a0a0c]">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </span>
          <span className="font-mono text-xs text-muted">sudo@hackystacky</span>
        </div>
        <div className="p-4 font-mono text-[13px] leading-relaxed">
          <div className="text-muted">$ sudo --help</div>
          <div className="mt-2 text-fg/90">usage: sudo [command]</div>
          <div className="mt-2 grid gap-1">
            <Link href="/modules" className="text-fg/90 transition-colors hover:text-accent">
              <span className="text-accent">  sudo learn</span>
              <span className="text-muted">      open the modules and start hopping</span>
            </Link>
            <Link href="/search" className="text-fg/90 transition-colors hover:text-accent">
              <span className="text-accent">  sudo find</span>
              <span className="text-muted">       search every module and challenge</span>
            </Link>
            <a href="#contact" className="text-fg/90 transition-colors hover:text-accent">
              <span className="text-accent">  sudo mail</span>
              <span className="text-muted">       email the human (see above)</span>
            </a>
            <div>
              <span className="text-accent">  sudo hi</span>
              <span className="text-muted">         make Sudo&apos;s day 🐸</span>
            </div>
          </div>
          <div className="mt-3 text-muted">
            $ sudo make-me-a-hacker
            <span className="block text-fg/90">
              sudo: working on it — one module at a time.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
