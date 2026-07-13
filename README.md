# Hacky Stacky

Still building ⚠️
Try it here: https://ds-cyber-educational-tool.vercel.app/

An interactive web platform that teaches **data structures through the lens of cybersecurity** — Brilliant meets Duolingo, with a hacker twist. Learners meet each data structure from scratch, build real intuition through hands-on visualizations and quizzes, then **write and run real code fixes directly in the browser** against live-graded vulnerabilities. Your guide throughout is **Sudo**, the friendly node-shaped mascot.

> **Research project** developed under the supervision of **Professor Sana Habib** at **Washington and Lee University**.

---

## What it does

- **Learn the structure first — properly.** Before any security, each module teaches the data structure the way the best interactive courses do: one idea per screen, a real-world analogy, a memory model, and — crucially — a **"How fast is it?"** breakdown that gives every operation its Big-O *and the plain-English reason why* (why array reads are O(1), why a middle-insert is O(n)). A **"Where you've already met one"** grid anchors each structure to things learners use every day (the call stack, the browser back button, printers, GPS, dictionaries…).
- **Predict, then verify.** Interactive **"Quick check" quizzes** make learners commit to an answer before moving on — wrong picks get specific feedback, and the lesson only advances once they've got it. Learning by doing, not by watching.
- **Interactive visualizations.** Custom hands-on demos: a live push/pop stack, a "break the stack" buffer-overflow playground, and a dedicated interactive for each security pattern (stale memory, redaction, replay, authorization, recursion depth, and more).
- **Two ways to learn, your choice.** Every module can be read as one long page, or played as a **three-part stepped lesson** with Sudo — _the basics_, _the safety patterns_, and _a guided challenge run_ — with a progress bar, XP, and bite-sized steps. The entry cards sit above each section; the full page is always there if you'd rather scroll.
- **Code in the browser.** A built-in editor lets students edit vulnerable starter code and **run a real test suite against it live** — no terminal, no installation. Grading happens by executing Python in the browser via WebAssembly.
- **Sequential unlocking.** Challenges open one at a time: pass the current one to unlock the next. Progressive hints reveal one at a time, and a **"Stuck for good?"** panel shows a full walkthrough and a working solution — studying it counts as finishing, so a genuinely stuck learner can always move on.
- **Accounts and progress.** Optional email/password sign-in (Supabase); solved challenges are remembered in the browser.
- **Help & search.** A Help center with an FAQ, a **direct-send contact form** (message the maintainer without leaving the page), and instant site-wide search across every module and challenge.

## Modules

Eight data-structure modules are fully built — each with an interactive lesson, a three-part stepped player, and **8 hands-on, auto-graded challenges** (64 in total):

| Module | Data structure | Sample vulnerabilities |
|---|---|---|
| Array Armory | Arrays | out-of-bounds writes, ghost elements, unbounded growth, concurrent resize |
| Stack Smashing | Stacks | buffer overflow, stale secrets, replay, recursion DoS, timing side channel |
| Queue Quarantine | Queues | overflow, priority bypass, replay, poisoning, race conditions |
| Linked Labyrinth | Linked Lists | pointer corruption, use-after-free, cycle injection, hash-chain tampering |
| Hash Heist | Hash Tables | bucket corruption, key poisoning, collision DoS, concurrent rehash |
| Tree Trojan | Trees | path traversal, ACL inheritance, recursive DoS, Merkle tampering |
| Graph Gauntlet | Graphs | untrusted nodes, trust propagation, cyclic traversal DoS, integrity hashes |
| Heap Havoc | Heaps & Priority Queues | priority corruption, escalation, heap flooding, invariant tampering |

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI library | [React 19](https://react.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| In-browser Python | [Pyodide](https://pyodide.org/) (CPython compiled to WebAssembly) |
| Auth | [Supabase](https://supabase.com/) (email/password, optional) |
| Contact form | [FormSubmit](https://formsubmit.co/) (serverless email relay) |
| Tooling | ESLint, Node.js |

**No traditional backend and no database of our own.** The site is statically generated and runs client-side, so it can be hosted on any static host. Student code execution and grading happen in the browser via WebAssembly; progress is stored in `localStorage`; auth and contact use hosted services.

## How the in-browser grading works

When a learner clicks **Run tests**, the app lazy-loads [Pyodide](https://pyodide.org/) (a full CPython interpreter compiled to WebAssembly). It executes the learner's edited code together with a test harness and reports pass/fail per test — all without a server. The first run downloads the runtime (~10 MB, cached afterward); subsequent runs are instant.

## Research data collection

As an educational research project, the app can log **anonymous learning events** — challenge attempts (pass/fail), hint and solution reveals, quiz answers, lesson-step completion, and page views — to Supabase for analysis. It is:

- **Consent-gated.** Nothing is recorded until the visitor accepts a consent banner; declining keeps everything local, exactly as before.
- **Privacy-preserving.** Events carry a random per-browser id (and the account id if signed in), never names or message contents. Learners can't read others' events (Row Level Security allows insert-only).
- **Non-blocking.** Logging is fire-and-forget and can never break the learning experience.

To enable it, run [`supabase/schema.sql`](supabase/schema.sql) once in the Supabase SQL editor (it creates the `learning_events` table + policies and includes example analysis queries). Aggregate traffic is also collected via [Vercel Web Analytics](https://vercel.com/docs/analytics).

---

## Getting started

**Prerequisites:** [Node.js](https://nodejs.org/) 20+ and npm.

```bash
# install dependencies
npm install

# start the dev server (http://localhost:3000)
npm run dev

# create an optimized production build
npm run build

# serve the production build
npm run start
```

### Environment variables (optional)

Auth is disabled gracefully if these are unset. To enable Supabase sign-in, copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Project structure

```
src/
├── app/                          # Next.js routes (pages)
│   ├── page.tsx                  # home page
│   ├── help/ · search/ · welcome/  # help center, search, onboarding
│   └── modules/
│       ├── page.tsx              # module index
│       └── [slug]/
│           ├── page.tsx          # module detail + long-scroll lesson
│           ├── learn/            # three-part stepped lesson player
│           │   ├── page.tsx      # part chooser
│           │   └── [part]/       # basics · patterns · challenges
│           └── [challengeId]/page.tsx   # a single challenge (locked in sequence)
├── components/
│   ├── lessons/                  # lesson content + interactive teaching demos
│   │   ├── interactives/         # per-pattern interactive visualizations
│   │   ├── players/              # stepped-lesson players + per-module intros
│   │   ├── LessonPlayer.tsx      # the Brilliant-style stepped player
│   │   └── FactsPanel.tsx        # "how fast / where used" panels
│   ├── Quiz.tsx                  # predict-before-you-continue check-ins
│   ├── ChallengeWorkbench.tsx    # in-browser code editor + runner
│   ├── ChallengeList.tsx · ChallengeGuard.tsx   # sequential unlocking
│   ├── SolutionReveal.tsx        # "Stuck for good?" walkthrough
│   └── HelpContact.tsx · SearchClient.tsx
└── lib/
    ├── modules.ts                # module registry + challenge data model
    ├── <structure>-challenges.ts # one file per module (stack, queue, tree, …)
    ├── ds-facts.ts               # operation costs + real-world uses per structure
    ├── pyodide.ts                # loads Pyodide + runs tests in the browser
    └── progress.ts               # local progress, sequential unlocking
```

Content is **data-driven**: modules, challenges, hints, solutions, and teaching facts live in typed data files, and the pages are generated from them — adding content is mostly a data change, not new UI code.

---

## Acknowledgements

Developed as a research and educational project under the supervision of **Professor Sana Habib**, Washington and Lee University. The *Stack Smashing* challenge set is adapted from associated coursework.
