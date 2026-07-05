import type { Challenge } from "./modules";

// The 8 Queue Security & Privacy challenges, adapted into our data model —
// same shape as the Stack module. Starter code is the vulnerable version with
// the giveaway comments stripped; solutions are revealed only on request.

export const queueChallenges: Challenge[] = [
  {
    id: "queue-overflow",
    name: "Queue Overflow",
    points: 75,
    vulnerability: "Buffer overflow → adjacent memory corruption",
    background:
      "Many embedded systems and network devices back a queue with a fixed block of memory. Right after this queue sits an “admin” flag. enqueue() writes a new item before checking whether the queue is full, so once it fills up, extra writes spill past the buffer and overwrite that flag.",
    task: "Make enqueue() safe: if the queue is already full, reject the write with a QueueOverflowError before touching memory, so the adjacent admin flag can never be overwritten. Normal enqueue/dequeue must still work.",
    hints: [
      "Look at the order of operations in enqueue(): does it ever check whether there is room before it writes?",
      "The queue holds QUEUE_SIZE items. Compare queue.size against that limit at the very top of the function.",
      "If it is full, raise QueueOverflowError before the write line runs — validate first, write second.",
    ],
    language: "python",
    file: "challenge1_queue_overflow.py",
    testCommand: "pytest tests/test_challenge1.py -v",
    lessonAnchor: "pattern-1",
    starterCode: String.raw`QUEUE_SIZE = 8
ADMIN_FLAG_INDEX = QUEUE_SIZE
MEMORY_SIZE = QUEUE_SIZE + 1

USER_MODE = 0
ADMIN_MODE = 1


class QueueOverflowError(Exception):
    pass


class Queue:
    def __init__(self, memory, base):
        self.memory = memory
        self.base = base
        self.head = 0
        self.tail = 0
        self.size = 0


def create_queue(memory, base=0):
    return Queue(memory, base)


def enqueue(queue, value):
    queue.memory[queue.base + queue.tail] = value
    queue.tail += 1
    queue.size += 1
    if queue.tail >= QUEUE_SIZE:
        queue.tail = QUEUE_SIZE


def dequeue(queue):
    if queue.size == 0:
        raise IndexError("Queue is empty.")
    value = queue.memory[queue.base + queue.head]
    queue.memory[queue.base + queue.head] = None
    queue.head += 1
    queue.size -= 1
    return value`,
    tests: String.raw`def make_memory():
    m = [None] * chal.MEMORY_SIZE
    m[chal.ADMIN_FLAG_INDEX] = chal.USER_MODE
    return m

def test_normal_enqueue_still_works():
    m = make_memory(); q = chal.create_queue(m)
    chal.enqueue(q, 10); chal.enqueue(q, 20); chal.enqueue(q, 30)
    assert q.size == 3
    assert m[0] == 10 and m[1] == 20 and m[2] == 30
    assert m[chal.ADMIN_FLAG_INDEX] == chal.USER_MODE

def test_queue_exactly_at_capacity_is_allowed():
    m = make_memory(); q = chal.create_queue(m)
    for i in range(chal.QUEUE_SIZE):
        chal.enqueue(q, i)
    assert q.size == chal.QUEUE_SIZE
    assert m[chal.ADMIN_FLAG_INDEX] == chal.USER_MODE

def test_overflow_is_rejected():
    m = make_memory(); q = chal.create_queue(m)
    for i in range(chal.QUEUE_SIZE):
        chal.enqueue(q, i)
    with raises(chal.QueueOverflowError):
        chal.enqueue(q, 999)

def test_exploit_does_not_overwrite_admin_flag():
    m = make_memory(); q = chal.create_queue(m)
    try:
        for _ in range(chal.QUEUE_SIZE + 5):
            chal.enqueue(q, 0x41)
    except chal.QueueOverflowError:
        pass
    assert m[chal.ADMIN_FLAG_INDEX] == chal.USER_MODE, "Admin flag was overwritten by overflow"`,
    solution: {
      code: String.raw`def enqueue(queue, value):
    if queue.size >= QUEUE_SIZE:          # check capacity FIRST
        raise QueueOverflowError("Queue is full.")
    queue.memory[queue.base + queue.tail] = value
    queue.tail += 1
    queue.size += 1`,
      explanation: [
        "The bug: enqueue() writes the value into memory before checking whether the queue is full, so the 9th write lands on the admin flag sitting right after the buffer.",
        "The fix is a single guard at the top: if queue.size is already QUEUE_SIZE, raise QueueOverflowError and return before writing anything.",
        "Because the check runs first, an over-full enqueue is rejected and no memory past the buffer is ever touched.",
      ],
    },
  },
  {
    id: "queue-stale-secrets",
    name: "Stale Secrets in a Queue",
    points: 50,
    vulnerability: "Secrets surviving after dequeue()",
    background:
      "Dequeuing usually just advances the head pointer — the old value stays sitting in the backing array. If that value was a password or token, someone who later reads the queue's memory can recover it.",
    task: "Fix dequeue() so that after an item is removed, its old slot can no longer be read back from queue.memory. FIFO order and the empty-queue error must still work.",
    hints: [
      "dequeue() reads the value and moves the head pointer — but does the slot it left behind still contain the secret?",
      "You return the value to the caller; the problem is the copy left in queue.memory.",
      "Overwrite queue.memory[queue.head] with None before advancing the head.",
    ],
    language: "python",
    file: "challenge2_stale_secrets.py",
    testCommand: "pytest tests/test_challenge2.py -v",
    lessonAnchor: "pattern-2",
    starterCode: String.raw`QUEUE_SIZE = 8


class QueueEmptyError(Exception):
    pass


class Queue:
    def __init__(self):
        self.memory = [None] * QUEUE_SIZE
        self.head = 0
        self.tail = 0
        self.size = 0


def enqueue(queue, value):
    if queue.size >= QUEUE_SIZE:
        raise OverflowError("Queue full.")
    queue.memory[queue.tail] = value
    queue.tail = (queue.tail + 1) % QUEUE_SIZE
    queue.size += 1


def dequeue(queue):
    if queue.size == 0:
        raise QueueEmptyError("Queue is empty.")
    value = queue.memory[queue.head]
    queue.head = (queue.head + 1) % QUEUE_SIZE
    queue.size -= 1
    return value`,
    tests: String.raw`def test_normal_fifo_behavior_still_works():
    q = chal.Queue()
    chal.enqueue(q, "A"); chal.enqueue(q, "B"); chal.enqueue(q, "C")
    assert chal.dequeue(q) == "A"
    assert chal.dequeue(q) == "B"
    assert chal.dequeue(q) == "C"

def test_dequeue_from_empty_queue_raises():
    q = chal.Queue()
    with raises(chal.QueueEmptyError):
        chal.dequeue(q)

def test_dequeued_slot_is_erased():
    q = chal.Queue()
    secret = "TOP_SECRET_TOKEN"
    chal.enqueue(q, secret)
    assert chal.dequeue(q) == secret
    assert q.memory[0] is None, "Dequeued secret remained in memory"

def test_multiple_secrets_are_securely_erased():
    q = chal.Queue()
    secrets = ["PASSWORD", "JWT_TOKEN", "API_KEY"]
    for s in secrets:
        chal.enqueue(q, s)
    for _ in secrets:
        chal.dequeue(q)
    for slot in q.memory[:len(secrets)]:
        assert slot is None, "Sensitive data remained after dequeue()"`,
    solution: {
      code: String.raw`def dequeue(queue):
    if queue.size == 0:
        raise QueueEmptyError("Queue is empty.")
    value = queue.memory[queue.head]
    queue.memory[queue.head] = None       # wipe the slot before moving on
    queue.head = (queue.head + 1) % QUEUE_SIZE
    queue.size -= 1
    return value`,
      explanation: [
        "The bug: dequeue() advances the head pointer but leaves the real value sitting in queue.memory, where it can be read later.",
        "The fix: overwrite queue.memory[queue.head] with None right after reading the value and before moving the head.",
        "You still return the value to the caller — you just make sure the copy left in memory is gone.",
      ],
    },
  },
  {
    id: "priority-bypass",
    name: "Priority Queue Bypass",
    points: 75,
    vulnerability: "Unauthorized priority escalation",
    background:
      "Priority queues run urgent work before normal work. Here enqueue() trusts a caller-supplied priority value, so any user can mark their job HIGH and jump ahead of — or starve — everyone else's work.",
    task: "Fix enqueue() so only trusted callers may enqueue HIGH-priority work; an untrusted caller requesting HIGH must raise AuthorizationError. LOW-priority messages, and trusted HIGH ones, must still work.",
    hints: [
      "The function already receives a `trusted` flag — is it ever actually checked before honoring a HIGH request?",
      "The dangerous combination is priority == HIGH together with trusted being False.",
      "Guard that case at the top: raise AuthorizationError when a HIGH request comes from an untrusted caller.",
    ],
    language: "python",
    file: "challenge3_priority_bypass.py",
    testCommand: "pytest tests/test_challenge3.py -v",
    lessonAnchor: "pattern-3",
    starterCode: String.raw`LOW = 0
HIGH = 1


class AuthorizationError(Exception):
    pass


class PriorityQueue:
    def __init__(self):
        self.high_queue = []
        self.low_queue = []


def enqueue(queue, message, priority=LOW, trusted=False):
    if priority == HIGH:
        queue.high_queue.append(message)
    else:
        queue.low_queue.append(message)


def dequeue(queue):
    if queue.high_queue:
        return queue.high_queue.pop(0)
    if queue.low_queue:
        return queue.low_queue.pop(0)
    raise IndexError("Queue empty.")`,
    tests: String.raw`def test_normal_low_priority_enqueue_still_works():
    q = chal.PriorityQueue()
    chal.enqueue(q, "Email customer", priority=chal.LOW)
    assert chal.dequeue(q) == "Email customer"

def test_trusted_high_priority_enqueue_is_allowed():
    q = chal.PriorityQueue()
    chal.enqueue(q, "Emergency Patch", priority=chal.HIGH, trusted=True)
    assert chal.dequeue(q) == "Emergency Patch"

def test_untrusted_high_priority_is_rejected():
    q = chal.PriorityQueue()
    with raises(chal.AuthorizationError):
        chal.enqueue(q, "Delete Database", priority=chal.HIGH, trusted=False)

def test_exploit_cannot_jump_to_front_of_queue():
    q = chal.PriorityQueue()
    chal.enqueue(q, "Daily Backup", priority=chal.LOW)
    try:
        chal.enqueue(q, "Erase Customer Records", priority=chal.HIGH, trusted=False)
    except chal.AuthorizationError:
        pass
    assert chal.dequeue(q) == "Daily Backup", "Untrusted HIGH request jumped the queue"`,
    solution: {
      code: String.raw`def enqueue(queue, message, priority=LOW, trusted=False):
    if priority == HIGH and not trusted:
        raise AuthorizationError("Only trusted callers may enqueue HIGH priority.")
    if priority == HIGH:
        queue.high_queue.append(message)
    else:
        queue.low_queue.append(message)`,
      explanation: [
        "The bug: enqueue() honors whatever priority the caller passes, ignoring the trusted flag entirely.",
        "The fix: before placing a HIGH-priority message, check that trusted is True; if not, raise AuthorizationError.",
        "LOW messages and trusted HIGH messages fall through unchanged, so legitimate work is unaffected.",
      ],
    },
  },
  {
    id: "replay-queue",
    name: "Replay Queue",
    points: 60,
    vulnerability: "Replay / double-processing",
    background:
      "Queues often process a request exactly once — a bank transfer, a payment. Here process_next() reads the front request but never removes it, so calling it again re-runs the same action.",
    task: "Fix process_next() so each request is processed exactly once and can't be replayed — re-processing must not run the same action again. FIFO order must be preserved.",
    hints: [
      "process_next() looks at queue.queue[0]. Does it ever actually take that item out of the queue?",
      "Peeking at the front (queue[0]) leaves it in place; you need to remove it.",
      "Use the queue's own remove-from-front operation (popleft) so the processed request is gone for good.",
    ],
    language: "python",
    file: "challenge4_replay_queue.py",
    testCommand: "pytest tests/test_challenge4.py -v",
    lessonAnchor: "pattern-4",
    starterCode: String.raw`from collections import deque


class EmptyQueueError(Exception):
    pass


class ReplayQueue:
    def __init__(self):
        self.queue = deque()
        self.processed = set()


def enqueue(queue, request):
    queue.queue.append(request)


def process_next(queue):
    if not queue.queue:
        raise EmptyQueueError()
    request = queue.queue[0]
    queue.processed.add(request["id"])
    return request`,
    tests: String.raw`def test_normal_processing_still_works():
    q = chal.ReplayQueue()
    chal.enqueue(q, {"id": 1, "action": "Send Email"})
    chal.enqueue(q, {"id": 2, "action": "Generate Report"})
    assert chal.process_next(q)["id"] == 1
    assert chal.process_next(q)["id"] == 2

def test_processing_empty_queue_raises():
    q = chal.ReplayQueue()
    with raises(chal.EmptyQueueError):
        chal.process_next(q)

def test_processed_request_is_removed():
    q = chal.ReplayQueue()
    chal.enqueue(q, {"id": 100, "action": "Backup Database"})
    chal.process_next(q)
    assert len(q.queue) == 0, "Processed request remained in the queue"

def test_replay_attack_is_prevented():
    q = chal.ReplayQueue()
    chal.enqueue(q, {"id": 7, "action": "Transfer $100"})
    chal.process_next(q)
    with raises(chal.EmptyQueueError):
        chal.process_next(q)`,
    solution: {
      code: String.raw`def process_next(queue):
    if not queue.queue:
        raise EmptyQueueError()
    request = queue.queue.popleft()       # remove it, don't just peek
    queue.processed.add(request["id"])
    return request`,
      explanation: [
        "The bug: process_next() reads queue.queue[0] (a peek) but never removes it, so the same request stays at the front and runs again on the next call.",
        "The fix: use queue.queue.popleft() to actually take the request off the front as you process it.",
        "Now each request is consumed exactly once, and replaying it is impossible — the second call finds an empty queue.",
      ],
    },
  },
  {
    id: "queue-poisoning",
    name: "Queue Poisoning",
    points: 60,
    vulnerability: "Unvalidated / malicious messages",
    background:
      "Services pass work to each other through message queues. Here enqueue() accepts any object, so an attacker can slip in malformed or unauthorized message types that later crash consumers or trigger privileged actions.",
    task: "Fix enqueue() so it validates every message before storing it: it must be a dict with 'type' and 'payload', and the type must be in ALLOWED_TYPES. Anything else raises InvalidMessageError and never enters the queue.",
    hints: [
      "enqueue() appends whatever it's given. What could go wrong if the message isn't even the right shape?",
      "Check three things before appending: it's a dict, it has 'type' and 'payload', and its type is allowed.",
      "There's an ALLOWED_TYPES set already — reject with InvalidMessageError when the message fails any check, before the append.",
    ],
    language: "python",
    file: "challenge5_queue_poisoning.py",
    testCommand: "pytest tests/test_challenge5.py -v",
    lessonAnchor: "pattern-5",
    starterCode: String.raw`from collections import deque


ALLOWED_TYPES = {"email", "backup", "report"}


class InvalidMessageError(Exception):
    pass


class MessageQueue:
    def __init__(self):
        self.queue = deque()


def enqueue(queue, message):
    queue.queue.append(message)


def process_next(queue):
    if not queue.queue:
        raise IndexError("Queue empty.")
    return queue.queue.popleft()`,
    tests: String.raw`def valid_message(msg_type="email", payload="Hello"):
    return {"type": msg_type, "payload": payload}

def test_valid_message_still_works():
    q = chal.MessageQueue()
    msg = valid_message()
    chal.enqueue(q, msg)
    assert chal.process_next(q) == msg

def test_processing_empty_queue_raises():
    q = chal.MessageQueue()
    with raises(IndexError):
        chal.process_next(q)

def test_invalid_message_type_is_rejected():
    q = chal.MessageQueue()
    with raises(chal.InvalidMessageError):
        chal.enqueue(q, {"type": "shutdown_server", "payload": "NOW"})

def test_malformed_message_is_rejected():
    q = chal.MessageQueue()
    with raises(chal.InvalidMessageError):
        chal.enqueue(q, {"payload": "Missing type field"})

def test_exploit_message_never_enters_queue():
    q = chal.MessageQueue()
    before = len(q.queue)
    try:
        chal.enqueue(q, {"type": "shutdown_server", "payload": "Delete everything"})
    except chal.InvalidMessageError:
        pass
    assert len(q.queue) == before, "Unauthorized message entered the queue"`,
    solution: {
      code: String.raw`def enqueue(queue, message):
    if not isinstance(message, dict):
        raise InvalidMessageError("Message must be a dict.")
    if "type" not in message or "payload" not in message:
        raise InvalidMessageError("Message needs 'type' and 'payload'.")
    if message["type"] not in ALLOWED_TYPES:
        raise InvalidMessageError("Unauthorized message type.")
    queue.queue.append(message)`,
      explanation: [
        "The bug: enqueue() appends any object without checking its shape or type, so malformed or unauthorized messages get stored and later processed.",
        "The fix: validate before appending — confirm it's a dict, that it has both 'type' and 'payload', and that its type is in ALLOWED_TYPES.",
        "Raise InvalidMessageError on any failure so the bad message never reaches the queue.",
      ],
    },
  },
  {
    id: "queue-dos",
    name: "Queue Exhaustion (DoS)",
    points: 60,
    vulnerability: "Unbounded queue → denial of service",
    background:
      "Queues buffer work between producers and consumers. Here enqueue() accepts unlimited jobs, so an attacker can enqueue forever until memory runs out and the service falls over.",
    task: "Fix enqueue() to enforce MAX_QUEUE_SIZE: once the queue is full, additional jobs are rejected with QueueFullError and the queue never grows past its limit. Normal enqueue up to the limit still works.",
    hints: [
      "What stops a producer from calling enqueue() a million times here?",
      "Compare the current length of the queue against MAX_QUEUE_SIZE before appending.",
      "When it's already at the limit, raise QueueFullError instead of appending.",
    ],
    language: "python",
    file: "challenge6_queue_dos.py",
    testCommand: "pytest tests/test_challenge6.py -v",
    lessonAnchor: "pattern-6",
    starterCode: String.raw`from collections import deque

MAX_QUEUE_SIZE = 10


class QueueFullError(Exception):
    pass


class WorkQueue:
    def __init__(self):
        self.queue = deque()


def enqueue(queue, job):
    queue.queue.append(job)


def dequeue(queue):
    if not queue.queue:
        raise IndexError("Queue empty.")
    return queue.queue.popleft()`,
    tests: String.raw`def test_normal_enqueue_still_works():
    q = chal.WorkQueue()
    chal.enqueue(q, "Job A"); chal.enqueue(q, "Job B"); chal.enqueue(q, "Job C")
    assert len(q.queue) == 3
    assert chal.dequeue(q) == "Job A"

def test_queue_exactly_at_capacity_is_allowed():
    q = chal.WorkQueue()
    for i in range(chal.MAX_QUEUE_SIZE):
        chal.enqueue(q, f"Job {i}")
    assert len(q.queue) == chal.MAX_QUEUE_SIZE

def test_queue_overflow_is_rejected():
    q = chal.WorkQueue()
    for i in range(chal.MAX_QUEUE_SIZE):
        chal.enqueue(q, i)
    with raises(chal.QueueFullError):
        chal.enqueue(q, "Overflow Job")

def test_dos_attack_cannot_expand_queue():
    q = chal.WorkQueue()
    for i in range(chal.MAX_QUEUE_SIZE):
        chal.enqueue(q, i)
    try:
        for i in range(100):
            chal.enqueue(q, f"Attack {i}")
    except chal.QueueFullError:
        pass
    assert len(q.queue) == chal.MAX_QUEUE_SIZE, "Queue grew beyond its maximum"`,
    solution: {
      code: String.raw`def enqueue(queue, job):
    if len(queue.queue) >= MAX_QUEUE_SIZE:
        raise QueueFullError("Queue is full.")
    queue.queue.append(job)`,
      explanation: [
        "The bug: enqueue() appends jobs with no upper bound, so a flood of requests grows the queue until memory is exhausted.",
        "The fix: before appending, check whether the queue already holds MAX_QUEUE_SIZE items.",
        "If it's full, raise QueueFullError instead of appending — the queue is capped and the flood is rejected.",
      ],
    },
  },
  {
    id: "queue-metadata-leak",
    name: "Queue Metadata Leak",
    points: 50,
    vulnerability: "Over-exposed internal metadata",
    background:
      "Monitoring dashboards often show queue contents. Here inspect_queue() returns the entire internal message object — including producer IPs, internal IDs, and auth tokens — to anyone who looks.",
    task: "Fix inspect_queue() so it returns only the safe 'message' field for each item, never the internal metadata (producer_ip, auth_token, internal_id). FIFO order stays the same and the queue itself is not modified.",
    hints: [
      "inspect_queue() hands back the raw stored dicts. Which fields in those dicts should a viewer never see?",
      "Build a new list containing only the safe field for each item, instead of returning the internal objects.",
      "For each stored item, return something like {\"message\": item[\"message\"]} — and nothing else.",
    ],
    language: "python",
    file: "challenge7_queue_metadata_leak.py",
    testCommand: "pytest tests/test_challenge7.py -v",
    lessonAnchor: "pattern-6",
    starterCode: String.raw`from collections import deque


class MessageQueue:
    def __init__(self):
        self.queue = deque()


def enqueue(queue, message, producer_ip, auth_token):
    queue.queue.append({
        "message": message,
        "producer_ip": producer_ip,
        "auth_token": auth_token,
        "internal_id": len(queue.queue) + 1,
    })


def inspect_queue(queue):
    return list(queue.queue)`,
    tests: String.raw`def test_queue_inspection_still_returns_messages():
    q = chal.MessageQueue()
    chal.enqueue(q, message="Email Alice", producer_ip="10.0.0.1", auth_token="SECRET1")
    result = chal.inspect_queue(q)
    assert len(result) == 1
    assert result[0]["message"] == "Email Alice"

def test_inspecting_empty_queue_returns_empty_list():
    q = chal.MessageQueue()
    assert chal.inspect_queue(q) == []

def test_sensitive_metadata_is_not_exposed():
    q = chal.MessageQueue()
    chal.enqueue(q, message="Reset Password", producer_ip="192.168.1.10", auth_token="TOP_SECRET")
    item = chal.inspect_queue(q)[0]
    assert "producer_ip" not in item
    assert "auth_token" not in item
    assert "internal_id" not in item

def test_attacker_cannot_recover_internal_metadata():
    q = chal.MessageQueue()
    chal.enqueue(q, message="Transfer Funds", producer_ip="172.16.1.20", auth_token="MASTER_API_KEY")
    leaked = str(chal.inspect_queue(q))
    assert "MASTER_API_KEY" not in leaked, "Auth token leaked through inspection"
    assert "172.16.1.20" not in leaked, "Producer IP leaked through inspection"`,
    solution: {
      code: String.raw`def inspect_queue(queue):
    return [{"message": item["message"]} for item in queue.queue]`,
      explanation: [
        "The bug: inspect_queue() returns the raw stored dictionaries, exposing producer_ip, auth_token, and internal_id to whoever inspects the queue.",
        "The fix: build a new list that copies only the safe 'message' field from each item.",
        "The internal metadata never leaves the queue, and the FIFO order and stored data are untouched.",
      ],
    },
  },
  {
    id: "queue-race-condition",
    name: "Queue Race Condition",
    points: 75,
    vulnerability: "Unsynchronized concurrent access",
    background:
      "When several threads share one queue, enqueue() and dequeue() can run at the same time. Without synchronization the size counter and the queue contents drift apart — lost messages, duplicate processing, corrupted state.",
    task: "Fix enqueue() and dequeue() so all access to the queue happens under the provided self.lock, keeping the size counter and contents consistent. FIFO order and the empty-queue error must still work.",
    hints: [
      "The ConcurrentQueue already creates a self.lock in __init__ — is it ever actually used?",
      "Both enqueue() and dequeue() modify shared state (the deque and the size counter) and must not run at the same time.",
      "Wrap the body of each with `with queue.lock:` so only one thread touches the queue at a time.",
    ],
    language: "python",
    file: "challenge8_queue_race_condition.py",
    testCommand: "pytest tests/test_challenge8.py -v",
    lessonAnchor: "pattern-6",
    starterCode: String.raw`from collections import deque
import threading


class ConcurrentQueue:
    def __init__(self):
        self.queue = deque()
        self.size = 0
        self.lock = threading.Lock()


def enqueue(queue, message):
    queue.queue.append(message)
    queue.size += 1


def dequeue(queue):
    if queue.size == 0:
        raise IndexError("Queue empty.")
    message = queue.queue.popleft()
    queue.size -= 1
    return message`,
    tests: String.raw`def test_normal_enqueue_dequeue_still_works():
    q = chal.ConcurrentQueue()
    chal.enqueue(q, 1); chal.enqueue(q, 2); chal.enqueue(q, 3)
    assert chal.dequeue(q) == 1
    assert chal.dequeue(q) == 2
    assert chal.dequeue(q) == 3

def test_dequeue_empty_queue_raises():
    q = chal.ConcurrentQueue()
    with raises(IndexError):
        chal.dequeue(q)

def test_size_matches_length():
    q = chal.ConcurrentQueue()
    for i in range(20):
        chal.enqueue(q, i)
    for _ in range(8):
        chal.dequeue(q)
    assert q.size == len(q.queue)

def test_enqueue_and_dequeue_acquire_the_lock():
    q = chal.ConcurrentQueue()
    counter = {"n": 0}
    real = q.lock
    class Tracked:
        def __enter__(self):
            counter["n"] += 1
            return real.__enter__()
        def __exit__(self, *a):
            return real.__exit__(*a)
        def acquire(self, *a, **k):
            counter["n"] += 1
            return real.acquire(*a, **k)
        def release(self):
            return real.release()
    q.lock = Tracked()
    chal.enqueue(q, 1)
    chal.dequeue(q)
    assert counter["n"] >= 2, "enqueue() and dequeue() must run under self.lock"`,
    solution: {
      code: String.raw`def enqueue(queue, message):
    with queue.lock:
        queue.queue.append(message)
        queue.size += 1


def dequeue(queue):
    with queue.lock:
        if queue.size == 0:
            raise IndexError("Queue empty.")
        message = queue.queue.popleft()
        queue.size -= 1
        return message`,
      explanation: [
        "The bug: enqueue() and dequeue() modify the shared deque and size counter without synchronization, so two threads can interleave and leave the queue inconsistent.",
        "The fix: wrap the body of each function in `with queue.lock:` so only one thread can modify the queue at a time.",
        "The lock guarantees the append/pop and the size update happen together as one atomic step, keeping size == len(queue).",
      ],
    },
  },
];
