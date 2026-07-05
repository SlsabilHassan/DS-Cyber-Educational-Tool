"use client";

import { ModuleLesson, Snippet, type Concept, type GlossaryItem } from "./lessonui";
import { QueueVisualizer } from "./interactives/QueueVisualizer";
import { QueueOverflowDemo } from "./interactives/QueueOverflowDemo";
import { QueueDosDemo } from "./interactives/QueueDosDemo";

export function QueueLesson() {
  return (
    <ModuleLesson
      title="What's a queue?"
      intro={
        <>
          <p>
            Imagine the line at a coffee shop. The first person to join the
            line is the first person served; new people join at the{" "}
            <span className="text-fg">back</span>. Nobody cuts.
          </p>
          <p>
            That&apos;s a queue: the{" "}
            <span className="text-fg">first thing in is the first thing out</span>
            . Programmers call this <span className="text-accent">FIFO</span> —
            First In, First Out. It has two moves:{" "}
            <span className="font-mono text-accent">enqueue</span> (join the
            back) and <span className="font-mono text-accent">dequeue</span>{" "}
            (leave the front).
          </p>
        </>
      }
      tryIt={
        <>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Try it yourself
          </h3>
          <p className="mt-2 text-sm text-muted">
            Enqueue a few items, then dequeue. The{" "}
            <span className="text-fg">oldest</span> one always leaves first.
          </p>
          <div className="mt-4">
            <QueueVisualizer />
          </div>
          <p className="mt-6 leading-relaxed text-muted">
            Queues run the world quietly: print jobs, network packets, payment
            requests, task schedulers. And because they sit between producers
            and consumers — often holding sensitive work — the way you write
            them has real security consequences.
          </p>
          <div className="mt-4">
            <Snippet
              code={`from collections import deque

q = deque()
q.append("job-1")     # enqueue (join the back)
q.append("job-2")
first = q.popleft()   # dequeue -> "job-1" (first in, first out)`}
            />
          </div>
        </>
      }
      patternsIntro={
        <>
          The eight challenges below are all variations on the same handful of
          ideas. Each is explained from scratch, with{" "}
          <span className="text-red-400">risky</span> code beside a{" "}
          <span className="text-accent">safer</span> version — and a couple you
          can poke at directly.
        </>
      }
      concepts={CONCEPTS}
      glossary={GLOSSARY}
      closing="That's the toolkit. Now try the challenges below — and lean on the hints if you get stuck. ↓"
    />
  );
}

const CONCEPTS: Concept[] = [
  {
    title: "Check capacity before you write",
    analogy:
      "pouring more coffee than the cup holds — it spills onto whatever is sitting next to it.",
    explain: [
      "A fixed-size queue reserves a block of memory for its items. If enqueue() writes a new item without first checking that there's room, the extra write lands past the end of the queue — on whatever data sits next in memory.",
      "In the demo, that neighbor is an “admin” flag. Fill the queue, enqueue once more with the check off, and watch a normal user quietly become an admin.",
      "The fix is to compare the queue's size against its capacity at the very top of enqueue(), and refuse the write if it's full.",
    ],
    demo: QueueOverflowDemo,
    bad: `def enqueue(q, x):
    q.mem[q.tail] = x     # write with no room check
    q.tail += 1
    q.size += 1`,
    good: `def enqueue(q, x):
    if q.size >= CAP:
        raise QueueOverflowError
    q.mem[q.tail] = x
    q.tail += 1
    q.size += 1`,
    badCaption: "No limit — a full queue overflows into its neighbor.",
    goodCaption: "Validate capacity before touching memory.",
    takeaway: "Validate first, write second — never the other way around.",
  },
  {
    title: "Erase what you dequeue",
    analogy:
      "crossing a name off a list doesn't tear the page out — the writing is still there to read.",
    explain: [
      "Dequeuing usually just moves the head pointer forward. The value it left behind stays sitting in the queue's memory, exactly where it was.",
      "If that value was a password or an API token, anyone who can read the queue's memory later can still recover it — long after it was “removed.”",
      "The fix is to overwrite the old slot (with None) as you dequeue, so removed really means gone.",
    ],
    bad: `def dequeue(q):
    v = q.mem[q.head]
    q.head += 1            # value still sits in q.mem!
    return v`,
    good: `def dequeue(q):
    v = q.mem[q.head]
    q.mem[q.head] = None   # wipe the slot
    q.head += 1
    return v`,
    badCaption: "The secret lingers in memory after it's 'gone'.",
    goodCaption: "Overwrite the slot as you remove it.",
    takeaway: "'Removed' isn't 'erased' — overwrite anything sensitive you drop.",
  },
  {
    title: "Don't trust a caller's priority",
    analogy:
      "a ticket that says 'VIP' only matters if the bouncer checks whether you're actually a VIP.",
    explain: [
      "Priority queues run urgent work before normal work. The danger is letting the caller decide their own priority: if anyone can stamp their job HIGH, they can jump the line or starve everyone else.",
      "The fix is to check authority before honoring a HIGH request — only trusted callers may enqueue high-priority work; everyone else is refused.",
    ],
    bad: `def enqueue(q, msg, priority, trusted):
    if priority == HIGH:
        q.high.append(msg)   # anyone can ask for HIGH`,
    good: `def enqueue(q, msg, priority, trusted):
    if priority == HIGH and not trusted:
        raise AuthorizationError
    ...`,
    badCaption: "Trusts a value the attacker controls.",
    goodCaption: "Only trusted callers get HIGH priority.",
    takeaway: "Never let untrusted input decide its own privilege level.",
  },
  {
    title: "Consume each message once",
    analogy:
      "a movie ticket should get you in once — not every time you wave it at the usher.",
    explain: [
      "Queues often process a request exactly once: a transfer, a payment, a password reset. The danger is “processing” the front item without actually removing it.",
      "If the item stays at the front, calling process again re-runs the same action — a replay attack.",
      "The fix is to remove the item from the front as you process it (popleft), so it can't be replayed.",
    ],
    bad: `def process(q):
    req = q.queue[0]      # peek — never removed
    return req`,
    good: `def process(q):
    req = q.queue.popleft()   # consume it
    return req`,
    badCaption: "Peeking leaves the request replayable.",
    goodCaption: "Remove it as you process it.",
    takeaway: "Give each action a one-time life — consume it, don't just read it.",
  },
  {
    title: "Validate before you accept",
    analogy:
      "a mailroom that x-rays every package before it goes on the conveyor belt.",
    explain: [
      "Services hand work to each other through queues. If enqueue() accepts any object, an attacker can slip in a malformed or unauthorized message that later crashes the consumer or triggers a privileged action — “queue poisoning.”",
      "The fix is to validate every message on the way in: check its shape, its required fields, and that its type is on an allow-list. Reject anything else before it's stored.",
    ],
    bad: `def enqueue(q, msg):
    q.queue.append(msg)   # accepts anything`,
    good: `def enqueue(q, msg):
    if msg.get("type") not in ALLOWED:
        raise InvalidMessageError
    q.queue.append(msg)`,
    badCaption: "Any object can enter the pipeline.",
    goodCaption: "Only well-formed, allow-listed messages get in.",
    takeaway: "Distrust input at the boundary — validate on the way in.",
  },
  {
    title: "Cap the size, lock shared state, show the minimum",
    analogy:
      "a nightclub with a fire-code limit, one door person, and a guest list that hides everyone's home address.",
    explain: [
      "The last three challenges are all about limits and exposure. An unbounded queue lets an attacker flood it until memory runs out (a denial of service) — try the demo below. The fix is a hard size cap that rejects extra work.",
      "When several threads share one queue, unsynchronized enqueue/dequeue can corrupt its state; wrapping each in a lock keeps it consistent.",
      "And when you expose queue contents to a dashboard, return only the safe fields — never the internal IPs, tokens, or IDs stored alongside them.",
    ],
    demo: QueueDosDemo,
    bad: `def enqueue(q, job):
    q.queue.append(job)   # unbounded — grows forever`,
    good: `def enqueue(q, job):
    if len(q.queue) >= MAX:
        raise QueueFullError
    q.queue.append(job)`,
    badCaption: "No ceiling — a flood exhausts memory.",
    goodCaption: "A hard cap rejects the flood.",
    takeaway: "Bound your resources, guard shared state, and reveal only what's needed.",
  },
];

const GLOSSARY: GlossaryItem[] = [
  {
    term: "FIFO",
    def: "First In, First Out — the order a queue serves items: oldest first.",
  },
  {
    term: "enqueue / dequeue",
    def: "Add an item to the back of the queue / remove the item at the front.",
  },
  {
    term: "head / tail",
    def: "Markers for the front (next to leave) and back (where new items join).",
  },
  {
    term: "priority queue",
    def: "A queue where higher-priority items are served before lower-priority ones.",
  },
  {
    term: "denial of service (DoS)",
    def: "Overwhelming a system — here, flooding a queue — until it can't serve real users.",
  },
  {
    term: "race condition",
    def: "A bug where two threads touching shared data at once leave it in a wrong state.",
  },
];
