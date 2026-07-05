import type { Challenge } from "./modules";

// The 8 Linked List Security & Privacy challenges — same shape as the Stack
// and Queue modules. Starter code is the vulnerable version with the giveaway
// comments stripped; solutions are revealed only on request.

export const linkedlistChallenges: Challenge[] = [
  {
    id: "pointer-corruption",
    name: "Pointer Corruption",
    points: 60,
    vulnerability: "Untrusted pointer overwrite",
    background:
      "A linked list is only as trustworthy as its `next` pointers. link_nodes() here rewrites a node's pointer with whatever it's handed — so an attacker can splice a fake node into the chain and hijack every traversal that follows.",
    task: "Fix link_nodes() so it only links a node that carries the genuine VALID marker; anything else raises InvalidPointerError before the list is modified. Linking a legitimate node must still work.",
    hints: [
      "Every real node sets self.marker = VALID in its constructor. Does link_nodes() ever check that on the incoming node?",
      "A fake node won't have marker == VALID. Read it defensively with getattr(next_node, \"marker\", None).",
      "If the marker isn't VALID, raise InvalidPointerError before the `current.next = next_node` line runs.",
    ],
    language: "python",
    file: "challenge1_pointer_corruption.py",
    testCommand: "pytest tests/test_challenge1.py -v",
    lessonAnchor: "pattern-1",
    starterCode: String.raw`VALID = "VALID"


class InvalidPointerError(Exception):
    pass


class ListNode:
    def __init__(self, value):
        self.value = value
        self.next = None
        self.marker = VALID


def link_nodes(current, next_node):
    current.next = next_node`,
    tests: String.raw`def build_nodes():
    return chal.ListNode("Alice"), chal.ListNode("Bob"), chal.ListNode("Charlie")

def test_valid_pointer_is_accepted():
    head, second, _ = build_nodes()
    chal.link_nodes(head, second)
    assert head.next is second

def test_untrusted_pointer_is_rejected():
    head, _, _ = build_nodes()
    class FakeNode:
        def __init__(self):
            self.value = "Mallory"; self.marker = "EVIL"; self.next = None
    with raises(chal.InvalidPointerError):
        chal.link_nodes(head, FakeNode())

def test_pointer_poisoning_does_not_modify_list():
    head, second, _ = build_nodes()
    head.next = second
    class FakeNode:
        def __init__(self):
            self.value = "Mallory"; self.marker = "EVIL"; self.next = None
    try:
        chal.link_nodes(second, FakeNode())
    except chal.InvalidPointerError:
        pass
    assert second.next is None, "Malicious node was linked into the list"`,
    solution: {
      code: String.raw`def link_nodes(current, next_node):
    if getattr(next_node, "marker", None) != VALID:
        raise InvalidPointerError("Untrusted pointer rejected.")
    current.next = next_node`,
      explanation: [
        "The bug: link_nodes() sets current.next to whatever object it's given, with no check that the object is a genuine node.",
        "The fix: read the incoming node's marker with getattr and confirm it equals VALID before linking.",
        "If the marker is missing or wrong, raise InvalidPointerError before touching the list, so a fake node can never be spliced in.",
      ],
    },
  },
  {
    id: "ll-stale-data",
    name: "Stale Data in Removed Nodes",
    points: 50,
    vulnerability: "Secrets surviving after removal",
    background:
      "Unlinking a node from a list doesn't erase what's inside it. If some other part of the program still holds a reference to the removed node, its secret is still readable — and the node may still point back into the live list.",
    task: "Fix remove_first() so the removed node no longer exposes its secret (set it to None) and no longer points into the remaining list (detach its next). Normal removal and the empty-list error must still work.",
    hints: [
      "remove_first() returns the old head — but what does that node still contain, and where does its next still point?",
      "Two things leak: removed.secret (the sensitive value) and removed.next (a live pointer back into the list).",
      "Before returning, set removed.secret = None and removed.next = None.",
    ],
    language: "python",
    file: "challenge2_stale_data.py",
    testCommand: "pytest tests/test_challenge2.py -v",
    lessonAnchor: "pattern-2",
    starterCode: String.raw`class EmptyListError(Exception):
    pass


class ListNode:
    def __init__(self, username, secret):
        self.username = username
        self.secret = secret
        self.next = None


class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, username, secret):
        node = ListNode(username, secret)
        if self.head is None:
            self.head = node
            return node
        current = self.head
        while current.next:
            current = current.next
        current.next = node
        return node


def remove_first(lst):
    if lst.head is None:
        raise EmptyListError("List is empty.")
    removed = lst.head
    lst.head = removed.next
    return removed`,
    tests: String.raw`def make_list():
    lst = chal.LinkedList()
    first = lst.append("alice", "alice_password")
    second = lst.append("bob", "bob_password")
    return lst, first, second

def test_remove_first_returns_correct_node():
    lst, first, second = make_list()
    removed = chal.remove_first(lst)
    assert removed is first
    assert lst.head is second

def test_remaining_list_is_preserved():
    lst, _, _ = make_list()
    chal.remove_first(lst)
    assert lst.head.username == "bob"
    assert lst.head.secret == "bob_password"

def test_secret_is_erased_before_return():
    lst, _, _ = make_list()
    removed = chal.remove_first(lst)
    assert removed.secret is None, "Secret remained inside the removed node"

def test_removed_node_is_detached():
    lst, _, _ = make_list()
    removed = chal.remove_first(lst)
    assert removed.next is None, "Removed node still points into the list"

def test_empty_list_raises():
    lst = chal.LinkedList()
    with raises(chal.EmptyListError):
        chal.remove_first(lst)`,
    solution: {
      code: String.raw`def remove_first(lst):
    if lst.head is None:
        raise EmptyListError("List is empty.")
    removed = lst.head
    lst.head = removed.next
    removed.secret = None      # wipe the secret
    removed.next = None        # detach from the live list
    return removed`,
      explanation: [
        "The bug: remove_first() unlinks the head but leaves its secret intact and its next pointer aimed at the rest of the list.",
        "The fix: after moving the head forward, set removed.secret = None and removed.next = None.",
        "Now a leftover reference to the removed node reveals no secret and can't be used to walk back into the live list.",
      ],
    },
  },
  {
    id: "cycle-injection",
    name: "Cycle Injection",
    points: 60,
    vulnerability: "Cycle → infinite traversal (DoS)",
    background:
      "Most list algorithms assume the chain ends. link_nodes() will happily point a later node back at an earlier one, creating a loop — and any traversal, search, or export then runs forever.",
    task: "Fix link_nodes() so a link that would create a cycle is refused with CycleDetectedError; the existing list must be left unchanged. Normal (acyclic) links, including linking to None, must still work.",
    hints: [
      "A cycle forms if `current` is already reachable by following `next_node`'s chain. How could you find that out before linking?",
      "Walk from next_node following .next; if you ever reach `current`, this link would close a loop.",
      "Raise CycleDetectedError in that case before assigning current.next. Remember to allow next_node being None.",
    ],
    language: "python",
    file: "challenge3_cycle_injection.py",
    testCommand: "pytest tests/test_challenge3.py -v",
    lessonAnchor: "pattern-3",
    starterCode: String.raw`class CycleDetectedError(Exception):
    pass


class ListNode:
    def __init__(self, value):
        self.value = value
        self.next = None


def link_nodes(current, next_node):
    current.next = next_node


def traverse(head):
    values = []
    current = head
    while current:
        values.append(current.value)
        current = current.next
    return values`,
    tests: String.raw`def build_list():
    head = chal.ListNode("Alice"); second = chal.ListNode("Bob"); third = chal.ListNode("Charlie")
    head.next = second; second.next = third
    return head, second, third

def test_normal_linking_still_works():
    _, _, third = build_list()
    chal.link_nodes(third, None)
    assert third.next is None

def test_normal_traversal_is_unchanged():
    head, _, _ = build_list()
    assert chal.traverse(head) == ["Alice", "Bob", "Charlie"]

def test_cycle_creation_is_rejected():
    _, second, third = build_list()
    with raises(chal.CycleDetectedError):
        chal.link_nodes(third, second)

def test_existing_list_is_not_modified():
    head, second, third = build_list()
    try:
        chal.link_nodes(third, second)
    except chal.CycleDetectedError:
        pass
    assert chal.traverse(head) == ["Alice", "Bob", "Charlie"], "The list was corrupted by the cycle attempt"`,
    solution: {
      code: String.raw`def link_nodes(current, next_node):
    if next_node is not None:
        walker = next_node
        while walker:
            if walker is current:
                raise CycleDetectedError("Link would create a cycle.")
            walker = walker.next
    current.next = next_node`,
      explanation: [
        "The bug: link_nodes() assigns current.next unconditionally, so pointing a node back at an earlier one silently creates a loop.",
        "The fix: before linking, walk the chain starting at next_node. If you ever reach `current`, the new link would close a cycle.",
        "Raise CycleDetectedError in that case; otherwise link as normal. Linking to None skips the walk and stays valid.",
      ],
    },
  },
  {
    id: "duplicate-id",
    name: "Duplicate Identifier",
    points: 50,
    vulnerability: "Duplicate IDs corrupt lookups",
    background:
      "Records in this list are keyed by a unique ID, and search/update/delete all assume each ID appears once. insert() appends blindly, so an attacker can add a second record with an existing ID and make lookups return the wrong one.",
    task: "Fix insert() so a new record whose ID already exists is refused with DuplicateIDError. Inserting a genuinely new ID must still work, and existing records stay intact.",
    hints: [
      "There's already a find() helper that locates a node by its ID. Could you use it before inserting?",
      "If find(lst, user_id) returns something, that ID is already taken.",
      "Raise DuplicateIDError in that case, before creating and appending the new node.",
    ],
    language: "python",
    file: "challenge4_duplicate_id.py",
    testCommand: "pytest tests/test_challenge4.py -v",
    lessonAnchor: "pattern-4",
    starterCode: String.raw`class DuplicateIDError(Exception):
    pass


class ListNode:
    def __init__(self, user_id, name):
        self.user_id = user_id
        self.name = name
        self.next = None


class LinkedList:
    def __init__(self):
        self.head = None


def insert(lst, user_id, name):
    new_node = ListNode(user_id, name)
    if lst.head is None:
        lst.head = new_node
        return new_node
    current = lst.head
    while current.next:
        current = current.next
    current.next = new_node
    return new_node


def find(lst, user_id):
    current = lst.head
    while current:
        if current.user_id == user_id:
            return current
        current = current.next
    return None`,
    tests: String.raw`def make_list():
    lst = chal.LinkedList()
    chal.insert(lst, 1001, "Alice")
    chal.insert(lst, 1002, "Bob")
    return lst

def count_nodes(lst):
    n = 0; c = lst.head
    while c:
        n += 1; c = c.next
    return n

def test_unique_identifier_is_inserted():
    lst = make_list()
    chal.insert(lst, 1003, "Charlie")
    u = chal.find(lst, 1003)
    assert u is not None and u.name == "Charlie"

def test_existing_records_are_preserved():
    lst = make_list()
    chal.insert(lst, 1003, "Charlie")
    assert chal.find(lst, 1001).name == "Alice"
    assert chal.find(lst, 1002).name == "Bob"

def test_duplicate_identifier_is_rejected():
    lst = make_list()
    with raises(chal.DuplicateIDError):
        chal.insert(lst, 1002, "Mallory")

def test_duplicate_record_is_not_inserted():
    lst = make_list()
    before = count_nodes(lst)
    try:
        chal.insert(lst, 1002, "Mallory")
    except chal.DuplicateIDError:
        pass
    assert count_nodes(lst) == before, "Duplicate record entered the list"`,
    solution: {
      code: String.raw`def insert(lst, user_id, name):
    if find(lst, user_id) is not None:
        raise DuplicateIDError("Duplicate identifier rejected.")
    new_node = ListNode(user_id, name)
    if lst.head is None:
        lst.head = new_node
        return new_node
    current = lst.head
    while current.next:
        current = current.next
    current.next = new_node
    return new_node`,
      explanation: [
        "The bug: insert() appends a new node without checking whether its ID is already present, so duplicate IDs slip in and confuse later lookups.",
        "The fix: call find(lst, user_id) first; if it returns a node, the ID is taken.",
        "Raise DuplicateIDError in that case; only unique IDs get appended.",
      ],
    },
  },
  {
    id: "pointer-poisoning",
    name: "Pointer Poisoning",
    points: 60,
    vulnerability: "Untrusted node injection",
    background:
      "Lists often receive nodes from plugins, network messages, or other libraries. append_node() adds whatever object it's handed, so an attacker can inject an untrusted node into a list of trusted ones.",
    task: "Fix append_node() so it only appends a node carrying the genuine TRUSTED marker; an untrusted node raises UntrustedNodeError and never enters the list. Trusted nodes must still append normally.",
    hints: [
      "Every legitimate node sets self.trust = TRUSTED. Is that checked before the node is appended?",
      "Read it defensively with getattr(node, \"trust\", None) — a hostile object might not have the attribute at all.",
      "If it isn't TRUSTED, raise UntrustedNodeError before modifying the list.",
    ],
    language: "python",
    file: "challenge5_pointer_poisoning.py",
    testCommand: "pytest tests/test_challenge5.py -v",
    lessonAnchor: "pattern-1",
    starterCode: String.raw`TRUSTED = "TRUSTED"


class UntrustedNodeError(Exception):
    pass


class ListNode:
    def __init__(self, value):
        self.value = value
        self.next = None
        self.trust = TRUSTED


class LinkedList:
    def __init__(self):
        self.head = None


def append_node(lst, node):
    if lst.head is None:
        lst.head = node
        return
    current = lst.head
    while current.next:
        current = current.next
    current.next = node


def traverse(lst):
    values = []
    current = lst.head
    while current:
        values.append(current.value)
        current = current.next
    return values`,
    tests: String.raw`def make_list():
    lst = chal.LinkedList()
    chal.append_node(lst, chal.ListNode("Alice"))
    chal.append_node(lst, chal.ListNode("Bob"))
    return lst

def values(lst):
    out = []; c = lst.head
    while c:
        out.append(c.value); c = c.next
    return out

def test_trusted_node_is_accepted():
    lst = make_list()
    chal.append_node(lst, chal.ListNode("Charlie"))
    assert values(lst) == ["Alice", "Bob", "Charlie"]

def test_untrusted_node_is_rejected():
    lst = make_list()
    class FakeNode:
        def __init__(self):
            self.value = "Mallory"; self.next = None; self.trust = "EVIL"
    with raises(chal.UntrustedNodeError):
        chal.append_node(lst, FakeNode())

def test_untrusted_node_never_enters_list():
    lst = make_list()
    class FakeNode:
        def __init__(self):
            self.value = "Mallory"; self.next = None; self.trust = "EVIL"
    try:
        chal.append_node(lst, FakeNode())
    except chal.UntrustedNodeError:
        pass
    assert "Mallory" not in values(lst), "Untrusted node entered the list"`,
    solution: {
      code: String.raw`def append_node(lst, node):
    if getattr(node, "trust", None) != TRUSTED:
        raise UntrustedNodeError("Untrusted node rejected.")
    if lst.head is None:
        lst.head = node
        return
    current = lst.head
    while current.next:
        current = current.next
    current.next = node`,
      explanation: [
        "The bug: append_node() links any object into the list without confirming it's a trusted node.",
        "The fix: check getattr(node, \"trust\", None) == TRUSTED before appending.",
        "Anything else raises UntrustedNodeError and is kept out of the list entirely.",
      ],
    },
  },
  {
    id: "ll-traversal-dos",
    name: "Traversal DoS",
    points: 60,
    vulnerability: "Unbounded traversal → denial of service",
    background:
      "count_nodes() walks the whole list with no limit. An attacker who can grow the list enormously can make every traversal burn CPU forever, taking the service down.",
    task: "Fix count_nodes() to stop and raise TraversalLimitExceeded once it has visited MAX_VISITS nodes. Lists up to MAX_VISITS (and empty lists) must still count correctly.",
    hints: [
      "The while loop keeps going as long as there's a next node — what bounds it?",
      "Track how many nodes you've visited and compare against MAX_VISITS each step.",
      "When the count would exceed MAX_VISITS, raise TraversalLimitExceeded instead of continuing.",
    ],
    language: "python",
    file: "challenge6_traversal_dos.py",
    testCommand: "pytest tests/test_challenge6.py -v",
    lessonAnchor: "pattern-5",
    starterCode: String.raw`MAX_VISITS = 100


class TraversalLimitExceeded(Exception):
    pass


class ListNode:
    def __init__(self, value):
        self.value = value
        self.next = None


def count_nodes(head):
    count = 0
    current = head
    while current:
        count += 1
        current = current.next
    return count`,
    tests: String.raw`def build_list(size):
    if size <= 0:
        return None
    head = chal.ListNode(0); current = head
    for i in range(1, size):
        current.next = chal.ListNode(i); current = current.next
    return head

def test_small_list_is_counted_correctly():
    assert chal.count_nodes(build_list(10)) == 10

def test_exactly_max_visits_is_allowed():
    assert chal.count_nodes(build_list(chal.MAX_VISITS)) == chal.MAX_VISITS

def test_large_list_is_rejected():
    with raises(chal.TraversalLimitExceeded):
        chal.count_nodes(build_list(chal.MAX_VISITS + 1))

def test_attack_does_not_complete_full_traversal():
    with raises(chal.TraversalLimitExceeded):
        chal.count_nodes(build_list(chal.MAX_VISITS * 20))

def test_empty_list_is_supported():
    assert chal.count_nodes(build_list(0)) == 0`,
    solution: {
      code: String.raw`def count_nodes(head):
    count = 0
    current = head
    while current:
        if count >= MAX_VISITS:
            raise TraversalLimitExceeded("Traversal limit exceeded.")
        count += 1
        current = current.next
    return count`,
      explanation: [
        "The bug: count_nodes() follows next pointers with no ceiling, so an oversized (or cyclic) list ties up the CPU indefinitely.",
        "The fix: before counting each node, check whether you've already reached MAX_VISITS.",
        "If so, raise TraversalLimitExceeded. Lists of exactly MAX_VISITS finish normally; anything larger is cut off.",
      ],
    },
  },
  {
    id: "ll-metadata-leakage",
    name: "Metadata Leakage",
    points: 50,
    vulnerability: "Over-exposed internal fields",
    background:
      "When lists are exported to JSON or an API, clients usually need only the public data. export_list() dumps every field — including owner, allocation IDs, and memory addresses — handing attackers reconnaissance for free.",
    task: "Fix export_list() so each exported record contains only the public fields (user_id and name), never owner, allocation_id, or memory_address.",
    hints: [
      "Look at the dictionary export_list() builds for each node — which of those keys should a client never see?",
      "Build the record with only the safe fields instead of copying everything.",
      "Return {\"user_id\": ..., \"name\": ...} per node — and nothing else.",
    ],
    language: "python",
    file: "challenge7_metadata_leakage.py",
    testCommand: "pytest tests/test_challenge7.py -v",
    lessonAnchor: "pattern-6",
    starterCode: String.raw`class ListNode:
    def __init__(self, user_id, name, owner, allocation_id, memory_address):
        self.user_id = user_id
        self.name = name
        self.owner = owner
        self.allocation_id = allocation_id
        self.memory_address = memory_address
        self.next = None


def export_list(head):
    exported = []
    current = head
    while current:
        exported.append({
            "user_id": current.user_id,
            "name": current.name,
            "owner": current.owner,
            "allocation_id": current.allocation_id,
            "memory_address": current.memory_address,
        })
        current = current.next
    return exported`,
    tests: String.raw`def build_list():
    a = chal.ListNode(1001, "Alice", owner="admin", allocation_id=501, memory_address="0x7ffe1010")
    b = chal.ListNode(1002, "Bob", owner="admin", allocation_id=502, memory_address="0x7ffe1020")
    a.next = b
    return a

def test_export_returns_public_fields():
    rec = chal.export_list(build_list())[0]
    assert rec["user_id"] == 1001
    assert rec["name"] == "Alice"

def test_internal_metadata_not_exposed():
    rec = chal.export_list(build_list())[0]
    assert "owner" not in rec
    assert "allocation_id" not in rec
    assert "memory_address" not in rec

def test_attacker_cannot_recover_addresses():
    leaked = str(chal.export_list(build_list()))
    assert "0x7ffe1010" not in leaked, "Memory address leaked in export"
    assert "501" not in leaked, "Allocation id leaked in export"`,
    solution: {
      code: String.raw`def export_list(head):
    exported = []
    current = head
    while current:
        exported.append({
            "user_id": current.user_id,
            "name": current.name,
        })
        current = current.next
    return exported`,
      explanation: [
        "The bug: export_list() copies every field of each node — including owner, allocation_id, and memory_address — into the exported records.",
        "The fix: build each record with only the public fields (user_id and name).",
        "The internal metadata never leaves the server, so clients (and attackers) can't see it.",
      ],
    },
  },
  {
    id: "hash-chain-tampering",
    name: "Hash Chain Tampering",
    points: 75,
    vulnerability: "Broken tamper-evident chain",
    background:
      "Hash chains (think blockchains and audit logs) make tampering detectable: each node's hash depends on its data and the previous node's hash. update_node() changes a node's data and re-hashes only that node — leaving every downstream hash stale, which quietly breaks integrity verification.",
    task: "Fix update_node() so that after a node's data changes, that node and every node after it get their hashes recomputed, so verify_chain() still passes. There's a recompute_chain() helper you can lean on.",
    hints: [
      "update_node() fixes the node's own hash — but each following node's hash was computed from the OLD value. Are those still correct?",
      "Changing one node invalidates the hash of every node after it, because each depends on the previous hash.",
      "Starting at the changed node, walk to the end recomputing each node's hash from the running previous hash — but keep the changed node's own previous_hash, since the node before it didn't change.",
    ],
    language: "python",
    file: "challenge8_hash_chain_tampering.py",
    testCommand: "pytest tests/test_challenge8.py -v",
    lessonAnchor: "pattern-6",
    starterCode: String.raw`import hashlib


def sha256(data):
    return hashlib.sha256(data.encode()).hexdigest()


class ListNode:
    def __init__(self, value):
        self.value = value
        self.previous_hash = "GENESIS"
        self.hash = ""
        self.next = None


def recompute_chain(head):
    previous = "GENESIS"
    current = head
    while current:
        current.previous_hash = previous
        current.hash = sha256(current.value + previous)
        previous = current.hash
        current = current.next


def update_node(node, new_value):
    node.value = new_value
    node.hash = sha256(node.value + node.previous_hash)


def verify_chain(head):
    previous = "GENESIS"
    current = head
    while current:
        expected = sha256(current.value + previous)
        if current.hash != expected:
            return False
        previous = current.hash
        current = current.next
    return True`,
    tests: String.raw`def build_chain():
    a = chal.ListNode("Alice"); b = chal.ListNode("Bob"); c = chal.ListNode("Charlie")
    a.next = b; b.next = c
    chal.recompute_chain(a)
    return a, b, c

def test_chain_initially_valid():
    head, _, _ = build_chain()
    assert chal.verify_chain(head) is True

def test_update_changes_value():
    _, bob, _ = build_chain()
    chal.update_node(bob, "Bob_v2")
    assert bob.value == "Bob_v2"

def test_chain_integrity_after_update():
    head, bob, _ = build_chain()
    chal.update_node(bob, "Mallory")
    assert chal.verify_chain(head) is True, "Chain broke — downstream hashes were not recomputed"

def test_tampering_propagates_to_downstream():
    head, bob, charlie = build_chain()
    chal.update_node(bob, "Mallory")
    assert charlie.hash == chal.sha256(charlie.value + bob.hash)`,
    solution: {
      code: String.raw`def update_node(node, new_value):
    node.value = new_value
    previous = node.previous_hash     # keep the real previous hash
    current = node
    while current:                    # rebuild this node and every node after it
        current.previous_hash = previous
        current.hash = sha256(current.value + previous)
        previous = current.hash
        current = current.next`,
      explanation: [
        "The bug: update_node() re-hashes only the changed node. Each later node's hash was computed from the old value, so the chain no longer verifies.",
        "The fix: starting at the changed node, walk to the end recomputing every node's hash from the running previous hash.",
        "Keep the changed node's own previous_hash (the node before it didn't change), so the whole suffix stays consistent and verify_chain() passes.",
      ],
    },
  },
];
