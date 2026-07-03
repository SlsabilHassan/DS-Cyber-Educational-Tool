import type { Challenge } from "./modules";

// The 8 Stack Security & Privacy challenges, adapted into our own data model.
// Backgrounds/tasks are the challenge briefs; `starterCode` is the vulnerable
// code the student fixes. Solutions are intentionally NOT included here — the
// fix is the exercise.

export const stackChallenges: Challenge[] = [
  {
    id: "stack-overflow",
    name: "Stop the Stack Overflow",
    points: 75,
    vulnerability: "Buffer overflow → control-flow hijack",
    background:
      'This simulates a stack frame: a fixed-size local buffer followed by a "return address" slot. Real C/C++ buffer overflows work exactly like this — writing past the end of a local buffer overwrites the return address and hijacks control flow. Here a plain list stands in for memory.',
    task: "Make push_frame() safe: input that can't fit in the buffer must be rejected with a BufferOverflowError, and the return-address slot must be left holding its original value. A valid, in-bounds call must still behave exactly as before.",
    hints: [
      "Picture the buffer as a box with a fixed number of slots, and the return address sitting in the very next slot after it. What happens if you keep writing past the last slot of the box?",
      "The size of the box (BUFFER_SIZE) is known ahead of time. Compare it against how much the caller is trying to write.",
      "Order matters: a safe function decides whether the write is allowed BEFORE it touches memory — not after it has already started copying.",
    ],
    language: "python",
    file: "challenge1_stack_overflow.py",
    testCommand: "pytest tests/test_challenge1.py -v",
    lessonAnchor: "pattern-1",
    solution: {
      code: String.raw`def push_frame(memory, base_addr, user_input, return_target):
    if len(user_input) > BUFFER_SIZE:          # 1. check the size FIRST
        raise BufferOverflowError("input too big")
    memory[base_addr + BUFFER_SIZE] = return_target
    for i, value in enumerate(user_input):
        memory[base_addr + i] = value
    return memory[base_addr + BUFFER_SIZE]`,
      explanation: [
        "The bug: the function copies the input in without ever checking its length, so a long input writes past the 8-slot buffer and into the return-address slot.",
        "The fix is a single guard at the very top: if the input is longer than BUFFER_SIZE, raise BufferOverflowError before touching memory.",
        "Because the check happens first, an oversized input is rejected and nothing gets written — so the return address can never be reached.",
      ],
    },
    starterCode: String.raw`MEMORY_SIZE = 32
BUFFER_SIZE = 8

SAFE_RETURN = "RETURN_TO_CALLER"
ADMIN_FUNCTION = "RETURN_TO_ADMIN_PANEL"


class BufferOverflowError(Exception):
    pass


def push_frame(memory: list, base_addr: int, user_input: list, return_target: str):
    memory[base_addr + BUFFER_SIZE] = return_target

    for i, value in enumerate(user_input):
        memory[base_addr + i] = value

    return memory[base_addr + BUFFER_SIZE]`,
    tests: String.raw`def make_memory():
    return [0] * chal.MEMORY_SIZE

def test_normal_input_still_works():
    m = make_memory()
    r = chal.push_frame(m, 0, [1, 2, 3], chal.SAFE_RETURN)
    assert r == chal.SAFE_RETURN
    assert m[0:3] == [1, 2, 3]

def test_input_exactly_at_buffer_size_is_allowed():
    m = make_memory()
    full = [9] * chal.BUFFER_SIZE
    r = chal.push_frame(m, 0, full, chal.SAFE_RETURN)
    assert r == chal.SAFE_RETURN
    assert m[0:chal.BUFFER_SIZE] == full

def test_oversized_input_is_rejected():
    m = make_memory()
    over = [1] * (chal.BUFFER_SIZE + 1)
    with raises(chal.BufferOverflowError):
        chal.push_frame(m, 0, over, chal.SAFE_RETURN)

def test_exploit_does_not_hijack_return_address():
    m = make_memory()
    malicious = [0x41] * chal.BUFFER_SIZE + [chal.ADMIN_FUNCTION]
    try:
        r = chal.push_frame(m, 0, malicious, chal.SAFE_RETURN)
    except chal.BufferOverflowError:
        return
    assert r == chal.SAFE_RETURN, "Exploit succeeded: return address hijacked to " + repr(r)
    assert m[chal.BUFFER_SIZE] == chal.SAFE_RETURN

def test_bounds_check_happens_before_any_write():
    m = make_memory()
    over = [0x99] * (chal.BUFFER_SIZE + 1)
    with raises(chal.BufferOverflowError):
        chal.push_frame(m, 0, over, chal.SAFE_RETURN)
    assert all(s == 0 for s in m), "Memory was partially written before the bounds check raised"`,
  },
  {
    id: "stale-secrets",
    name: "Secrets on the Stack",
    points: 50,
    vulnerability: "Secrets surviving after pop()",
    background:
      "Popping a value off a stack usually just moves a pointer — it does not erase the underlying storage. A secret (PIN, token, password) that was pushed and popped can still be read straight out of the backing store by anyone with memory-read access (a core dump, swap file, or use-after-free read).",
    task: "After a value is popped, it must be impossible to recover it by reading raw_memory(). Normal push/pop behaviour — including the error when popping an empty stack — must still work.",
    hints: [
      "Popping returns the value and moves the 'top' pointer down — but does anything actually change in the underlying storage list?",
      "The returned value is fine to hand back. The problem is the copy that's left sitting in the array afterward.",
      "As part of popping, put something harmless into the slot you're leaving behind. There's already a value in the file meant exactly for wiping.",
    ],
    language: "python",
    file: "challenge2_stale_secrets.py",
    testCommand: "pytest tests/test_challenge2.py -v",
    lessonAnchor: "pattern-2",
    solution: {
      code: String.raw`def pop(self):
    if self._top < 0:
        raise IndexError("pop from empty stack")
    value = self._storage[self._top]
    self._storage[self._top] = SENTINEL   # wipe the slot
    self._top -= 1
    return value`,
      explanation: [
        "The bug: pop() moves the top marker down but leaves the real value sitting in self._storage, where raw_memory() can still read it.",
        "The fix: overwrite that slot with SENTINEL right before you move the marker down.",
        "You still return the value to the caller — you've only made sure the copy left behind in storage is harmless.",
      ],
    },
    starterCode: String.raw`SENTINEL = "***WIPED***"


class InsecureStack:
    def __init__(self, capacity=16):
        self._storage = [None] * capacity
        self._top = -1

    def push(self, value):
        self._top += 1
        self._storage[self._top] = value

    def pop(self):
        if self._top < 0:
            raise IndexError("pop from empty stack")
        value = self._storage[self._top]
        self._top -= 1
        return value

    def raw_memory(self):
        return self._storage`,
    tests: String.raw`def test_push_and_pop_returns_correct_value():
    s = chal.InsecureStack()
    s.push("hello")
    assert s.pop() == "hello"

def test_lifo_order_preserved():
    s = chal.InsecureStack()
    for x in ["a", "b", "c"]:
        s.push(x)
    assert s.pop() == "c"
    assert s.pop() == "b"
    assert s.pop() == "a"

def test_popped_secret_not_recoverable_from_raw_memory():
    s = chal.InsecureStack()
    s.push("4477")
    s.pop()
    leaked = [x for x in s.raw_memory() if x == "4477"]
    assert not leaked, "Popped secret is still recoverable from raw_memory()"

def test_multiple_secrets_all_wiped():
    s = chal.InsecureStack()
    for sec in ["pin-1111", "token-aaa", "password-xyz"]:
        s.push(sec)
        s.pop()
        assert sec not in s.raw_memory(), repr(sec) + " leaked in raw_memory()"

def test_pop_from_empty_stack_still_raises():
    s = chal.InsecureStack()
    with raises(IndexError):
        s.pop()`,
  },
  {
    id: "undo-leak",
    name: "The Undo-Stack Leak",
    points: 50,
    vulnerability: "Sensitive data in undo history",
    background:
      "A toy editor keeps an undo stack of full-document snapshots. If a user types something sensitive (an SSN) and then deletes it, people assume it's gone — but the raw snapshot is still sitting in the undo stack, fully recoverable.",
    task: "No snapshot stored in undo_stack may contain a raw SSN — but the text the user is currently editing must be left untouched, and normal editing and undo must still work.",
    hints: [
      "The live document looks clean after deletion, but trace what actually gets saved into history each time edit() runs.",
      "You want to clean the snapshot on its way INTO the history — without altering what the user is currently typing.",
      "There's a ready-made SSN_PATTERN in the file. A regex can not only find matches but also replace them with safe placeholder text.",
    ],
    language: "python",
    file: "challenge3_undo_leak.py",
    testCommand: "pytest tests/test_challenge3.py -v",
    lessonAnchor: "pattern-3",
    solution: {
      code: String.raw`def edit(self, new_text):
    safe = SSN_PATTERN.sub("[REDACTED-SSN]", self.text)  # clean a copy
    self.undo_stack.append(safe)
    self.text = new_text`,
      explanation: [
        "The bug: edit() pushes the previous text onto undo_stack exactly as-is, so any SSN stays in the history forever.",
        "The fix: build a redacted copy with SSN_PATTERN.sub(...) and push THAT copy, not the raw text.",
        "Notice you only clean the copy going into history — self.text (what the user is currently editing) is left untouched.",
      ],
    },
    starterCode: String.raw`import re

SSN_PATTERN = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")


class InsecureEditor:
    def __init__(self):
        self.text = ""
        self.undo_stack = []

    def edit(self, new_text: str):
        self.undo_stack.append(self.text)
        self.text = new_text

    def undo(self):
        if not self.undo_stack:
            return
        self.text = self.undo_stack.pop()`,
    tests: String.raw`def test_basic_edit_and_undo_still_works():
    e = chal.InsecureEditor()
    e.edit("hello")
    e.edit("hello world")
    e.undo()
    assert e.text == "hello"

def test_ssn_not_present_in_undo_history():
    e = chal.InsecureEditor()
    e.edit("Meeting notes:\nMy SSN is 123-45-6789, don't share it.")
    e.edit("Meeting notes:\n[redacted]")
    for snap in e.undo_stack:
        assert not chal.SSN_PATTERN.search(snap), "Raw SSN found in undo history: " + repr(snap)

def test_multiple_ssns_all_redacted():
    e = chal.InsecureEditor()
    e.edit("A: 111-11-1111")
    e.edit("A: 111-11-1111, B: 222-22-2222")
    e.edit("cleared")
    for snap in e.undo_stack:
        assert not chal.SSN_PATTERN.search(snap), "Raw SSN found in undo history: " + repr(snap)

def test_non_sensitive_content_unaffected():
    e = chal.InsecureEditor()
    e.edit("Just a normal sentence with no sensitive numbers like 12-34.")
    e.edit("next")
    assert "Just a normal sentence" in e.undo_stack[-1]

def test_current_text_field_unaffected_by_redaction():
    e = chal.InsecureEditor()
    e.edit("first version")
    e.edit("My SSN is 123-45-6789 right now")
    assert e.text == "My SSN is 123-45-6789 right now"`,
  },
  {
    id: "navstack-replay",
    name: "Back-Button Replay",
    points: 60,
    vulnerability: "Replay / double-submission",
    background:
      'A bank transfer flow is modeled as a navigation stack: enter_amount → confirm → success. If "confirm" can be re-triggered (back-button + resubmit) without checking whether that exact transfer already ran, the user gets debited twice.',
    task: "The same confirmed transfer must never be applied twice — a back-button resubmit has to be rejected with TokenAlreadyUsedError — but a genuinely new transfer must still go through and debit correctly.",
    hints: [
      "Right now, what (if anything) makes confirm_transfer() behave differently the second time it's called?",
      "You need a way to tell 'this exact transfer already happened' apart from 'this is a fresh transfer.' A marker created when the amount is entered can do that.",
      "Give each entered amount a single-use marker; 'spend' it when the transfer confirms, and refuse to confirm if it's already been spent.",
    ],
    language: "python",
    file: "challenge4_navstack.py",
    testCommand: "pytest tests/test_challenge4.py -v",
    lessonAnchor: "pattern-4",
    solution: {
      code: String.raw`# in __init__, add:  self.current_token = None
#                    self.used_tokens = set()

def enter_amount(self, amount):
    self.pending_transfer = amount
    self.current_token = str(uuid.uuid4())   # fresh one-time token
    self.go_to("enter_amount")

def confirm_transfer(self):
    self.go_to("confirm")
    if self.current_token in self.used_tokens:
        raise TokenAlreadyUsedError("already submitted")
    self.used_tokens.add(self.current_token)  # spend the token
    self.balance -= self.pending_transfer
    self.go_to("success")`,
      explanation: [
        "The bug: confirm_transfer() debits every time it's called, with no memory of whether this exact transfer already happened.",
        "The fix has two parts. When the amount is entered, mint a fresh one-time token (a uuid). On confirm, if that token is already in used_tokens, raise TokenAlreadyUsedError.",
        "Otherwise, add the token to used_tokens and do the debit. Add self.current_token and self.used_tokens = set() to __init__ so there's somewhere to track them.",
      ],
    },
    starterCode: String.raw`class TokenAlreadyUsedError(Exception):
    pass


class InsecureBankFlow:
    def __init__(self, starting_balance=1000):
        self.balance = starting_balance
        self.nav_stack = []
        self.pending_transfer = None

    def go_to(self, page: str):
        self.nav_stack.append(page)

    def go_back(self):
        if self.nav_stack:
            return self.nav_stack.pop()
        return None

    def enter_amount(self, amount: float):
        self.pending_transfer = amount
        self.go_to("enter_amount")

    def confirm_transfer(self):
        self.go_to("confirm")
        self.balance -= self.pending_transfer
        self.go_to("success")`,
    tests: String.raw`def test_single_legit_transfer_debits_correctly():
    f = chal.InsecureBankFlow(starting_balance=1000)
    f.enter_amount(200)
    f.confirm_transfer()
    assert f.balance == 800

def test_replayed_confirm_is_blocked():
    f = chal.InsecureBankFlow(starting_balance=1000)
    f.enter_amount(200)
    f.confirm_transfer()
    assert f.balance == 800
    f.go_back()
    f.go_back()
    with raises(chal.TokenAlreadyUsedError):
        f.confirm_transfer()
    assert f.balance == 800, "Balance changed on a replayed confirm!"

def test_two_separate_transfers_both_succeed():
    f = chal.InsecureBankFlow(starting_balance=1000)
    f.enter_amount(100)
    f.confirm_transfer()
    assert f.balance == 900
    f.enter_amount(50)
    f.confirm_transfer()
    assert f.balance == 850

def test_multiple_replay_attempts_all_blocked():
    f = chal.InsecureBankFlow(starting_balance=1000)
    f.enter_amount(300)
    f.confirm_transfer()
    assert f.balance == 700
    for _ in range(5):
        with raises(chal.TokenAlreadyUsedError):
            f.confirm_transfer()
    assert f.balance == 700, "Balance changed across repeated replay attempts!"`,
  },
  {
    id: "confused-deputy",
    name: "The Confused Deputy",
    points: 75,
    vulnerability: "Call-stack authorization flaw",
    background:
      'In a call chain A → B → C, fetch_report() (role C) only checks "is my immediate caller (B, the internal service) trusted?" — it never checks who originally initiated the request (A). A regular user can ride along through the trusted intermediary to read the admin report.',
    task: "fetch_report() must only return a report when the ORIGINAL user who started the request is allowed to see it — being routed through the trusted internal service must not be enough on its own. Legitimate access (admins, public reports) must still work, and it should raise AuthorizationError otherwise.",
    hints: [
      "The existing check asks 'is my immediate caller trusted?' But in an A → B → C chain, who actually started the request, and is that ever checked?",
      "The information you need is already being passed into the function — look at the parameters that currently go unused.",
      "There's a permissions table mapping each report to the roles allowed to see it. Compare the original caller's role against it before returning.",
    ],
    language: "python",
    file: "challenge5_confused_deputy.py",
    testCommand: "pytest tests/test_challenge5.py -v",
    lessonAnchor: "pattern-5",
    solution: {
      code: String.raw`def fetch_report(original_caller_role, report_name):
    immediate_caller = CALL_STACK[-1] if CALL_STACK else None
    if immediate_caller != "internal_report_service":
        raise AuthorizationError("only the internal service may fetch")
    allowed = REPORT_PERMISSIONS.get(report_name, set())
    if original_caller_role not in allowed:      # check the REAL requester
        raise AuthorizationError("not permitted")
    return REPORTS[report_name]`,
      explanation: [
        "The bug: fetch_report() only checks that its immediate caller is the trusted internal service — it never checks the original_caller_role that was threaded all the way down.",
        "The fix: look up which roles REPORT_PERMISSIONS allows for the requested report, and raise AuthorizationError unless the original caller's role is in that set.",
        "Keep the existing middleman check too — you're adding a second gate, not replacing the first.",
      ],
    },
    starterCode: String.raw`CALL_STACK = []

REPORTS = {
    "public_report": "Quarterly numbers everyone can see.",
    "admin_report": "Confidential: layoffs, salaries, security incidents.",
}

REPORT_PERMISSIONS = {
    "public_report": {"regular_user", "admin"},
    "admin_report": {"admin"},
}


class AuthorizationError(Exception):
    pass


def fetch_report(original_caller_role: str, report_name: str):
    immediate_caller = CALL_STACK[-1] if CALL_STACK else None
    if immediate_caller != "internal_report_service":
        raise AuthorizationError("Only the internal report service may fetch reports.")

    return REPORTS[report_name]


def internal_report_service(original_caller_role: str, report_name: str):
    CALL_STACK.append("internal_report_service")
    try:
        return fetch_report(original_caller_role, report_name)
    finally:
        CALL_STACK.pop()


def handle_user_request(user_role: str, report_name: str):
    CALL_STACK.append(user_role)
    try:
        return internal_report_service(user_role, report_name)
    finally:
        CALL_STACK.pop()`,
    tests: String.raw`def _reset():
    chal.CALL_STACK.clear()

def test_regular_user_can_read_public_report():
    _reset()
    assert chal.handle_user_request("regular_user", "public_report") == chal.REPORTS["public_report"]

def test_admin_can_read_admin_report():
    _reset()
    assert chal.handle_user_request("admin", "admin_report") == chal.REPORTS["admin_report"]

def test_regular_user_cannot_read_admin_report():
    _reset()
    with raises(chal.AuthorizationError):
        chal.handle_user_request("regular_user", "admin_report")

def test_admin_can_still_read_public_report():
    _reset()
    assert chal.handle_user_request("admin", "public_report") == chal.REPORTS["public_report"]

def test_unknown_role_cannot_read_admin_report():
    _reset()
    with raises(chal.AuthorizationError):
        chal.handle_user_request("guest", "admin_report")

def test_direct_call_with_wrong_immediate_caller_still_blocked():
    _reset()
    chal.CALL_STACK.append("someone_untrusted")
    with raises(chal.AuthorizationError):
        chal.fetch_report("admin", "admin_report")`,
  },
  {
    id: "recursion-dos",
    name: "Recursive Stack Exhaustion",
    points: 60,
    vulnerability: "Unbounded recursion → DoS",
    background:
      "is_balanced() checks whether parentheses are balanced by recursing once per character, with no depth limit. An attacker can send deeply nested input and crash the process with a RecursionError — a denial of service.",
    task: "is_balanced() must handle deeply nested input without ever crashing the interpreter, and reject nesting beyond MAX_DEPTH with InputTooDeepError. Normal input, and long-but-shallow input, must still return the correct answer.",
    hints: [
      "Every character currently triggers another nested call. What runs out when there are thousands of them, and what error does Python raise?",
      "You can track how deep the nesting goes without the function calling itself — keep a running count (or a list you add to and remove from) yourself.",
      "As you count opens and closes with your own list, check its size against MAX_DEPTH and stop early with the right error if it grows too far.",
    ],
    language: "python",
    file: "challenge6_recursion_dos.py",
    testCommand: "pytest tests/test_challenge6.py -v",
    lessonAnchor: "pattern-6",
    solution: {
      code: String.raw`def is_balanced(s):
    stack = []
    for char in s:
        if char == "(":
            stack.append(char)
            if len(stack) > MAX_DEPTH:
                raise InputTooDeepError("too deep")
        elif char == ")":
            if not stack:
                return False
            stack.pop()
    return len(stack) == 0`,
      explanation: [
        "The bug: the original counts brackets by calling itself once per character, so deeply nested input blows past Python's call-stack limit and crashes with RecursionError.",
        "The fix: do the counting with your own list instead of recursion — push on '(' and pop on ')'. A plain loop like this can never overflow the call stack.",
        "Enforce the limit yourself: if the list ever grows past MAX_DEPTH, raise InputTooDeepError instead of letting it run away.",
      ],
    },
    starterCode: String.raw`MAX_DEPTH = 1000


class InputTooDeepError(Exception):
    pass


def is_balanced(s: str) -> bool:
    return _check(s)


def _check(s: str, index: int = 0, depth: int = 0) -> bool:
    if index == len(s):
        return depth == 0
    char = s[index]
    if char == "(":
        return _check(s, index + 1, depth + 1)
    elif char == ")":
        if depth == 0:
            return False
        return _check(s, index + 1, depth - 1)
    else:
        return _check(s, index + 1, depth)`,
    tests: String.raw`def test_balanced_input_returns_true():
    assert chal.is_balanced("(()(()))") is True

def test_unbalanced_input_returns_false():
    assert chal.is_balanced("(()") is False
    assert chal.is_balanced(")(") is False

def test_empty_string_is_balanced():
    assert chal.is_balanced("") is True

def test_deep_input_does_not_raise_recursion_error():
    with raises(chal.InputTooDeepError):
        chal.is_balanced("(" * 5000)

def test_input_at_exactly_max_depth_is_allowed():
    s = "(" * chal.MAX_DEPTH + ")" * chal.MAX_DEPTH
    assert chal.is_balanced(s) is True

def test_input_one_over_max_depth_is_rejected():
    with raises(chal.InputTooDeepError):
        chal.is_balanced("(" * (chal.MAX_DEPTH + 1))

def test_long_but_shallow_input_is_fine():
    assert chal.is_balanced("()" * 5000) is True`,
  },
  {
    id: "traceback-leak",
    name: "Traceback & Locals Leak",
    points: 50,
    vulnerability: "Stack trace leaking secrets",
    background:
      "handle_request() catches exceptions from login() and dumps the full traceback plus local variables — including a DB connection string with credentials — straight into the response sent to the client.",
    task: "The value returned to the caller must never expose internal details — no traceback, no local variables, no secrets — only a generic message and an opaque incident id. The full details must still be recorded somewhere internal so support can look them up by that id.",
    hints: [
      "Look closely at what the current response dictionary hands back. Would you want an end user to see any of those fields?",
      "There are two different audiences here: the caller (should see almost nothing) and your internal logs (should keep everything). Split them.",
      "Generate a fresh unique id, stash the full details under it in the internal store, and return only that id plus a generic message. There's already a uuid import for the id.",
    ],
    language: "python",
    file: "challenge7_traceback_leak.py",
    testCommand: "pytest tests/test_challenge7.py -v",
    lessonAnchor: "six-patterns",
    solution: {
      code: String.raw`def handle_request(username, password):
    try:
        return login(username, password)
    except Exception:
        incident_id = str(uuid.uuid4())
        INTERNAL_LOG_STORE[incident_id] = {          # keep the details internal
            "traceback": traceback.format_exc(),
        }
        return {                                     # tell the caller almost nothing
            "error": "Internal Server Error",
            "incident_id": incident_id,
            "message": f"Something went wrong. Ref {incident_id}.",
        }`,
      explanation: [
        "The bug: on a crash the function returns the full traceback and the crashed function's local variables to the caller — including the database connection string.",
        "The fix separates two audiences. Generate a unique incident_id and store the full traceback (and any details) in INTERNAL_LOG_STORE under that id.",
        "Return only a generic message plus the incident_id to the caller — no traceback, no locals, no secrets. Support can still look up the full detail by the id.",
      ],
    },
    starterCode: String.raw`import traceback
import sys
import uuid

DB_CONNECTION_STRING = "postgresql://admin:S3cr3tPW!@internal-db:5432/prod"

INTERNAL_LOG_STORE = {}


def login(username: str, password: str):
    db_conn = DB_CONNECTION_STRING
    hashed_password = f"sha256:{hash(password)}"
    user_record = {"username": username, "role": "admin"}

    db_result = None
    return db_result.fetch_user()


def handle_request(username: str, password: str):
    try:
        return login(username, password)
    except Exception:
        tb_text = traceback.format_exc()
        tb = sys.exc_info()[2]
        while tb.tb_next:
            tb = tb.tb_next
        leaked_locals = dict(tb.tb_frame.f_locals)

        return {
            "error": "Internal Server Error",
            "traceback": tb_text,
            "locals_at_crash": {k: v for k, v in leaked_locals.items()
                                 if not k.startswith("__")},
        }`,
    tests: String.raw`def test_response_has_no_db_connection_string():
    r = chal.handle_request("alice", "hunter2")
    assert chal.DB_CONNECTION_STRING not in str(r)

def test_response_has_no_password():
    r = chal.handle_request("alice", "hunter2")
    assert "hunter2" not in str(r)

def test_response_has_no_traceback_field():
    r = chal.handle_request("alice", "hunter2")
    assert "traceback" not in r
    assert "locals_at_crash" not in r

def test_response_contains_generic_error_and_incident_id():
    r = chal.handle_request("alice", "hunter2")
    assert "error" in r and "incident_id" in r and "message" in r

def test_incident_id_is_looked_up_internally_with_full_detail():
    chal.INTERNAL_LOG_STORE.clear()
    r = chal.handle_request("alice", "hunter2")
    iid = r["incident_id"]
    assert iid in chal.INTERNAL_LOG_STORE
    assert chal.DB_CONNECTION_STRING in str(chal.INTERNAL_LOG_STORE[iid]), "Full detail should still be logged internally"

def test_each_request_gets_a_unique_incident_id():
    chal.INTERNAL_LOG_STORE.clear()
    r1 = chal.handle_request("alice", "hunter2")
    r2 = chal.handle_request("bob", "hunter3")
    assert r1["incident_id"] != r2["incident_id"]`,
  },
  {
    id: "timing-sidechannel",
    name: "The Timing Side Channel",
    points: 75,
    vulnerability: "Early-exit timing leak",
    background:
      "validate_structure(candidate) checks a candidate against a secret structure using a stack-based bracket matcher, returning the instant it finds a mismatch. Wrong inputs that match more of the correct prefix take measurably longer to reject — so an attacker measuring only response time could reconstruct the secret character by character.",
    task: "validate_structure() must take the same amount of work no matter where an input first differs from the secret — so response time can't reveal the secret — while still returning the correct true/false. Keep incrementing COMPARISON_COUNTER once per character examined.",
    hints: [
      "Why would a wrong guess that happens to share more of the secret's prefix take longer to be rejected than a totally wrong one?",
      "The leak is the shortcut: bailing out the moment something doesn't match. That's what makes the work amount depend on the input.",
      "Let the loop run the full length every single time, just remember in a variable whether anything ever mismatched, and make the true/false decision once, after the loop.",
    ],
    language: "python",
    file: "challenge8_timing_sidechannel.py",
    testCommand: "pytest tests/test_challenge8.py -v",
    lessonAnchor: "pattern-6",
    solution: {
      code: String.raw`def validate_structure(candidate):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    ok = True
    length_ok = (len(candidate) == len(SECRET_STRUCTURE))
    n = len(SECRET_STRUCTURE)
    padded = (candidate + "\0" * n)[:n]      # always exactly n chars
    for i in range(n):
        COMPARISON_COUNTER["count"] += 1
        c = padded[i]
        ok = ok and (c == SECRET_STRUCTURE[i])   # no early return
        if c in "([{":
            stack.append(c)
        elif c in ")]}":
            top = stack.pop() if stack else None
            ok = ok and (top == pairs.get(c))
    return ok and length_ok and (len(stack) == 0)`,
      explanation: [
        "The bug: the loop returns the instant a character doesn't match, so wrong guesses that share more of the secret's prefix take longer to reject — a timing side channel.",
        "The fix: never bail out early. Pad the candidate to the secret's length, loop the full length every time, and fold each comparison into a running ok flag using and.",
        "Decide True or False only after the loop finishes. Now the amount of work is identical no matter where the first mismatch is.",
      ],
    },
    starterCode: String.raw`SECRET_STRUCTURE = "([{}])([{}])([{}])([{}])([{}])"

COMPARISON_COUNTER = {"count": 0}


def validate_structure(candidate: str) -> bool:
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []

    if len(candidate) != len(SECRET_STRUCTURE):
        return False

    for i, (cand_char, secret_char) in enumerate(zip(candidate, SECRET_STRUCTURE)):
        COMPARISON_COUNTER["count"] += 1

        if cand_char != secret_char:
            return False

        if cand_char in "([{":
            stack.append(cand_char)
        elif cand_char in ")]}":
            if not stack or pairs[cand_char] != stack.pop():
                return False

    return len(stack) == 0`,
    tests: String.raw`def _run_and_count(cand):
    chal.COMPARISON_COUNTER["count"] = 0
    res = chal.validate_structure(cand)
    return res, chal.COMPARISON_COUNTER["count"]

def test_fully_correct_input_is_valid():
    r, _ = _run_and_count(chal.SECRET_STRUCTURE)
    assert r is True

def test_wrong_input_is_invalid():
    r, _ = _run_and_count("X" * len(chal.SECRET_STRUCTURE))
    assert r is False

def test_all_wrong_does_full_length_of_work():
    _, c = _run_and_count("X" * len(chal.SECRET_STRUCTURE))
    assert c == len(chal.SECRET_STRUCTURE), "Expected full-length work on total mismatch, got " + str(c) + " (early exit still present)"

def test_partial_prefix_match_does_full_length_of_work():
    p = chal.SECRET_STRUCTURE[:10] + "X" * (len(chal.SECRET_STRUCTURE) - 10)
    _, c = _run_and_count(p)
    assert c == len(chal.SECRET_STRUCTURE), "Work depends on how much prefix matched: " + str(c)

def test_fully_correct_does_full_length_of_work():
    _, c = _run_and_count(chal.SECRET_STRUCTURE)
    assert c == len(chal.SECRET_STRUCTURE)

def test_comparison_count_identical_across_all_mismatch_positions():
    counts = set()
    for pos in range(0, len(chal.SECRET_STRUCTURE), 3):
        cand = chal.SECRET_STRUCTURE[:pos] + "X" + "X" * (len(chal.SECRET_STRUCTURE) - pos - 1)
        _, c = _run_and_count(cand)
        counts.add(c)
    assert len(counts) == 1, "Comparison count varies by mismatch position: " + str(counts)

def test_wrong_length_input_does_not_crash():
    r, _ = _run_and_count("(((")
    assert r is False`,
  },
];
