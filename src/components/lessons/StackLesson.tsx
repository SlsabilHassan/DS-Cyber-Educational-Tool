"use client";

import { useRef, useState } from "react";
import type { ComponentType } from "react";
import { BreakTheStack } from "./BreakTheStack";
import { GhostDemo } from "./interactives/GhostDemo";
import { RedactionDemo } from "./interactives/RedactionDemo";
import { ReplayDemo } from "./interactives/ReplayDemo";
import { DeputyDemo } from "./interactives/DeputyDemo";
import { RecursionDemo } from "./interactives/RecursionDemo";

// Maps a pattern's demo key to its interactive component.
const DEMOS: Record<string, ComponentType> = {
  ghost: GhostDemo,
  redact: RedactionDemo,
  replay: ReplayDemo,
  deputy: DeputyDemo,
  recursion: RecursionDemo,
};

// A detailed, code-rich, interactive primer on stacks and the security ideas
// behind the challenges. Built for a beginner who has never seen memory before.
export function StackLesson() {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Learn first — no prior knowledge needed
      </span>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
        What&apos;s a stack?
      </h2>

      <div className="mt-4 space-y-4 leading-relaxed text-muted">
        <p>
          Imagine a stack of plates. You add a new plate on{" "}
          <span className="text-fg">top</span>, and when you need one, you take
          it from the <span className="text-fg">top</span> too. You can&apos;t
          slide a plate out of the middle without lifting the ones above it.
        </p>
        <p>
          That&apos;s a stack: the{" "}
          <span className="text-fg">
            last thing you put in is the first thing you take out
          </span>
          . Programmers call this <span className="text-accent">LIFO</span> —
          Last In, First Out. It only has two real moves:
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <div className="font-mono text-sm text-accent">push</div>
          <p className="mt-1 text-sm text-muted">
            Put something new on the top of the stack.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <div className="font-mono text-sm text-accent">pop</div>
          <p className="mt-1 text-sm text-muted">
            Take the top thing off — and you get that item back.
          </p>
        </div>
      </div>

      {/* Interactive demo */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Try it yourself
        </h3>
        <p className="mt-2 text-sm text-muted">
          Push a few items, then pop them. Watch how the{" "}
          <span className="text-fg">last one in</span> always comes{" "}
          <span className="text-fg">out first</span>.
        </p>
        <div className="mt-4">
          <StackVisualizer />
        </div>
      </div>

      {/* In code */}
      <h3 className="mt-10 text-xl font-semibold tracking-tight text-fg">
        The same thing, in code
      </h3>
      <p className="mt-2 leading-relaxed text-muted">
        In Python a plain list already works as a stack. <code>append</code> is
        push, <code>pop</code> is pop:
      </p>
      <div className="mt-4">
        <Snippet
          code={`stack = []
stack.append("a")   # push  -> bottom
stack.append("b")   # push  -> top
top = stack.pop()   # pop   -> "b"  (last in, first out)`}
        />
      </div>

      {/* The call stack */}
      <h3 className="mt-10 text-xl font-semibold tracking-tight text-fg">
        The hidden stack: the call stack
      </h3>
      <div className="mt-3 space-y-4 leading-relaxed text-muted">
        <p>
          Here&apos;s the part most courses skip. Every time your program calls
          a function, it{" "}
          <span className="text-fg">pushes a &quot;frame&quot;</span> onto a
          stack behind the scenes. A frame holds that function&apos;s local
          variables <span className="text-fg">and</span> a{" "}
          <span className="text-fg">return address</span> — a note saying
          &quot;when you finish, jump back to here.&quot; When the function
          returns, its frame is popped.
        </p>
      </div>
      <div className="mt-4">
        <Snippet
          code={`def greet():
    name = "Sam"          # lives in greet's frame
    return welcome(name)  # pushes welcome's frame on top

def welcome(n):
    return "Hi " + n      # when this returns, its frame pops`}
          caption="welcome() sits on top of greet(). Its frame — including the return address that leads back into greet() — is just more data on the stack, sitting right next to your variables."
        />
      </div>
      <div className="mt-4 rounded-xl border border-accent/25 bg-accent/5 p-5 text-fg/90">
        <span className="font-semibold text-accent">The key idea:</span> because
        that &quot;return address&quot; sits right next to your data, if you can
        write past where your data is supposed to stop, you can overwrite the
        address — and send the program somewhere it should never go. That single
        fact is behind a huge share of real-world hacks.
      </div>

      {/* Hands-on: cause an overflow yourself */}
      <div className="mt-8">
        <BreakTheStack />
      </div>

      {/* Concept lessons */}
      <h3
        id="six-patterns"
        className="mt-12 scroll-mt-24 text-xl font-semibold tracking-tight text-fg"
      >
        Six patterns that keep stacks safe
      </h3>
      <p className="mt-2 leading-relaxed text-muted">
        The challenges below are all variations on the same handful of ideas.
        Each one is explained from scratch, with a little interactive to poke at
        and <span className="text-red-400">risky</span> code beside a{" "}
        <span className="text-accent">safer</span> version. Take your time — this
        is the heart of the module.
      </p>

      <div className="mt-8 space-y-14">
        {CONCEPTS.map((c, i) => {
          const Demo = c.demo ? DEMOS[c.demo] : null;
          return (
            <div key={c.title} id={`pattern-${i + 1}`} className="scroll-mt-24">
              <h4 className="text-lg font-semibold text-fg">
                <span className="mr-2 text-accent">{i + 1}.</span>
                {c.title}
              </h4>

              <p className="mt-3 rounded-lg border-l-2 border-accent/40 bg-accent/5 px-3 py-2 text-sm leading-relaxed text-fg/80">
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
                  <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Try it
                  </span>
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
        })}
      </div>

      {/* Glossary */}
      <h3 className="mt-12 text-xl font-semibold tracking-tight text-fg">
        Words you&apos;ll see (in plain English)
      </h3>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {GLOSSARY.map((g) => (
          <div
            key={g.term}
            className="rounded-xl border border-border bg-surface-2 p-4"
          >
            <dt className="font-mono text-sm text-accent">{g.term}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted">{g.def}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-10 text-center text-sm text-muted">
        That&apos;s the toolkit. Now try the challenges below — and lean on the
        hints if you get stuck. ↓
      </p>
    </section>
  );
}

// ── Presentational code helpers ───────────────────────────────────────
function Snippet({
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

// A worded "how to build it" panel — used where showing the fix as code would
// give too much away, but the approach still needs explaining.
function HowTo({ steps }: { steps: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-[#0a0a0c] p-5">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
        How to build the fix
      </div>
      <ol className="space-y-2.5">
        {steps.map((s, i) => (
          <li
            key={i}
            className="flex gap-3 text-sm leading-relaxed text-fg/90"
          >
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

function CodeCompare({
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

// ── Content ───────────────────────────────────────────────────────────
type Concept = {
  title: string;
  analogy: string;
  explain: string[];
  demo: string | null;
  bad?: string;
  good?: string;
  badCaption?: string;
  goodCaption?: string;
  steps?: string[]; // "how to build it" prose, used instead of code
  takeaway: string;
};

const CONCEPTS: Concept[] = [
  {
    title: "Check the size before you write",
    analogy:
      "pouring water into a glass without looking — keep going and it spills all over the counter.",
    explain: [
      "A buffer is just a fixed amount of space set aside for data — say, room for 8 characters. The catch is that the computer does not automatically stop you from writing a 9th, 10th, or 100th character. Those extra characters do not vanish; they spill into whatever memory sits right after the buffer.",
      "As you saw in Break the Stack above, one of the things sitting nearby is the return address — the note telling the program where to continue when the current function finishes. Overwrite it and you can send the program anywhere. That is how a huge number of real-world attacks begin.",
      "The fix is almost boringly simple: before copying anything in, compare how much data you were handed against how much space you actually have. If it does not fit, stop and refuse — before writing a single character.",
    ],
    demo: null,
    bad: `def save(buffer, data):
    for i, ch in enumerate(data):
        buffer[i] = ch   # writes even if data is too long`,
    good: `def save(buffer, data):
    if len(data) > len(buffer):
        raise ValueError("too big")   # check FIRST
    for i, ch in enumerate(data):
        buffer[i] = ch`,
    badCaption: "No limit — long input overflows the buffer.",
    goodCaption: "Validate the length before touching memory.",
    takeaway: "Validate first, write second — never the other way around.",
  },
  {
    title: "Erase what you leave behind",
    analogy:
      "deleting a file's name from a folder doesn't shred the pages — the paper is still in the drawer.",
    explain: [
      "When you remove something from a stack, the program usually just moves a marker that says where the top is. The actual value stays exactly where it was in memory. As far as your code is concerned it is gone — but the bytes are still sitting there.",
      "If that value was a password, a PIN, or a token, anyone who can read that memory later — through a crash dump, leftover memory, or a bug — can still find it. Try the demo: push a secret, pop it, then peek at the raw memory an attacker would see.",
      "The fix is to overwrite the slot as you remove it, replacing the secret with something harmless. Now 'removed' really does mean 'gone.'",
    ],
    demo: "ghost",
    bad: `def pop(self):
    value = self.slots[self.top]
    self.top -= 1          # value still sits in slots!
    return value`,
    good: `def pop(self):
    value = self.slots[self.top]
    self.slots[self.top] = None   # wipe the slot
    self.top -= 1
    return value`,
    badCaption: "The secret lingers in storage after it is 'gone'.",
    goodCaption: "Overwrite the slot as you remove it.",
    takeaway: "'Removed' is not 'erased'. Overwrite anything sensitive you drop.",
  },
  {
    title: "Clean sensitive data before you store it",
    analogy:
      "undo history is like a security camera that never stops recording — even the stuff you quickly wiped off the screen.",
    explain: [
      "Programs keep copies of things all the time: undo buffers, logs, autosaves, caches. If a secret goes into one of those copies in its raw form, deleting it from the screen does not help — the copy is untouched.",
      "In the demo, type a note containing a fake Social Security Number, save it, and clear the box. The screen looks clean, but the history still holds the SSN word-for-word.",
      "The fix is to clean the data on its way into storage — find the sensitive pattern and replace it with a placeholder — so the copy that gets kept never contained the secret in the first place.",
    ],
    demo: "redact",
    steps: [
      "Start with a pattern that recognises the sensitive data. In the challenge there's already an SSN_PATTERN — a regular expression that matches anything shaped like 123-45-6789.",
      "Right before you save a snapshot into the history, run the text through that pattern and replace every match with a fixed placeholder such as [REDACTED-SSN].",
      "In Python that's a single call: the pattern's .sub() method swaps every match for your placeholder and hands back a clean copy of the string.",
      "Store that cleaned copy — not the original. The text on screen that the user is editing stays exactly as typed; only the copy going into history gets scrubbed.",
      "That's the whole trick: sanitise on the way IN, so the stored copy never held the secret in the first place.",
    ],
    takeaway:
      "Sanitize on the way into storage — deleting from the screen isn't enough.",
  },
  {
    title: "Let each action happen only once",
    analogy:
      "a movie ticket — it should get you in once, not every time you wave it at the door.",
    explain: [
      "Some actions must happen exactly once: charging a card, transferring money, submitting an order. But the web makes it easy to repeat a request — hit back and resubmit, double-click, or refresh — and if the code does not notice, it happily does the action again.",
      "In the demo, press Confirm a few times with protection off and watch the balance drop each time. That is a real bug class called a replay or double-submission.",
      "The fix is to give each action a single-use token: create it when the action starts, mark it used when it completes, and refuse any request that arrives with an already-used token.",
    ],
    demo: "replay",
    bad: `def confirm():
    account.balance -= amount   # runs every call`,
    good: `def confirm():
    if token in used:           # already done?
        raise TokenAlreadyUsedError
    used.add(token)
    account.balance -= amount`,
    badCaption: "Nothing stops a replay from charging again.",
    goodCaption: "A single-use token blocks repeats.",
    takeaway:
      "Give each action a one-time ticket, and refuse a ticket that's already spent.",
  },
  {
    title: "Check who really asked",
    analogy:
      "a VIP wristband gets you past the bouncer — but if the bouncer only checks 'did a staff member walk you in?', anyone escorted by staff strolls into the VIP area.",
    explain: [
      "Requests often pass through several layers: a user calls a service, which calls another service, which fetches the data. If the final step only checks 'is my immediate caller trusted?', it misses the important question: who originally asked for this?",
      "In the demo, send a request as a regular user through a trusted internal service. With the origin check off, the regular user walks right out with the admin-only report. This bug even has a name — a confused deputy.",
      "The fix is to check the original requester's permission — not just the trusted middle-man's — before handing over anything sensitive.",
    ],
    demo: "deputy",
    bad: `if caller == "internal_service":
    return secret_report   # only checks the middleman`,
    good: `if user_role in allowed_roles[report]:
    return secret_report   # who ORIGINALLY asked?
raise AuthorizationError`,
    badCaption: "Trusts the messenger, not the sender.",
    goodCaption: "Checks the original requester's permission.",
    takeaway:
      "Trusting the messenger isn't trusting the sender — verify the real origin.",
  },
  {
    title: "Don't let recursion (or timing) run wild",
    analogy:
      "two very different leaks: a tower of blocks that topples if you stack too high, and a lock that clicks a beat slower when you guess a digit right.",
    explain: [
      "Recursion means a function calling itself. Every call adds a frame to the call stack, and the stack has a limit. Feed it deeply nested input and it can topple over — a RecursionError that crashes the program. An attacker can trigger that on purpose to take your service down (a denial of service).",
      "Try the demo: raise the nesting depth and run it. Past the limit, the recursive version overflows and crashes; a version that uses its own list and caps the depth stays standing.",
      "The second leak is about time. If a check bails out the instant something is wrong, then wrong answers that are 'closer' to correct take a little longer to reject — and an attacker measuring that tiny delay can guess a secret one character at a time. The fix there is to do the same amount of work every time and decide only at the end.",
    ],
    demo: "recursion",
    bad: `def depth(node):
    return 1 + depth(node.child)   # crashes when very deep

for a, b in zip(guess, secret):
    if a != b:
        return False   # early exit -> timing leak`,
    good: `stack = [start]
while stack:                 # a loop you control
    node = stack.pop()
    if len(stack) > MAX_DEPTH:
        raise InputTooDeepError

ok = True
for a, b in zip(guess, secret):
    if a != b:
        ok = False           # keep going; decide at the end
return ok`,
    badCaption: "Unbounded recursion crashes; early exit leaks timing.",
    goodCaption: "A capped loop can't overflow; constant work hides the secret.",
    takeaway: "Cap the depth, and do the same amount of work every time.",
  },
];

const GLOSSARY = [
  {
    term: "buffer",
    def: "A fixed-size chunk of memory set aside to hold data — like a box with a set number of slots.",
  },
  {
    term: "return address",
    def: "The note a function leaves on the stack saying where to continue once it finishes.",
  },
  {
    term: "pointer / index",
    def: "A marker that says 'the data is here.' Moving it doesn't erase what it used to point at.",
  },
  {
    term: "frame",
    def: "One function's slice of the call stack: its local variables plus its return address.",
  },
  {
    term: "token",
    def: "A one-time marker you hand out so an action can be recognized — and refused if replayed.",
  },
  {
    term: "side channel",
    def: "Leaking a secret indirectly — e.g. through how long something takes rather than what it returns.",
  },
];

// ── Interactive push/pop stack ────────────────────────────────────────
type StackFrame = { id: number; value: string };

const SUGGESTIONS = ["main()", "login()", "42", "🍕", "secret"];

function StackVisualizer() {
  const [items, setItems] = useState<StackFrame[]>([
    { id: 1, value: "main()" },
    { id: 2, value: "greet()" },
  ]);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const nextId = useRef(3);

  function push() {
    const value =
      input.trim() ||
      SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
    setItems((prev) => [...prev, { id: nextId.current++, value }]);
    setInput("");
    setMessage(`Pushed “${value}” onto the top.`);
  }

  function pop() {
    if (items.length === 0) {
      setMessage("The stack is empty — there's nothing to pop.");
      return;
    }
    const top = items[items.length - 1];
    setItems((prev) => prev.slice(0, -1));
    setMessage(`Popped “${top.value}” — the newest item came off first.`);
  }

  const reversed = [...items].reverse();

  return (
    <div className="rounded-xl border border-border bg-[#0a0a0c] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && push()}
          placeholder="Type a value…"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-accent"
        />
        <button
          onClick={push}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          Push
        </button>
        <button
          onClick={pop}
          disabled={items.length === 0}
          className="rounded-lg border border-border px-4 py-2 text-sm text-fg transition-colors hover:border-white/25 hover:bg-white/5 disabled:opacity-40"
        >
          Pop
        </button>
      </div>

      <div className="mt-5 flex min-h-56 flex-col justify-end gap-2">
        {reversed.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted">
            The stack is empty. Push something!
          </div>
        ) : (
          reversed.map((frame, idx) => (
            <div
              key={frame.id}
              className={`stack-item-enter flex items-center justify-between rounded-lg border px-4 py-3 font-mono text-sm ${
                idx === 0
                  ? "border-accent bg-accent/10 text-fg"
                  : "border-border bg-surface text-fg/80"
              }`}
            >
              <span>{frame.value}</span>
              {idx === 0 && (
                <span className="text-xs font-medium text-accent">← top</span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-muted">
          {items.length} item{items.length === 1 ? "" : "s"} on the stack
        </span>
        {message && <span className="text-accent">{message}</span>}
      </div>
    </div>
  );
}
