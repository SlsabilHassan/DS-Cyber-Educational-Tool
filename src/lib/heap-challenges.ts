import type { Challenge } from "./modules";

// The 8 Heap & Priority Queue Security challenges — same shape as the other
// modules. Starter code is the vulnerable version with the giveaway comments
// stripped; solutions are revealed only on request.

export const heapChallenges: Challenge[] = [
  {
    id: "priority-corruption",
    name: "Priority Corruption",
    points: 60,
    vulnerability: "Out-of-range priority values",
    background:
      "A priority queue decides what runs first based on each task's priority, which must stay within an approved range (1–10). update_priority() trusts whatever value it's given — so an attacker can set an absurd priority and jump the whole schedule.",
    task: "Fix update_priority() so a priority below MIN_PRIORITY or above MAX_PRIORITY raises InvalidPriorityError before the task changes. Valid priorities still apply.",
    hints: [
      "update_priority() assigns task.priority with no check. What's the allowed range?",
      "It's MIN_PRIORITY to MAX_PRIORITY, inclusive.",
      "If new_priority falls outside that range, raise InvalidPriorityError before assigning it.",
    ],
    language: "python",
    file: "challenge1_priority_corruption.py",
    testCommand: "pytest tests/test_challenge1.py -v",
    lessonAnchor: "pattern-1",
    starterCode: String.raw`MIN_PRIORITY = 1
MAX_PRIORITY = 10


class InvalidPriorityError(Exception):
    pass


class Task:
    def __init__(self, name, priority):
        self.name = name
        self.priority = priority


def update_priority(task, new_priority):
    task.priority = new_priority`,
    tests: String.raw`def test_valid_priority_update():
    t = chal.Task("Backup", 5)
    chal.update_priority(t, 8)
    assert t.priority == 8

def test_boundary_priorities_ok():
    t = chal.Task("x", 5)
    chal.update_priority(t, chal.MIN_PRIORITY)
    assert t.priority == chal.MIN_PRIORITY
    chal.update_priority(t, chal.MAX_PRIORITY)
    assert t.priority == chal.MAX_PRIORITY

def test_too_high_priority_rejected():
    t = chal.Task("x", 5)
    with raises(chal.InvalidPriorityError):
        chal.update_priority(t, 999)

def test_negative_priority_rejected():
    t = chal.Task("x", 5)
    with raises(chal.InvalidPriorityError):
        chal.update_priority(t, -1)

def test_rejected_update_keeps_old_priority():
    t = chal.Task("x", 5)
    try:
        chal.update_priority(t, 999)
    except chal.InvalidPriorityError:
        pass
    assert t.priority == 5`,
    solution: {
      code: String.raw`def update_priority(task, new_priority):
    if not isinstance(new_priority, int) or new_priority < MIN_PRIORITY or new_priority > MAX_PRIORITY:
        raise InvalidPriorityError("Priority out of range.")
    task.priority = new_priority`,
      explanation: [
        "The bug: update_priority() assigns any value to task.priority, so an out-of-range priority corrupts the scheduling order.",
        "The fix: check that new_priority is an integer within [MIN_PRIORITY, MAX_PRIORITY].",
        "If not, raise InvalidPriorityError before assigning — so only legitimate priorities take effect.",
      ],
    },
  },
  {
    id: "stale-priority-metadata",
    name: "Stale Priority Metadata",
    points: 50,
    vulnerability: "Scheduling metadata survives removal",
    background:
      "Removing a task from the heap should strip its scheduling info. Here remove_highest_priority() pops the task but leaves its priority intact — so anyone holding a reference to the removed task can still read where it sat in the schedule.",
    task: "Fix remove_highest_priority() so the removed task's priority is cleared (set to CLEARED) before it's returned. Removal still returns the task, and removing from an empty queue still raises IndexError.",
    hints: [
      "The task is popped from the heap and returned — but what scheduling field does it still carry?",
      "task.priority is still set on the returned object.",
      "Set task.priority = CLEARED before returning it.",
    ],
    language: "python",
    file: "challenge2_stale_priority_metadata.py",
    testCommand: "pytest tests/test_challenge2.py -v",
    lessonAnchor: "pattern-2",
    starterCode: String.raw`CLEARED = None


class Task:
    def __init__(self, name, priority):
        self.name = name
        self.priority = priority


class PriorityQueue:
    def __init__(self):
        self.heap = []

    def insert(self, task):
        self.heap.append(task)


def remove_highest_priority(queue):
    if not queue.heap:
        raise IndexError("Priority queue is empty.")
    task = queue.heap.pop(0)
    return task`,
    tests: String.raw`def build_queue():
    q = chal.PriorityQueue()
    q.insert(chal.Task("Scan", 1))
    q.insert(chal.Task("Backup", 5))
    return q

def test_remove_returns_task():
    q = build_queue()
    t = chal.remove_highest_priority(q)
    assert t.name == "Scan"

def test_remove_empty_raises():
    q = chal.PriorityQueue()
    with raises(IndexError):
        chal.remove_highest_priority(q)

def test_removed_priority_is_cleared():
    q = build_queue()
    t = chal.remove_highest_priority(q)
    assert t.priority is None, "Removed task still exposes its priority"`,
    solution: {
      code: String.raw`def remove_highest_priority(queue):
    if not queue.heap:
        raise IndexError("Priority queue is empty.")
    task = queue.heap.pop(0)
    task.priority = CLEARED     # clear scheduling metadata before returning
    return task`,
      explanation: [
        "The bug: remove_highest_priority() returns the popped task with its priority still set.",
        "The fix: set task.priority = CLEARED (None) before returning it.",
        "The caller still gets the task, but it no longer leaks its former place in the schedule.",
      ],
    },
  },
  {
    id: "priority-escalation",
    name: "Priority Escalation",
    points: 65,
    vulnerability: "Unauthorized priority escalation",
    background:
      "Only admins should be able to give a task a high priority. update_priority() lets any user set any priority — so an unprivileged user can push their task to the front and starve critical system work.",
    task: "Fix update_priority() so a non-admin user cannot set a priority above MAX_USER_PRIORITY; attempting to raises AuthorizationError and leaves the task unchanged. Admins may set any valid priority, and users may still set priorities within their limit.",
    hints: [
      "update_priority() ignores user.role entirely. When should a change be refused?",
      "A regular user may only set priorities up to MAX_USER_PRIORITY; higher values require the admin role.",
      "If new_priority > MAX_USER_PRIORITY and user.role isn't ADMIN, raise AuthorizationError before assigning.",
    ],
    language: "python",
    file: "challenge3_priority_escalation.py",
    testCommand: "pytest tests/test_challenge3.py -v",
    lessonAnchor: "pattern-3",
    starterCode: String.raw`ADMIN = "admin"
USER = "user"
MAX_USER_PRIORITY = 5


class AuthorizationError(Exception):
    pass


class Task:
    def __init__(self, name, priority):
        self.name = name
        self.priority = priority


class User:
    def __init__(self, username, role):
        self.username = username
        self.role = role


def update_priority(user, task, new_priority):
    task.priority = new_priority`,
    tests: String.raw`def test_admin_can_set_high_priority():
    admin = chal.User("Alice", chal.ADMIN)
    t = chal.Task("Backup", 5)
    chal.update_priority(admin, t, 9)
    assert t.priority == 9

def test_user_can_set_within_limit():
    user = chal.User("Bob", chal.USER)
    t = chal.Task("Job", 5)
    chal.update_priority(user, t, chal.MAX_USER_PRIORITY)
    assert t.priority == chal.MAX_USER_PRIORITY

def test_user_cannot_escalate():
    user = chal.User("Bob", chal.USER)
    t = chal.Task("Job", 5)
    with raises(chal.AuthorizationError):
        chal.update_priority(user, t, 9)

def test_failed_escalation_keeps_priority():
    user = chal.User("Bob", chal.USER)
    t = chal.Task("Job", 5)
    try:
        chal.update_priority(user, t, 9)
    except chal.AuthorizationError:
        pass
    assert t.priority == 5`,
    solution: {
      code: String.raw`def update_priority(user, task, new_priority):
    if new_priority > MAX_USER_PRIORITY and user.role != ADMIN:
        raise AuthorizationError("Only admins may assign high priority.")
    task.priority = new_priority`,
      explanation: [
        "The bug: update_priority() lets any user set any priority, so a regular user can escalate a task to the front of the queue.",
        "The fix: if the requested priority exceeds MAX_USER_PRIORITY and the user isn't an admin, raise AuthorizationError.",
        "Admins keep full control; regular users are capped at their allowed level.",
      ],
    },
  },
  {
    id: "duplicate-task-identifier",
    name: "Duplicate Task Identifier",
    points: 50,
    vulnerability: "Duplicate task IDs",
    background:
      "Schedulers track tasks by a unique identifier. insert_task() appends blindly, so an attacker can insert a second task with an existing id — impersonating a real task or corrupting update/remove operations.",
    task: "Fix insert_task() so inserting a task whose id already exists raises DuplicateTaskError and leaves the queue unchanged. Unique task ids still insert normally.",
    hints: [
      "insert_task() appends without checking existing ids. What if that task_id is already present?",
      "Scan the heap for a task with the same task_id before inserting.",
      "If one exists, raise DuplicateTaskError before appending.",
    ],
    language: "python",
    file: "challenge4_duplicate_task_identifier.py",
    testCommand: "pytest tests/test_challenge4.py -v",
    lessonAnchor: "pattern-4",
    starterCode: String.raw`class DuplicateTaskError(Exception):
    pass


class Task:
    def __init__(self, task_id, priority):
        self.task_id = task_id
        self.priority = priority


class PriorityQueue:
    def __init__(self):
        self.heap = []


def insert_task(queue, task):
    queue.heap.append(task)`,
    tests: String.raw`def test_unique_task_inserted():
    q = chal.PriorityQueue()
    chal.insert_task(q, chal.Task("backup", 5))
    assert len(q.heap) == 1

def test_duplicate_rejected():
    q = chal.PriorityQueue()
    chal.insert_task(q, chal.Task("backup", 5))
    with raises(chal.DuplicateTaskError):
        chal.insert_task(q, chal.Task("backup", 1))

def test_duplicate_not_inserted():
    q = chal.PriorityQueue()
    chal.insert_task(q, chal.Task("backup", 5))
    try:
        chal.insert_task(q, chal.Task("backup", 1))
    except chal.DuplicateTaskError:
        pass
    assert len(q.heap) == 1`,
    solution: {
      code: String.raw`def insert_task(queue, task):
    for existing in queue.heap:
        if existing.task_id == task.task_id:
            raise DuplicateTaskError(task.task_id)
    queue.heap.append(task)`,
      explanation: [
        "The bug: insert_task() appends every task, so a repeated task_id creates a duplicate that confuses later lookups and updates.",
        "The fix: scan the heap for the id first; if it's already present, raise DuplicateTaskError.",
        "Only genuinely new ids get inserted, keeping identifiers unique.",
      ],
    },
  },
  {
    id: "heap-poisoning",
    name: "Heap Poisoning",
    points: 60,
    vulnerability: "Untrusted task injection",
    background:
      "A trusted priority queue should hold only trusted tasks. insert_task() accepts any object, so an attacker can inject an untrusted task that then runs alongside — and ahead of — legitimate work.",
    task: "Fix insert_task() so it only accepts a task carrying the genuine VALID marker; anything else raises InvalidTaskError and never enters the heap. Trusted tasks still insert normally.",
    hints: [
      "Every real task sets self.marker = VALID. Is that checked before insertion?",
      "Read it defensively with getattr(task, \"marker\", None).",
      "If it isn't VALID, raise InvalidTaskError before appending.",
    ],
    language: "python",
    file: "challenge5_heap_poisoning.py",
    testCommand: "pytest tests/test_challenge5.py -v",
    lessonAnchor: "pattern-4",
    starterCode: String.raw`VALID = "VALID"


class InvalidTaskError(Exception):
    pass


class Task:
    def __init__(self, task_id, priority):
        self.task_id = task_id
        self.priority = priority
        self.marker = VALID


class PriorityQueue:
    def __init__(self):
        self.heap = []


def insert_task(queue, task):
    queue.heap.append(task)`,
    tests: String.raw`def test_trusted_task_inserted():
    q = chal.PriorityQueue()
    chal.insert_task(q, chal.Task("backup", 5))
    assert len(q.heap) == 1

def test_untrusted_task_rejected():
    q = chal.PriorityQueue()
    class Fake:
        def __init__(self):
            self.task_id = "evil"; self.priority = 1; self.marker = "EVIL"
    with raises(chal.InvalidTaskError):
        chal.insert_task(q, Fake())

def test_untrusted_task_not_inserted():
    q = chal.PriorityQueue()
    class Fake:
        def __init__(self):
            self.task_id = "evil"; self.priority = 1; self.marker = "EVIL"
    try:
        chal.insert_task(q, Fake())
    except chal.InvalidTaskError:
        pass
    assert len(q.heap) == 0`,
    solution: {
      code: String.raw`def insert_task(queue, task):
    if getattr(task, "marker", None) != VALID:
        raise InvalidTaskError("Untrusted task rejected.")
    queue.heap.append(task)`,
      explanation: [
        "The bug: insert_task() adds any object to the heap without confirming it's a trusted task.",
        "The fix: check getattr(task, \"marker\", None) == VALID before appending.",
        "Anything else raises InvalidTaskError and is kept out of the queue entirely.",
      ],
    },
  },
  {
    id: "heap-dos",
    name: "Heap Exhaustion (DoS)",
    points: 55,
    vulnerability: "Unbounded task insertion",
    background:
      "The queue accepts unlimited tasks. An attacker can flood it with work until memory runs out or legitimate tasks are delayed forever — a denial of service.",
    task: "Fix insert_task() to enforce MAX_CAPACITY: once the queue is full, further inserts raise QueueFullError and the queue never grows past its limit. Inserts up to the limit still work.",
    hints: [
      "insert_task() appends with no ceiling. What stops an attacker from inserting forever?",
      "Compare the current heap length against MAX_CAPACITY before appending.",
      "If it's already at the limit, raise QueueFullError instead of appending.",
    ],
    language: "python",
    file: "challenge6_heap_dos.py",
    testCommand: "pytest tests/test_challenge6.py -v",
    lessonAnchor: "pattern-5",
    starterCode: String.raw`MAX_CAPACITY = 10


class QueueFullError(Exception):
    pass


class Task:
    def __init__(self, task_id, priority):
        self.task_id = task_id
        self.priority = priority


class PriorityQueue:
    def __init__(self):
        self.heap = []


def insert_task(queue, task):
    queue.heap.append(task)`,
    tests: String.raw`def test_insert_up_to_capacity():
    q = chal.PriorityQueue()
    for i in range(chal.MAX_CAPACITY):
        chal.insert_task(q, chal.Task("t" + str(i), i))
    assert len(q.heap) == chal.MAX_CAPACITY

def test_overflow_rejected():
    q = chal.PriorityQueue()
    for i in range(chal.MAX_CAPACITY):
        chal.insert_task(q, chal.Task("t" + str(i), i))
    with raises(chal.QueueFullError):
        chal.insert_task(q, chal.Task("extra", 1))

def test_flood_is_capped():
    q = chal.PriorityQueue()
    try:
        for i in range(100):
            chal.insert_task(q, chal.Task("a" + str(i), i))
    except chal.QueueFullError:
        pass
    assert len(q.heap) == chal.MAX_CAPACITY`,
    solution: {
      code: String.raw`def insert_task(queue, task):
    if len(queue.heap) >= MAX_CAPACITY:
        raise QueueFullError("Priority queue is full.")
    queue.heap.append(task)`,
      explanation: [
        "The bug: insert_task() appends with no bound, so a flood of tasks exhausts memory and starves real work.",
        "The fix: before appending, check whether the heap already holds MAX_CAPACITY tasks.",
        "If so, raise QueueFullError; the queue is capped and the flood is rejected.",
      ],
    },
  },
  {
    id: "heap-metadata-leakage",
    name: "Scheduler Metadata Leakage",
    points: 50,
    vulnerability: "Internal scheduler token exposed",
    background:
      "Each task carries an internal scheduler_token the system uses but users should never see. peek_task() returns the whole Task object, handing that secret token to anyone who looks.",
    task: "Fix peek_task() so it returns only the public fields (task_id and priority) of the top task, never the scheduler_token or the raw object.",
    hints: [
      "peek_task() returns queue.heap[0] — the entire Task, including its internal token.",
      "Return just the public fields instead of the object.",
      "Return {\"task_id\": t.task_id, \"priority\": t.priority} for the top task.",
    ],
    language: "python",
    file: "challenge7_metadata_leakage.py",
    testCommand: "pytest tests/test_challenge7.py -v",
    lessonAnchor: "pattern-6",
    starterCode: String.raw`class Task:
    def __init__(self, task_id, priority):
        self.task_id = task_id
        self.priority = priority
        self.scheduler_token = "SECRET-TOKEN"


class PriorityQueue:
    def __init__(self):
        self.heap = []


def peek_task(queue):
    return queue.heap[0]`,
    tests: String.raw`def build_queue():
    q = chal.PriorityQueue()
    q.heap.append(chal.Task("Backup", 1))
    q.heap.append(chal.Task("Updates", 5))
    return q

def test_peek_returns_public_info():
    t = chal.peek_task(build_queue())
    assert t["task_id"] == "Backup"
    assert t["priority"] == 1

def test_token_field_not_present():
    t = chal.peek_task(build_queue())
    assert "scheduler_token" not in t

def test_attacker_cannot_recover_token():
    leaked = str(chal.peek_task(build_queue()))
    assert "SECRET-TOKEN" not in leaked, "Scheduler token leaked through peek"`,
    solution: {
      code: String.raw`def peek_task(queue):
    top = queue.heap[0]
    return {"task_id": top.task_id, "priority": top.priority}`,
      explanation: [
        "The bug: peek_task() returns the full Task object, exposing its internal scheduler_token to the caller.",
        "The fix: return a small dict with only the public fields — task_id and priority.",
        "Users see what they need; the internal token never leaves the scheduler.",
      ],
    },
  },
  {
    id: "heap-property-tampering",
    name: "Heap Property Tampering",
    points: 75,
    vulnerability: "Heap invariant not restored",
    background:
      "A priority queue works only if the heap invariant holds — the highest-priority task is always at the front (here, the lowest priority number). update_priority() changes a task's priority but never re-sorts, so the queue starts handing out tasks in the wrong order.",
    task: "Fix update_priority() so that after changing a task's priority it restores the heap property (there's a restore_heap() helper). The update still changes the priority, and the front of the heap must always be the highest-priority task.",
    hints: [
      "update_priority() sets the new priority but leaves the heap in whatever order it was. Is the front still the highest priority?",
      "Any change to a priority can violate the heap invariant, so the heap must be fixed up afterward.",
      "There's a restore_heap(queue) helper — call it after updating the priority.",
    ],
    language: "python",
    file: "challenge8_heap_property_tampering.py",
    testCommand: "pytest tests/test_challenge8.py -v",
    lessonAnchor: "pattern-6",
    starterCode: String.raw`class Task:
    def __init__(self, task_id, priority):
        self.task_id = task_id
        self.priority = priority


class PriorityQueue:
    def __init__(self):
        self.heap = []


def restore_heap(queue):
    queue.heap.sort(key=lambda task: task.priority)


def update_priority(queue, task_id, new_priority):
    for task in queue.heap:
        if task.task_id == task_id:
            task.priority = new_priority
            return`,
    tests: String.raw`def build_queue():
    q = chal.PriorityQueue()
    q.heap.append(chal.Task("Backup", 1))
    q.heap.append(chal.Task("Updates", 3))
    q.heap.append(chal.Task("Logs", 5))
    chal.restore_heap(q)
    return q

def test_update_changes_priority():
    q = build_queue()
    chal.update_priority(q, "Logs", 2)
    logs = [t for t in q.heap if t.task_id == "Logs"][0]
    assert logs.priority == 2

def test_heap_property_restored():
    q = build_queue()
    chal.update_priority(q, "Logs", 0)
    assert q.heap[0].task_id == "Logs", "Heap not restored — the front is not the highest-priority task"

def test_heap_stays_sorted():
    q = build_queue()
    chal.update_priority(q, "Backup", 9)
    priorities = [t.priority for t in q.heap]
    assert priorities == sorted(priorities), "Heap property broken after the update"`,
    solution: {
      code: String.raw`def update_priority(queue, task_id, new_priority):
    for task in queue.heap:
        if task.task_id == task_id:
            task.priority = new_priority
            restore_heap(queue)     # fix up the heap after changing a priority
            return`,
      explanation: [
        "The bug: update_priority() changes a task's priority but never re-establishes the heap order, so the front is no longer guaranteed to be the highest priority.",
        "The fix: after setting the new priority, call restore_heap(queue) to re-sort.",
        "Now every priority change keeps the invariant, and the queue always serves the highest-priority task first.",
      ],
    },
  },
];
