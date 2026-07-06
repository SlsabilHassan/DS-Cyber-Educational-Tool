import type { Challenge } from "./modules";

// The 8 Array Security & Privacy challenges — same shape as the other modules.
// Starter code is the vulnerable version with the giveaway comments stripped;
// solutions are revealed only on request.

export const arrayChallenges: Challenge[] = [
  {
    id: "array-index-corruption",
    name: "Array Index Corruption",
    points: 60,
    vulnerability: "Out-of-bounds write via bad index",
    background:
      "Arrays are accessed by numeric index, and every write must stay in bounds. write_value() trusts whatever index it's given — so a negative or too-large index writes to memory it never should (here, even negative indices count as invalid).",
    task: "Fix write_value() so an index below 0 or at/beyond the array's length raises InvalidIndexError before any write. Valid indices (0 to length-1) must still work.",
    hints: [
      "write_value() writes to array.data[index] with no check. What range of indices is actually valid?",
      "A valid index is an integer from 0 up to len(array.data) - 1.",
      "If index < 0 or index >= len(array.data), raise InvalidIndexError before the write.",
    ],
    language: "python",
    file: "challenge1_array_index_corruption.py",
    testCommand: "pytest tests/test_challenge1.py -v",
    lessonAnchor: "pattern-1",
    starterCode: String.raw`VALID = "VALID"


class InvalidIndexError(Exception):
    pass


class SecureArray:
    def __init__(self, capacity):
        self.marker = VALID
        self.data = [None] * capacity

    def size(self):
        return len(self.data)


def write_value(array, index, value):
    array.data[index] = value`,
    tests: String.raw`def test_normal_write_works():
    arr = chal.SecureArray(3)
    chal.write_value(arr, 1, "Alice")
    assert arr.data[1] == "Alice"

def test_last_valid_index_is_accepted():
    arr = chal.SecureArray(3)
    chal.write_value(arr, 2, "Bob")
    assert arr.data[2] == "Bob"

def test_negative_index_is_rejected():
    arr = chal.SecureArray(5)
    with raises(chal.InvalidIndexError):
        chal.write_value(arr, -1, "Mallory")

def test_index_past_end_is_rejected():
    arr = chal.SecureArray(5)
    with raises(chal.InvalidIndexError):
        chal.write_value(arr, 10, "Mallory")`,
    solution: {
      code: String.raw`def write_value(array, index, value):
    if not isinstance(index, int) or index < 0 or index >= len(array.data):
        raise InvalidIndexError("Index out of bounds.")
    array.data[index] = value`,
      explanation: [
        "The bug: write_value() writes to array.data[index] without confirming the index is in range, so a negative or oversized index corrupts unintended slots.",
        "The fix: validate that index is an integer in [0, len(array.data)).",
        "If it isn't, raise InvalidIndexError before the write — so only legitimate slots are ever touched.",
      ],
    },
  },
  {
    id: "ghost-elements",
    name: "Ghost Elements",
    points: 50,
    vulnerability: "Data surviving after deletion",
    background:
      "Removing an element shifts the others left, but the now-unused final slot still holds its old value. If that value was sensitive, it lingers in memory for anyone who reads the backing array.",
    task: "Fix remove_at() so the slot vacated by the shift is overwritten with None before the count is reduced. Removal still returns the value and shifting still works.",
    hints: [
      "After the elements shift left, the old last slot (index count - 1) still holds a leftover copy.",
      "Clear that slot before you decrement the count.",
      "Set array.data[array.count - 1] = None after the shift loop.",
    ],
    language: "python",
    file: "challenge2_ghost_elements.py",
    testCommand: "pytest tests/test_challenge2.py -v",
    lessonAnchor: "pattern-2",
    starterCode: String.raw`class SecureArray:
    def __init__(self, capacity):
        self.data = [None] * capacity
        self.count = 0

    def insert(self, value):
        if self.count >= len(self.data):
            raise OverflowError("Array is full")
        self.data[self.count] = value
        self.count += 1


def remove_at(array, index):
    if index < 0 or index >= array.count:
        raise IndexError("Invalid index")
    removed = array.data[index]
    for i in range(index, array.count - 1):
        array.data[i] = array.data[i + 1]
    array.count -= 1
    return removed`,
    tests: String.raw`def build_array():
    arr = chal.SecureArray(5)
    for v in ["Alice", "Bob", "Charlie"]:
        arr.insert(v)
    return arr

def test_remove_returns_deleted_value():
    assert chal.remove_at(build_array(), 1) == "Bob"

def test_elements_shift_left():
    arr = build_array()
    chal.remove_at(arr, 1)
    assert arr.data[0] == "Alice"
    assert arr.data[1] == "Charlie"

def test_invalid_index_is_rejected():
    with raises(IndexError):
        chal.remove_at(build_array(), 10)

def test_vacated_slot_is_cleared():
    arr = build_array()
    chal.remove_at(arr, 1)
    assert arr.data[arr.count] is None, "Vacated slot still holds old data"`,
    solution: {
      code: String.raw`def remove_at(array, index):
    if index < 0 or index >= array.count:
        raise IndexError("Invalid index")
    removed = array.data[index]
    for i in range(index, array.count - 1):
        array.data[i] = array.data[i + 1]
    array.data[array.count - 1] = None    # wipe the vacated slot
    array.count -= 1
    return removed`,
      explanation: [
        "The bug: remove_at() shifts elements left but leaves the old value sitting in the now-unused final slot.",
        "The fix: after the shift, overwrite array.data[array.count - 1] with None, then decrement the count.",
        "The removed value is returned to the caller, but no copy is left behind in the backing array.",
      ],
    },
  },
  {
    id: "restricted-index",
    name: "Restricted Index",
    points: 60,
    vulnerability: "Unauthorized slot modification",
    background:
      "Each slot in this array has an owner. update_value() overwrites whatever index it's told to, with no check — so any caller can modify data belonging to someone else.",
    task: "Fix update_value() so a caller may only modify a slot they own; modifying another owner's slot raises AuthorizationError and leaves it unchanged. Owners can still update their own slots.",
    hints: [
      "The array tracks an owner per slot in array.owners. Is that ever compared against the caller?",
      "The caller (user) must match array.owners[index] to be allowed to write.",
      "If array.owners[index] != user, raise AuthorizationError before the write.",
    ],
    language: "python",
    file: "challenge3_restricted_index.py",
    testCommand: "pytest tests/test_challenge3.py -v",
    lessonAnchor: "pattern-3",
    starterCode: String.raw`class AuthorizationError(Exception):
    pass


class SecureArray:
    def __init__(self, capacity):
        self.data = [None] * capacity
        self.owners = [None] * capacity

    def assign(self, index, owner, value):
        self.data[index] = value
        self.owners[index] = owner


def update_value(array, user, index, value):
    array.data[index] = value`,
    tests: String.raw`def build_array():
    arr = chal.SecureArray(4)
    arr.assign(0, "Alice", "Payroll")
    arr.assign(1, "Bob", "Grades")
    arr.assign(2, "Charlie", "Medical")
    arr.assign(3, "Alice", "Research")
    return arr

def test_owner_can_modify_own_index():
    arr = build_array()
    chal.update_value(arr, "Alice", 0, "UpdatedPayroll")
    assert arr.data[0] == "UpdatedPayroll"

def test_multiple_authorized_updates():
    arr = build_array()
    chal.update_value(arr, "Alice", 3, "UpdatedResearch")
    chal.update_value(arr, "Bob", 1, "UpdatedGrades")
    assert arr.data[3] == "UpdatedResearch"
    assert arr.data[1] == "UpdatedGrades"

def test_unauthorized_update_is_rejected():
    arr = build_array()
    with raises(chal.AuthorizationError):
        chal.update_value(arr, "Bob", 0, "Hacked")

def test_unauthorized_update_does_not_change_data():
    arr = build_array()
    try:
        chal.update_value(arr, "Bob", 0, "Hacked")
    except chal.AuthorizationError:
        pass
    assert arr.data[0] == "Payroll", "Unauthorized write modified the slot"`,
    solution: {
      code: String.raw`def update_value(array, user, index, value):
    if array.owners[index] != user:
        raise AuthorizationError("You do not own this slot.")
    array.data[index] = value`,
      explanation: [
        "The bug: update_value() writes to any index without checking who owns that slot.",
        "The fix: compare array.owners[index] against the caller (user) before writing.",
        "If they don't match, raise AuthorizationError; only the slot's owner can modify it.",
      ],
    },
  },
  {
    id: "array-tampering",
    name: "Array Tampering",
    points: 55,
    vulnerability: "Internal storage exposed by reference",
    background:
      "An array should guard its own storage. export() here hands back the real internal list, so a caller can mutate the array's contents directly — bypassing the array's own interface and any checks it enforces.",
    task: "Fix export() so callers get a copy of the contents: modifying the returned list must not change the array's internal storage. The exported data must still contain all the values.",
    hints: [
      "export() returns self.data — the actual internal list. What can a caller do to that object?",
      "You want callers to see the values without holding a reference to your real storage.",
      "Return a copy instead: list(self.data) hands back a new list with the same values.",
    ],
    language: "python",
    file: "challenge4_array_tampering.py",
    testCommand: "pytest tests/test_challenge4.py -v",
    lessonAnchor: "pattern-6",
    starterCode: String.raw`class SecureArray:
    def __init__(self):
        self.data = []

    def insert(self, value):
        self.data.append(value)

    def export(self):
        return self.data`,
    tests: String.raw`def build_array():
    arr = chal.SecureArray()
    for v in ["Alice", "Bob", "Charlie"]:
        arr.insert(v)
    return arr

def test_export_contains_all_values():
    assert build_array().export() == ["Alice", "Bob", "Charlie"]

def test_export_reflects_contents():
    exported = build_array().export()
    assert len(exported) == 3
    assert exported[1] == "Bob"

def test_modifying_export_does_not_modify_array():
    arr = build_array()
    exported = arr.export()
    exported[1] = "Mallory"
    assert arr.export()[1] == "Bob", "Exported list is aliased to the internal storage"`,
    solution: {
      code: String.raw`def export(self):
    return list(self.data)    # a copy, not the real list`,
      explanation: [
        "The bug: export() returns self.data itself, so a caller holding that reference can mutate the array's internal storage directly.",
        "The fix: return list(self.data), a fresh copy containing the same values.",
        "Callers can read and even modify the copy freely, but the array's real storage is untouched.",
      ],
    },
  },
  {
    id: "array-poisoning",
    name: "Array Poisoning",
    points: 55,
    vulnerability: "Invalid values injected",
    background:
      "This array is only supposed to hold positive integer employee IDs. insert() accepts anything — negative numbers, strings, None — and any of those can corrupt code downstream that assumes valid data.",
    task: "Fix insert() so it only accepts a positive integer; anything else raises InvalidValueError before it's stored. Valid IDs still insert normally.",
    hints: [
      "insert() stores whatever it's handed. What does a valid employee ID actually look like here?",
      "A valid value is an integer greater than 0 (and not a bool, which Python treats as an int).",
      "Reject anything else with InvalidValueError before writing it into the array.",
    ],
    language: "python",
    file: "challenge5_array_poisoning.py",
    testCommand: "pytest tests/test_challenge5.py -v",
    lessonAnchor: "pattern-4",
    starterCode: String.raw`class InvalidValueError(Exception):
    pass


class SecureArray:
    def __init__(self, capacity):
        self.data = [None] * capacity
        self.count = 0

    def insert(self, value):
        if self.count >= len(self.data):
            raise OverflowError("Array is full")
        self.data[self.count] = value
        self.count += 1`,
    tests: String.raw`def build_array():
    arr = chal.SecureArray(5)
    for v in [101, 102, 103]:
        arr.insert(v)
    return arr

def test_valid_insert_succeeds():
    arr = build_array()
    arr.insert(104)
    assert arr.data[:arr.count] == [101, 102, 103, 104]

def test_negative_value_is_rejected():
    with raises(chal.InvalidValueError):
        build_array().insert(-1)

def test_none_is_rejected():
    with raises(chal.InvalidValueError):
        build_array().insert(None)

def test_string_is_rejected():
    with raises(chal.InvalidValueError):
        build_array().insert("evil")`,
    solution: {
      code: String.raw`def insert(self, value):
    if not isinstance(value, int) or isinstance(value, bool) or value <= 0:
        raise InvalidValueError("Value must be a positive integer.")
    if self.count >= len(self.data):
        raise OverflowError("Array is full")
    self.data[self.count] = value
    self.count += 1`,
      explanation: [
        "The bug: insert() stores any value, so strings, None, and negative numbers all poison the array.",
        "The fix: validate the value first — it must be an int (not a bool) and greater than zero.",
        "Reject anything else with InvalidValueError before it reaches the backing array.",
      ],
    },
  },
  {
    id: "array-exhaustion",
    name: "Array Exhaustion",
    points: 55,
    vulnerability: "Unbounded growth → DoS",
    background:
      "This dynamic array doubles its capacity when full. With no ceiling, an attacker can insert forever, doubling the backing store until memory runs out.",
    task: "Fix insert() so growth is capped at MAX_CAPACITY: an insertion that would resize past it raises ArrayCapacityError. Growth up to MAX_CAPACITY still works.",
    hints: [
      "When the array is full it doubles len(self.data). What stops that doubling from going past MAX_CAPACITY?",
      "Before allocating the bigger array, compute the new capacity and compare it against MAX_CAPACITY.",
      "If doubling would exceed MAX_CAPACITY, raise ArrayCapacityError instead of growing.",
    ],
    language: "python",
    file: "challenge6_array_exhaustion.py",
    testCommand: "pytest tests/test_challenge6.py -v",
    lessonAnchor: "pattern-5",
    starterCode: String.raw`MAX_CAPACITY = 16


class ArrayCapacityError(Exception):
    pass


class SecureArray:
    def __init__(self):
        self.data = [None] * 2
        self.count = 0

    def insert(self, value):
        if self.count == len(self.data):
            new_data = [None] * (len(self.data) * 2)
            for i in range(self.count):
                new_data[i] = self.data[i]
            self.data = new_data
        self.data[self.count] = value
        self.count += 1`,
    tests: String.raw`def test_resize_occurs_when_capacity_reached():
    arr = chal.SecureArray()
    arr.insert(1); arr.insert(2)
    original = len(arr.data)
    arr.insert(3)
    assert len(arr.data) > original

def test_growth_up_to_max_capacity():
    arr = chal.SecureArray()
    while len(arr.data) < chal.MAX_CAPACITY:
        arr.insert(arr.count)
    assert len(arr.data) == chal.MAX_CAPACITY

def test_exceeding_max_capacity_is_rejected():
    arr = chal.SecureArray()
    while arr.count < chal.MAX_CAPACITY:
        arr.insert(arr.count)
    with raises(chal.ArrayCapacityError):
        arr.insert(999)`,
    solution: {
      code: String.raw`def insert(self, value):
    if self.count == len(self.data):
        new_capacity = len(self.data) * 2
        if new_capacity > MAX_CAPACITY:
            raise ArrayCapacityError("Maximum capacity reached.")
        new_data = [None] * new_capacity
        for i in range(self.count):
            new_data[i] = self.data[i]
        self.data = new_data
    self.data[self.count] = value
    self.count += 1`,
      explanation: [
        "The bug: insert() doubles the backing store whenever it's full, with no upper bound, so a flood of inserts exhausts memory.",
        "The fix: before allocating, check whether the doubled capacity would exceed MAX_CAPACITY.",
        "If so, raise ArrayCapacityError; otherwise grow as normal. Growth is now bounded.",
      ],
    },
  },
  {
    id: "array-metadata-leakage",
    name: "Array Metadata Leakage",
    points: 50,
    vulnerability: "Unused storage exposed",
    background:
      "The array reserves more storage than it uses. Only the first `count` slots are real data; the rest may hold stale or sensitive leftovers. snapshot() returns the whole backing array, exposing those unused slots.",
    task: "Fix snapshot() so it returns only the active elements (the first `count`), never the unused storage. The snapshot must match the logical contents and length.",
    hints: [
      "snapshot() returns self.data — the full backing array, including slots past self.count.",
      "Only the first self.count elements are logically part of the array.",
      "Return a slice of just those: self.data[:self.count].",
    ],
    language: "python",
    file: "challenge7_array_metadata_leakage.py",
    testCommand: "pytest tests/test_challenge7.py -v",
    lessonAnchor: "pattern-6",
    starterCode: String.raw`class SecureArray:
    def __init__(self, capacity):
        self.data = [None] * capacity
        self.count = 0

    def insert(self, value):
        if self.count >= len(self.data):
            raise OverflowError("Array is full")
        self.data[self.count] = value
        self.count += 1

    def snapshot(self):
        return self.data`,
    tests: String.raw`def build_array():
    arr = chal.SecureArray(8)
    for v in ["Alice", "Bob", "Charlie"]:
        arr.insert(v)
    arr.data[5] = "PayrollDatabase"
    arr.data[6] = "AdminPassword"
    return arr

def test_snapshot_returns_logical_elements():
    assert build_array().snapshot() == ["Alice", "Bob", "Charlie"]

def test_snapshot_length_matches_count():
    arr = build_array()
    assert len(arr.snapshot()) == arr.count

def test_stale_values_not_exposed():
    leaked = str(build_array().snapshot())
    assert "AdminPassword" not in leaked
    assert "PayrollDatabase" not in leaked`,
    solution: {
      code: String.raw`def snapshot(self):
    return self.data[:self.count]`,
      explanation: [
        "The bug: snapshot() returns the entire backing array, including unused slots that may hold stale secrets.",
        "The fix: return only the first self.count elements with a slice.",
        "The snapshot now reflects exactly the logical contents and never leaks unused storage.",
      ],
    },
  },
  {
    id: "concurrent-resize",
    name: "Concurrent Resize",
    points: 75,
    vulnerability: "Unsynchronized resize race",
    background:
      "This dynamic array resizes when full. If two threads insert at the same moment, one may resize while the other writes — corrupting the storage or losing updates. A lock exists but insert() never uses it.",
    task: "Fix insert() so the whole insert-and-resize sequence runs under self.lock, keeping the array consistent. Single-threaded inserts and resizing must still work.",
    hints: [
      "The SecureArray already has a self.lock, but insert() modifies self.data and self.count without ever taking it.",
      "The resize-and-write sequence is a critical section: only one thread should run it at a time.",
      "Wrap the body of insert() in `with self.lock:`.",
    ],
    language: "python",
    file: "challenge8_concurrent_resize.py",
    testCommand: "pytest tests/test_challenge8.py -v",
    lessonAnchor: "pattern-5",
    starterCode: String.raw`import threading


class SecureArray:
    def __init__(self):
        self.data = [None] * 2
        self.count = 0
        self.lock = threading.Lock()

    def insert(self, value):
        if self.count == len(self.data):
            new_data = [None] * (len(self.data) * 2)
            for i in range(self.count):
                new_data[i] = self.data[i]
            self.data = new_data
        self.data[self.count] = value
        self.count += 1`,
    tests: String.raw`def test_single_thread_insertions():
    arr = chal.SecureArray()
    for i in range(10):
        arr.insert(i)
    assert arr.count == 10
    assert arr.data[:10] == list(range(10))

def test_array_resizes_correctly():
    arr = chal.SecureArray()
    for i in range(20):
        arr.insert(i)
    assert arr.count == 20
    assert arr.data[:20] == list(range(20))

def test_insert_runs_under_the_lock():
    arr = chal.SecureArray()
    counter = {"n": 0}
    real = arr.lock
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
    arr.lock = Tracked()
    arr.insert(1)
    assert counter["n"] >= 1, "insert() must run under self.lock"`,
    solution: {
      code: String.raw`def insert(self, value):
    with self.lock:
        if self.count == len(self.data):
            new_data = [None] * (len(self.data) * 2)
            for i in range(self.count):
                new_data[i] = self.data[i]
            self.data = new_data
        self.data[self.count] = value
        self.count += 1`,
      explanation: [
        "The bug: insert() reads and writes self.data and self.count without synchronization, so concurrent inserts can corrupt the array during a resize.",
        "The fix: wrap the entire insert-and-resize body in `with self.lock:`.",
        "Now only one thread can resize or write at a time, so every insert is applied consistently.",
      ],
    },
  },
];
