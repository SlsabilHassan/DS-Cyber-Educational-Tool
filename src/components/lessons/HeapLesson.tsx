"use client";

import { ModuleLesson, Snippet, type Concept, type GlossaryItem } from "./lessonui";
import { HeapVisualizer } from "./interactives/HeapVisualizer";
import { EscalationDemo } from "./interactives/EscalationDemo";
import { HeapInvariantDemo } from "./interactives/HeapInvariantDemo";

export function HeapLesson() {
  return (
    <ModuleLesson
      slug="heap-havoc"
      title="What's a heap (and a priority queue)?"
      intro={
        <>
          <p>
            Think of a hospital emergency room. Patients aren&apos;t seen in the
            order they arrive — the most urgent one goes first, no matter when
            they walked in. A <span className="text-fg">priority queue</span>{" "}
            works the same way: every item has a priority, and the most urgent
            one always comes out next.
          </p>
          <p>
            A <span className="text-fg">heap</span> is the clever tree that makes
            this fast: it keeps the highest-priority item at the top so you can
            grab it instantly, and re-balances in O(log n) after each change.
            Schedulers, operating systems, and job queues all run on heaps —
            which means messing with a task&apos;s priority can quietly reorder
            everything.
          </p>
        </>
      }
      tryIt={
        <>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Try it yourself
          </h3>
          <p className="mt-2 text-sm text-muted">
            Insert tasks with a priority (lower = more urgent) and hit “Serve
            top” — the most urgent one always leaves first, whatever order you
            added them in.
          </p>
          <div className="mt-4">
            <HeapVisualizer />
          </div>
          <div className="mt-4">
            <Snippet
              code={`import heapq

pq = []
heapq.heappush(pq, (3, "Backup"))   # (priority, task)
heapq.heappush(pq, (1, "Scan"))
print(heapq.heappop(pq))            # -> (1, "Scan") — most urgent first`}
            />
          </div>
        </>
      }
      patternsIntro={
        <>
          The eight challenges all come down to trusting the wrong thing: a
          priority value, a caller, a task, or the heap&apos;s own order. Each
          idea pairs <span className="text-red-400">risky</span> code with a{" "}
          <span className="text-accent">safer</span> version.
        </>
      }
      concepts={CONCEPTS}
      glossary={GLOSSARY}
      closing="That's the toolkit — and the last module. Now try the challenges below, and lean on the hints if you get stuck. ↓"
    />
  );
}

export const CONCEPTS: Concept[] = [
  {
    title: "Validate priority values",
    analogy:
      "an ER triage form that's supposed to take 1–10, but someone writes '9999' and jumps the entire line.",
    explain: [
      "A priority queue orders work by priority, so priorities must stay inside an approved range. Accepting an arbitrary value lets an attacker force their task to the front and starve everything else.",
      "The fix is to check the new priority is an integer within the allowed range before applying it.",
    ],
    bad: `def update_priority(task, new_priority):
    task.priority = new_priority   # trusts any value`,
    good: `def update_priority(task, new_priority):
    if not (MIN_PRIORITY <= new_priority <= MAX_PRIORITY):
        raise InvalidPriorityError
    task.priority = new_priority`,
    badCaption: "An out-of-range priority reorders the queue.",
    goodCaption: "Only in-range priorities are applied.",
    takeaway: "Bound priority values before they touch the schedule.",
  },
  {
    title: "Clear metadata when you remove",
    analogy:
      "discharging a patient but leaving their triage chart clipped to the bed.",
    explain: [
      "Removing a task from the heap should strip its scheduling info. Leaving the priority set means a leftover reference to the removed task still reveals where it sat in the queue.",
      "The fix is to clear the sensitive field before returning the removed task.",
    ],
    bad: `task = queue.heap.pop(0)
return task              # priority still attached`,
    good: `task = queue.heap.pop(0)
task.priority = CLEARED  # scrub it
return task`,
    badCaption: "The removed task still leaks its priority.",
    goodCaption: "Scheduling metadata is cleared on removal.",
    takeaway: "Strip scheduling metadata when a task leaves the queue.",
  },
  {
    title: "Authorize priority escalation",
    analogy:
      "a hospital where any visitor can bump themselves to the front of the surgery list.",
    explain: [
      "Only privileged users should be able to assign high priorities. If any user can escalate their own task, critical system work gets delayed behind attacker-controlled tasks.",
      "The fix is to check the user's role before allowing a high-priority assignment.",
      "Try the demo: escalate a task to the front as a regular user, with the cap off then on.",
    ],
    demo: EscalationDemo,
    bad: `def update_priority(user, task, new_priority):
    task.priority = new_priority   # any user, any priority`,
    good: `def update_priority(user, task, new_priority):
    if (user.role != ADMIN
            and new_priority > MAX_USER_PRIORITY):
        raise AuthorizationError
    task.priority = new_priority`,
    badCaption: "Any user can escalate to the front.",
    goodCaption: "Only admins assign high priority.",
    takeaway: "Gate privileged priority levels behind an authorization check.",
  },
  {
    title: "Reject duplicate and untrusted tasks",
    analogy:
      "two patients wearing the same ID bracelet — or a stranger slipping into the ward without one.",
    explain: [
      "Two insertion bugs. First: a task whose id already exists lets one task impersonate another and corrupts updates and removals — reject duplicates.",
      "Second: accepting a task with no trusted marker lets an attacker inject malicious work into the queue — validate the task before inserting.",
      "Both fixes are the same shape: check on the way in, and refuse before touching the heap.",
    ],
    bad: `def insert_task(queue, task):
    queue.heap.append(task)   # any id, any (untrusted) task`,
    good: `def insert_task(queue, task):
    if getattr(task, "marker", None) != VALID:
        raise InvalidTaskError
    if any(t.task_id == task.task_id for t in queue.heap):
        raise DuplicateTaskError
    queue.heap.append(task)`,
    badCaption: "Duplicates and untrusted tasks enter the queue.",
    goodCaption: "Only unique, trusted tasks get in.",
    takeaway: "Validate identity and trust before inserting a task.",
  },
  {
    title: "Cap the queue",
    analogy:
      "a waiting room with no capacity limit — pack it and no real patient gets seen.",
    explain: [
      "A queue that accepts unlimited tasks lets an attacker flood it until memory is exhausted or legitimate work is delayed forever — a denial of service.",
      "The fix is a hard capacity limit that rejects new tasks once the queue is full.",
    ],
    bad: `def insert_task(queue, task):
    queue.heap.append(task)   # unbounded`,
    good: `def insert_task(queue, task):
    if len(queue.heap) >= MAX_CAPACITY:
        raise QueueFullError
    queue.heap.append(task)`,
    badCaption: "An unbounded queue can be flooded.",
    goodCaption: "A capacity cap rejects the flood.",
    takeaway: "Bound the queue so it can't be exhausted.",
  },
  {
    title: "Hide internals, and keep the heap valid",
    analogy:
      "handing a patient a summary card, not the full clipboard — and re-sorting the triage list whenever an urgency changes.",
    explain: [
      "Two final bugs. peek/return operations that hand back the whole task expose internal scheduler tokens — return only the public fields.",
      "And changing a task's priority breaks the heap order unless it's restored. Skip the fix-up and the queue starts serving the wrong task first — the whole point of a priority queue is lost.",
      "Try the demo: change a task's urgency with heap-restore off, then on.",
    ],
    demo: HeapInvariantDemo,
    bad: `def peek_task(queue):
    return queue.heap[0]        # exposes the scheduler token

# ...and after changing a priority:
task.priority = new_priority     # heap order now broken`,
    good: `def peek_task(queue):
    top = queue.heap[0]
    return {"task_id": top.task_id, "priority": top.priority}

task.priority = new_priority
restore_heap(queue)              # re-establish the invariant`,
    badCaption: "Leaks internal tokens; leaves the heap unsorted.",
    goodCaption: "Returns public fields; restores the heap order.",
    takeaway: "Expose only public fields, and restore the invariant after every change.",
  },
];

const GLOSSARY: GlossaryItem[] = [
  { term: "priority queue", def: "A queue that serves the highest-priority item next, regardless of arrival order." },
  { term: "heap", def: "A tree that keeps the top-priority item reachable fast and re-balances in O(log n)." },
  { term: "min-heap", def: "A heap where the smallest value (here, lowest priority number) sits at the top." },
  { term: "heap property / invariant", def: "The rule that each parent out-ranks its children, keeping the top item correct." },
  { term: "priority escalation", def: "Illegitimately raising a task's priority to jump the queue." },
  { term: "heapify / restore", def: "Re-establishing the heap property after inserting, removing, or changing an item." },
];
