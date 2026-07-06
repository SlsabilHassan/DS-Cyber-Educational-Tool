import type { Challenge } from "./modules";

// The 8 Hash Table Security & Privacy challenges — same shape as the other
// modules. Starter code is the vulnerable version with the giveaway comments
// stripped; solutions are revealed only on request.

export const hashtableChallenges: Challenge[] = [
  {
    id: "bucket-index-corruption",
    name: "Bucket Index Corruption",
    points: 60,
    vulnerability: "Out-of-range bucket write",
    background:
      "A hash table stores entries in buckets, and every bucket index must fall inside the bucket array. insert_entry() trusts whatever index it's handed — so an invalid one writes outside the intended range.",
    task: "Fix insert_entry() so a bucket index below 0 or at/beyond the number of buckets raises InvalidBucketError before any write. Valid indices still work.",
    hints: [
      "insert_entry() appends into table.buckets[bucket_index] with no check. What's the valid range of indices?",
      "It's 0 up to len(table.buckets) - 1.",
      "If bucket_index is outside that range, raise InvalidBucketError before the append.",
    ],
    language: "python",
    file: "challenge1_bucket_index_corruption.py",
    testCommand: "pytest tests/test_challenge1.py -v",
    lessonAnchor: "pattern-1",
    starterCode: String.raw`VALID = "VALID"


class InvalidBucketError(Exception):
    pass


class HashEntry:
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.marker = VALID


class SecureHashTable:
    def __init__(self, bucket_count):
        self.marker = VALID
        self.buckets = [[] for _ in range(bucket_count)]

    def bucket_count(self):
        return len(self.buckets)


def insert_entry(table, bucket_index, entry):
    table.buckets[bucket_index].append(entry)`,
    tests: String.raw`def build_table():
    t = chal.SecureHashTable(4)
    chal.insert_entry(t, 0, chal.HashEntry("alice", "AliceSecret"))
    chal.insert_entry(t, 1, chal.HashEntry("bob", "BobSecret"))
    return t

def test_valid_bucket_insertion_works():
    t = build_table()
    assert t.buckets[0][0].key == "alice"
    assert t.buckets[1][0].key == "bob"

def test_negative_bucket_is_rejected():
    t = chal.SecureHashTable(4)
    with raises(chal.InvalidBucketError):
        chal.insert_entry(t, -1, chal.HashEntry("m", "m"))

def test_out_of_range_bucket_is_rejected():
    t = chal.SecureHashTable(4)
    with raises(chal.InvalidBucketError):
        chal.insert_entry(t, 99, chal.HashEntry("m", "m"))`,
    solution: {
      code: String.raw`def insert_entry(table, bucket_index, entry):
    if not isinstance(bucket_index, int) or bucket_index < 0 or bucket_index >= len(table.buckets):
        raise InvalidBucketError("Bucket index out of range.")
    table.buckets[bucket_index].append(entry)`,
      explanation: [
        "The bug: insert_entry() appends into table.buckets[bucket_index] without confirming the index is valid.",
        "The fix: check that bucket_index is an integer in [0, len(table.buckets)).",
        "If not, raise InvalidBucketError before the append — so writes always land in a real bucket.",
      ],
    },
  },
  {
    id: "ht-stale-entries",
    name: "Stale Entries",
    points: 50,
    vulnerability: "Deleted entries keep their data",
    background:
      "Deleting an entry should remove its sensitive data. Here delete_entry() pops the entry from the active bucket but files it, untouched, in a deleted-entries audit log — so its key and value are still recoverable.",
    task: "Fix delete_entry() so the removed entry's key and value are cleared (set to None) before it's stored in deleted_entries. Deletion still removes it from the bucket, and deleting a missing key still raises KeyError.",
    hints: [
      "delete_entry() pops the entry, then appends it to table.deleted_entries. What sensitive fields does that stored object still hold?",
      "Both removed.key and removed.value are still populated when logged.",
      "Set removed.key = None and removed.value = None before appending it to deleted_entries.",
    ],
    language: "python",
    file: "challenge2_stale_entries.py",
    testCommand: "pytest tests/test_challenge2.py -v",
    lessonAnchor: "pattern-2",
    starterCode: String.raw`class HashEntry:
    def __init__(self, key, value):
        self.key = key
        self.value = value


class SecureHashTable:
    def __init__(self):
        self.bucket = []
        self.deleted_entries = []

    def insert(self, key, value):
        self.bucket.append(HashEntry(key, value))


def delete_entry(table, key):
    for i, entry in enumerate(table.bucket):
        if entry.key == key:
            removed = table.bucket.pop(i)
            table.deleted_entries.append(removed)
            return removed
    raise KeyError(key)`,
    tests: String.raw`def build_table():
    t = chal.SecureHashTable()
    t.insert("alice", "AlicePassword")
    t.insert("bob", "BobPassword")
    t.insert("carol", "CarolPassword")
    return t

def test_delete_removes_entry_from_bucket():
    t = build_table()
    chal.delete_entry(t, "bob")
    assert "bob" not in [e.key for e in t.bucket]

def test_delete_missing_raises():
    t = build_table()
    with raises(KeyError):
        chal.delete_entry(t, "nope")

def test_deleted_entry_is_scrubbed():
    t = build_table()
    chal.delete_entry(t, "bob")
    logged = t.deleted_entries[0]
    assert logged.value is None, "Deleted entry still holds its value"
    assert logged.key is None

def test_deleted_secret_not_recoverable():
    t = build_table()
    chal.delete_entry(t, "bob")
    assert "BobPassword" not in str(t.deleted_entries[0].__dict__)`,
    solution: {
      code: String.raw`def delete_entry(table, key):
    for i, entry in enumerate(table.bucket):
        if entry.key == key:
            removed = table.bucket.pop(i)
            removed.key = None       # scrub before logging
            removed.value = None
            table.deleted_entries.append(removed)
            return removed
    raise KeyError(key)`,
      explanation: [
        "The bug: delete_entry() removes the entry from the active bucket but logs it to deleted_entries with its key and value intact.",
        "The fix: set removed.key and removed.value to None before appending it to the log.",
        "The audit trail still records that a deletion happened, but the sensitive contents are gone.",
      ],
    },
  },
  {
    id: "unauthorized-key-update",
    name: "Unauthorized Key Update",
    points: 60,
    vulnerability: "Cross-owner entry modification",
    background:
      "Entries belong to different owners, and only an owner should modify their entry. update_value() updates whatever key matches, ignoring ownership — so any user can overwrite another's data.",
    task: "Fix update_value() so a caller may only modify an entry they own; modifying someone else's raises AuthorizationError and leaves it unchanged. Owners can still update their own entries, and a missing key still raises KeyError.",
    hints: [
      "Each entry records an owner. Does update_value() ever compare it to the requesting_user?",
      "When you find the matching key, check entry.owner against requesting_user before writing.",
      "If they differ, raise AuthorizationError instead of updating the value.",
    ],
    language: "python",
    file: "challenge3_unauthorized_key_update.py",
    testCommand: "pytest tests/test_challenge3.py -v",
    lessonAnchor: "pattern-3",
    starterCode: String.raw`class AuthorizationError(Exception):
    pass


class HashEntry:
    def __init__(self, key, value, owner):
        self.key = key
        self.value = value
        self.owner = owner


class SecureHashTable:
    def __init__(self):
        self.bucket = []

    def insert(self, key, value, owner):
        self.bucket.append(HashEntry(key, value, owner))


def update_value(table, requesting_user, key, new_value):
    for entry in table.bucket:
        if entry.key == key:
            entry.value = new_value
            return
    raise KeyError(key)`,
    tests: String.raw`def build_table():
    t = chal.SecureHashTable()
    t.insert("payroll", "1000", "alice")
    t.insert("grades", "A", "bob")
    return t

def test_owner_can_update():
    t = build_table()
    chal.update_value(t, "alice", "payroll", "2000")
    assert t.bucket[0].value == "2000"

def test_missing_key_raises():
    t = build_table()
    with raises(KeyError):
        chal.update_value(t, "alice", "nope", "x")

def test_unauthorized_update_is_rejected():
    t = build_table()
    with raises(chal.AuthorizationError):
        chal.update_value(t, "bob", "payroll", "hacked")

def test_unauthorized_update_does_not_change_value():
    t = build_table()
    try:
        chal.update_value(t, "bob", "payroll", "hacked")
    except chal.AuthorizationError:
        pass
    assert t.bucket[0].value == "1000", "Unauthorized write modified the entry"`,
    solution: {
      code: String.raw`def update_value(table, requesting_user, key, new_value):
    for entry in table.bucket:
        if entry.key == key:
            if entry.owner != requesting_user:
                raise AuthorizationError("You do not own this entry.")
            entry.value = new_value
            return
    raise KeyError(key)`,
      explanation: [
        "The bug: update_value() writes to any entry whose key matches, without checking who owns it.",
        "The fix: once you find the entry, compare entry.owner against requesting_user before writing.",
        "If they don't match, raise AuthorizationError; only the owner can update the value.",
      ],
    },
  },
  {
    id: "duplicate-key-injection",
    name: "Duplicate Key Injection",
    points: 50,
    vulnerability: "Duplicate keys break lookups",
    background:
      "A hash table relies on each key being unique. insert_entry() appends without checking, so an attacker can inject a second entry with an existing key — making lookups ambiguous and corrupting the data.",
    task: "Fix insert_entry() so inserting a key that already exists raises DuplicateKeyError and leaves the original entry in place. New, unique keys still insert normally.",
    hints: [
      "insert_entry() appends a new entry with no regard for existing keys. What if that key is already present?",
      "Scan the bucket for an entry whose key matches before inserting.",
      "If one exists, raise DuplicateKeyError before appending the new entry.",
    ],
    language: "python",
    file: "challenge4_duplicate_key_injection.py",
    testCommand: "pytest tests/test_challenge4.py -v",
    lessonAnchor: "pattern-4",
    starterCode: String.raw`class DuplicateKeyError(Exception):
    pass


class HashEntry:
    def __init__(self, key, value):
        self.key = key
        self.value = value


class SecureHashTable:
    def __init__(self):
        self.bucket = []


def insert_entry(table, key, value):
    table.bucket.append(HashEntry(key, value))`,
    tests: String.raw`def build_table():
    t = chal.SecureHashTable()
    chal.insert_entry(t, "alice", "AliceSecret")
    chal.insert_entry(t, "bob", "BobSecret")
    return t

def test_unique_keys_are_inserted():
    t = build_table()
    assert [e.key for e in t.bucket] == ["alice", "bob"]

def test_new_unique_key_is_accepted():
    t = build_table()
    chal.insert_entry(t, "carol", "CarolSecret")
    assert any(e.key == "carol" for e in t.bucket)

def test_duplicate_key_is_rejected():
    t = build_table()
    with raises(chal.DuplicateKeyError):
        chal.insert_entry(t, "alice", "Evil")

def test_duplicate_not_inserted():
    t = build_table()
    try:
        chal.insert_entry(t, "alice", "Evil")
    except chal.DuplicateKeyError:
        pass
    assert len(t.bucket) == 2`,
    solution: {
      code: String.raw`def insert_entry(table, key, value):
    for entry in table.bucket:
        if entry.key == key:
            raise DuplicateKeyError(key)
    table.bucket.append(HashEntry(key, value))`,
      explanation: [
        "The bug: insert_entry() appends every entry, so a repeated key creates a duplicate and makes lookups ambiguous.",
        "The fix: scan the bucket for the key first; if it's already there, raise DuplicateKeyError.",
        "Only genuinely new keys are appended, preserving the one-entry-per-key invariant.",
      ],
    },
  },
  {
    id: "hash-table-poisoning",
    name: "Hash Table Poisoning",
    points: 55,
    vulnerability: "Malformed keys accepted",
    background:
      "The table assumes keys are valid strings. insert_entry() accepts anything — None, empty strings, non-strings — and those malformed keys break assumptions across the whole application.",
    task: "Fix insert_entry() so it only accepts a non-empty string key; anything else raises InvalidKeyError before insertion. Valid keys still insert normally.",
    hints: [
      "insert_entry() stores whatever key it's given. What does a well-formed key look like here?",
      "A valid key is a string that isn't empty.",
      "Reject None, non-strings, and \"\" with InvalidKeyError before appending.",
    ],
    language: "python",
    file: "challenge5_hash_table_poisoning.py",
    testCommand: "pytest tests/test_challenge5.py -v",
    lessonAnchor: "pattern-4",
    starterCode: String.raw`class InvalidKeyError(Exception):
    pass


class HashEntry:
    def __init__(self, key, value):
        self.key = key
        self.value = value


class SecureHashTable:
    def __init__(self):
        self.bucket = []


def insert_entry(table, key, value):
    table.bucket.append(HashEntry(key, value))`,
    tests: String.raw`def test_valid_keys_are_inserted():
    t = chal.SecureHashTable()
    chal.insert_entry(t, "alice", "AliceSecret")
    chal.insert_entry(t, "bob", "BobSecret")
    assert [e.key for e in t.bucket] == ["alice", "bob"]

def test_none_key_is_rejected():
    t = chal.SecureHashTable()
    with raises(chal.InvalidKeyError):
        chal.insert_entry(t, None, "x")

def test_empty_key_is_rejected():
    t = chal.SecureHashTable()
    with raises(chal.InvalidKeyError):
        chal.insert_entry(t, "", "x")

def test_non_string_key_is_rejected():
    t = chal.SecureHashTable()
    with raises(chal.InvalidKeyError):
        chal.insert_entry(t, 123, "x")`,
    solution: {
      code: String.raw`def insert_entry(table, key, value):
    if not isinstance(key, str) or key == "":
        raise InvalidKeyError("Key must be a non-empty string.")
    table.bucket.append(HashEntry(key, value))`,
      explanation: [
        "The bug: insert_entry() stores any key, so None, empty strings, and non-strings poison the table.",
        "The fix: check that the key is a string and not empty before inserting.",
        "Reject anything else with InvalidKeyError so only well-formed keys get in.",
      ],
    },
  },
  {
    id: "collision-dos",
    name: "Collision DoS",
    points: 60,
    vulnerability: "Unbounded collision chain",
    background:
      "Hash tables stay fast by spreading entries across buckets. If an attacker sends many keys that collide into one bucket, its chain grows without limit and every lookup slows to a crawl — a denial of service.",
    task: "Fix insert_entry() so a bucket that already holds MAX_CHAIN_LENGTH entries rejects further inserts with BucketOverflowError. Inserts up to the limit still work.",
    hints: [
      "Every key here lands in the same bucket. What stops that chain from growing forever?",
      "Compare the current bucket length against MAX_CHAIN_LENGTH before appending.",
      "If it's already at the limit, raise BucketOverflowError instead of appending.",
    ],
    language: "python",
    file: "challenge6_collision_dos.py",
    testCommand: "pytest tests/test_challenge6.py -v",
    lessonAnchor: "pattern-5",
    starterCode: String.raw`MAX_CHAIN_LENGTH = 4


class BucketOverflowError(Exception):
    pass


class HashEntry:
    def __init__(self, key, value):
        self.key = key
        self.value = value


class SecureHashTable:
    def __init__(self):
        self.bucket = []


def insert_entry(table, key, value):
    table.bucket.append(HashEntry(key, value))`,
    tests: String.raw`def build_table():
    t = chal.SecureHashTable()
    for i in range(chal.MAX_CHAIN_LENGTH):
        chal.insert_entry(t, "key" + str(i), "value" + str(i))
    return t

def test_insertions_up_to_limit_succeed():
    t = build_table()
    assert len(t.bucket) == chal.MAX_CHAIN_LENGTH

def test_exceeding_chain_limit_is_rejected():
    t = build_table()
    with raises(chal.BucketOverflowError):
        chal.insert_entry(t, "extra", "value")

def test_overflow_entry_not_inserted():
    t = build_table()
    try:
        chal.insert_entry(t, "extra", "value")
    except chal.BucketOverflowError:
        pass
    assert len(t.bucket) == chal.MAX_CHAIN_LENGTH`,
    solution: {
      code: String.raw`def insert_entry(table, key, value):
    if len(table.bucket) >= MAX_CHAIN_LENGTH:
        raise BucketOverflowError("Collision chain too long.")
    table.bucket.append(HashEntry(key, value))`,
      explanation: [
        "The bug: insert_entry() appends with no limit, so an attacker can pile colliding keys into one bucket and degrade every lookup.",
        "The fix: before appending, check whether the bucket already holds MAX_CHAIN_LENGTH entries.",
        "If so, raise BucketOverflowError; the chain is capped and the collision flood is rejected.",
      ],
    },
  },
  {
    id: "ht-metadata-leakage",
    name: "Hash Table Metadata Leakage",
    points: 50,
    vulnerability: "Internal bucket structure exposed",
    background:
      "export() should reveal the table's logical contents — but here it returns the raw bucket array, exposing empty buckets and internal book-keeping entries (like deleted-entry markers) that callers should never see.",
    task: "Fix export() so it returns a flat list of (key, value) tuples for the real entries only — skipping any internal marker entry whose key is \"__DELETED__\", and never exposing the bucket structure.",
    hints: [
      "export() returns self.buckets — the nested bucket lists, warts and all. What do callers actually need?",
      "Flatten the buckets into a single list of (key, value) pairs.",
      "Skip entries whose key is \"__DELETED__\" so internal markers don't leak.",
    ],
    language: "python",
    file: "challenge7_hashtable_metadata_leakage.py",
    testCommand: "pytest tests/test_challenge7.py -v",
    lessonAnchor: "pattern-6",
    starterCode: String.raw`class HashEntry:
    def __init__(self, key, value):
        self.key = key
        self.value = value


class SecureHashTable:
    def __init__(self):
        self.buckets = [[], [], [], []]

    def insert(self, bucket, key, value):
        self.buckets[bucket].append(HashEntry(key, value))

    def export(self):
        return self.buckets`,
    tests: String.raw`def build_table():
    t = chal.SecureHashTable()
    t.insert(0, "alice", "AliceSecret")
    t.insert(2, "bob", "BobSecret")
    t.buckets[3].append(chal.HashEntry("__DELETED__", "PayrollDatabase"))
    return t

def test_export_returns_active_entries():
    exported = build_table().export()
    assert ("alice", "AliceSecret") in exported
    assert ("bob", "BobSecret") in exported

def test_export_is_a_flat_list_of_tuples():
    exported = build_table().export()
    assert isinstance(exported, list)
    assert all(isinstance(x, tuple) for x in exported)

def test_internal_markers_not_exposed():
    exported = build_table().export()
    assert ("__DELETED__", "PayrollDatabase") not in exported
    assert "PayrollDatabase" not in str(exported)`,
    solution: {
      code: String.raw`def export(self):
    active = []
    for bucket in self.buckets:
        for entry in bucket:
            if entry.key != "__DELETED__":
                active.append((entry.key, entry.value))
    return active`,
      explanation: [
        "The bug: export() returns self.buckets — the internal nested structure, including empty buckets and __DELETED__ marker entries.",
        "The fix: flatten the buckets into a list of (key, value) tuples, skipping any entry whose key is __DELETED__.",
        "Callers get exactly the logical contents, with no internal structure or markers leaked.",
      ],
    },
  },
  {
    id: "concurrent-rehash",
    name: "Concurrent Rehash",
    points: 75,
    vulnerability: "Unsynchronized resize/rehash race",
    background:
      "When the load factor gets high, the table doubles its buckets and rehashes every entry. insert() does this with no synchronization, so if two threads trigger a resize at once, entries can be lost, duplicated, or placed in the wrong bucket. A lock exists but is never used.",
    task: "Fix insert() so the whole insert-and-rehash sequence runs under self.lock, keeping the table consistent under concurrent access. Single-threaded inserts and rehashing must still work.",
    hints: [
      "The SecureHashTable has a self.lock, but insert() rebuilds self.buckets and updates self.count without taking it.",
      "The resize-rehash-and-write sequence is one critical section that must not interleave with another thread's.",
      "Wrap the body of insert() in `with self.lock:`.",
    ],
    language: "python",
    file: "challenge8_concurrent_rehash.py",
    testCommand: "pytest tests/test_challenge8.py -v",
    lessonAnchor: "pattern-5",
    starterCode: String.raw`import threading


class HashEntry:
    def __init__(self, key, value):
        self.key = key
        self.value = value


class SecureHashTable:
    def __init__(self):
        self.buckets = [[], []]
        self.count = 0
        self.lock = threading.Lock()

    def _bucket(self, key):
        return hash(key) % len(self.buckets)

    def insert(self, key, value):
        if self.count >= len(self.buckets):
            new_buckets = [[] for _ in range(len(self.buckets) * 2)]
            for bucket in self.buckets:
                for entry in bucket:
                    index = hash(entry.key) % len(new_buckets)
                    new_buckets[index].append(entry)
            self.buckets = new_buckets
        index = self._bucket(key)
        self.buckets[index].append(HashEntry(key, value))
        self.count += 1`,
    tests: String.raw`def test_single_thread_inserts():
    t = chal.SecureHashTable()
    for i in range(10):
        t.insert("k" + str(i), i)
    assert t.count == 10

def test_table_rehashes_and_keeps_every_entry():
    t = chal.SecureHashTable()
    for i in range(20):
        t.insert("k" + str(i), i)
    assert t.count == 20
    total = sum(len(b) for b in t.buckets)
    assert total == 20

def test_insert_runs_under_the_lock():
    t = chal.SecureHashTable()
    counter = {"n": 0}
    real = t.lock
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
    t.lock = Tracked()
    t.insert("x", 1)
    assert counter["n"] >= 1, "insert() must run under self.lock"`,
    solution: {
      code: String.raw`def insert(self, key, value):
    with self.lock:
        if self.count >= len(self.buckets):
            new_buckets = [[] for _ in range(len(self.buckets) * 2)]
            for bucket in self.buckets:
                for entry in bucket:
                    index = hash(entry.key) % len(new_buckets)
                    new_buckets[index].append(entry)
            self.buckets = new_buckets
        index = self._bucket(key)
        self.buckets[index].append(HashEntry(key, value))
        self.count += 1`,
      explanation: [
        "The bug: insert() resizes, rehashes, and updates self.count with no synchronization, so concurrent inserts can corrupt the table during a resize.",
        "The fix: wrap the entire insert-and-rehash body in `with self.lock:`.",
        "Only one thread can resize or write at a time, so every entry ends up in exactly one bucket and the count stays correct.",
      ],
    },
  },
];
