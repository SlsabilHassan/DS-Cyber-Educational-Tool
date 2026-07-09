# DS-Cyber Educational Tool
Still building ⚠️
Check it through here: https://ds-cyber-educational-tool.vercel.app/

An interactive web platform that teaches **data structures through the lens of cybersecurity**. Learners work through hands-on modules that pair each data structure with the vulnerabilities and defenses it unlocks — reading friendly explanations, playing with interactive visualizations, and then **writing and running real code fixes directly in the browser**.

> **Research project** developed under the supervision of **Professor Sana Habib** at **Washington and Lee University**.

---

## What it does

- **Learn-first lessons.** Each module opens with a plain-language primer built for someone who has never seen the concept before — analogies, worked explanations, and a glossary.
- **Interactive visualizations.** Custom, hands-on demos: a live push/pop stack, a "break the stack" buffer-overflow playground, and a dedicated interactive for each security pattern (stale memory, redaction, replay, authorization, recursion depth).
- **Code in the browser.** A built-in editor lets students edit vulnerable starter code and **run a real test suite against it live** — no terminal, no installation. Grading happens by executing Python in the browser.
- **Progressive hints.** Stuck learners can reveal hints one at a time, from a gentle nudge to a concrete technique — without being handed the answer.
- **Detailed solutions.** Every challenge includes an on-request walkthrough plus one working solution.
- **Progress tracking.** Solved challenges are remembered locally in the browser.

## Modules

Eight data-structure modules are fully built — each with an interactive lesson and **8 hands-on, auto-graded challenges** (64 in total):

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
| Tooling | ESLint, Node.js |

**No backend and no database.** The entire site is statically generated and runs client-side, so it can be hosted on any static host. Student code execution and grading happen in the browser via WebAssembly; progress is stored in `localStorage`.

## How the in-browser grading works

When a learner clicks **Run tests**, the app lazy-loads [Pyodide](https://pyodide.org/) (a full CPython interpreter compiled to WebAssembly). It executes the learner's edited code together with a test harness and reports pass/fail per test — all without a server. The first run downloads the runtime (~10 MB, cached afterward); subsequent runs are instant.

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

## Project structure

```
src/
├── app/                     # Next.js routes (pages)
│   ├── page.tsx             # home page
│   └── modules/
│       ├── page.tsx         # module index
│       └── [slug]/
│           ├── page.tsx     # module detail + lesson
│           └── [challengeId]/page.tsx   # a single challenge
├── components/
│   ├── lessons/             # lesson content + interactive teaching demos
│   │   └── interactives/    # per-pattern interactive visualizations
│   ├── ChallengeWorkbench.tsx   # in-browser code editor + runner
│   └── ...                  # header, footer, cards, icons, etc.
└── lib/
    ├── modules.ts               # module registry + challenge data model
    ├── <structure>-challenges.ts # one file per module (stack, queue, tree, …)
    ├── pyodide.ts               # loads Pyodide + runs tests in the browser
    └── progress.ts              # local progress tracking
```

Content is **data-driven**: modules, challenges, hints, and solutions live in typed data files, and the pages are generated from them — adding content is a data change, not new UI code.

---

## Acknowledgements

Developed as a research and educational project under the supervision of **Professor Sana Habib**, Washington and Lee University. The *Stack Smashing* challenge set is adapted from associated coursework.
