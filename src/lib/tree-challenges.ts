import type { Challenge } from "./modules";

// The 8 Tree Security & Privacy challenges — same shape as the other modules.
// Starter code is the vulnerable version with the giveaway comments stripped;
// solutions are revealed only on request. Helper functions the tests call
// (build_demo_tree, verify_tree, …) are kept in the starter.

export const treeChallenges: Challenge[] = [
  {
    id: "path-traversal",
    name: "Tree Path Traversal",
    points: 75,
    vulnerability: "Directory traversal (../ escape)",
    background:
      "Files live in a directory tree, and open_path() walks it from a supplied root. It follows every `..` blindly — so a path like ../../etc/passwd climbs right out of the intended root and reaches files it never should.",
    task: "Fix open_path() so traversal can never climb above the supplied root: a `..` that would escape raises PathTraversalError. Normal paths, empty paths, and missing paths must still behave as before.",
    hints: [
      "The loop follows `..` to current.parent whenever it can. What's missing is a boundary — when should `..` be refused?",
      "The `root` argument is the boundary. If you're already at root and see `..`, that step escapes.",
      "When part == \"..\" and current is root, raise PathTraversalError instead of moving to the parent.",
    ],
    language: "python",
    file: "challenge1_path_traversal.py",
    testCommand: "pytest tests/test_challenge1.py -v",
    lessonAnchor: "pattern-1",
    starterCode: String.raw`class PathTraversalError(Exception):
    pass


class Directory:
    def __init__(self, name):
        self.name = name
        self.children = {}
        self.parent = None

    def add_child(self, child):
        child.parent = self
        self.children[child.name] = child


def open_path(root, path):
    current = root
    if path == "":
        return current
    parts = [p for p in path.split("/") if p]
    for part in parts:
        if part == "..":
            if current.parent is not None:
                current = current.parent
        else:
            if part not in current.children:
                raise FileNotFoundError(part)
            current = current.children[part]
    return current


def build_demo_tree():
    root = Directory("root")
    docs = Directory("docs")
    photos = Directory("photos")
    report = Directory("report.txt")
    root.add_child(docs)
    root.add_child(photos)
    docs.add_child(report)
    return root`,
    tests: String.raw`def test_normal_path_still_works():
    root = chal.build_demo_tree()
    assert chal.open_path(root, "docs/report.txt").name == "report.txt"

def test_empty_path_returns_root():
    root = chal.build_demo_tree()
    assert chal.open_path(root, "") is root

def test_missing_path_raises():
    root = chal.build_demo_tree()
    with raises(FileNotFoundError):
        chal.open_path(root, "docs/missing.txt")

def test_path_traversal_attack_is_rejected():
    root = chal.build_demo_tree()
    with raises(chal.PathTraversalError):
        chal.open_path(root, "../../docs/report.txt")

def test_repeated_parents_are_rejected():
    root = chal.build_demo_tree()
    with raises(chal.PathTraversalError):
        chal.open_path(root, "../../../../../../docs/report.txt")`,
    solution: {
      code: String.raw`def open_path(root, path):
    current = root
    if path == "":
        return current
    parts = [p for p in path.split("/") if p]
    for part in parts:
        if part == "..":
            if current is root:
                raise PathTraversalError("Cannot escape the root.")
            current = current.parent
        else:
            if part not in current.children:
                raise FileNotFoundError(part)
            current = current.children[part]
    return current`,
      explanation: [
        "The bug: open_path() follows `..` up to the parent whenever one exists, with no notion of a boundary — so it can climb above the intended root.",
        "The fix: treat the supplied `root` as the ceiling. When you see `..` and current is already root, raise PathTraversalError.",
        "Legitimate `..` moves within the tree still work; only escapes above the root are blocked.",
      ],
    },
  },
  {
    id: "stale-permissions",
    name: "Stale Permission Metadata",
    points: 50,
    vulnerability: "Permission metadata surviving deletion",
    background:
      "Directories carry permission metadata. delete_directory() unlinks a node from the tree but leaves its permission string intact — so anyone holding a reference to the “deleted” node can still read what access it once had.",
    task: "Fix delete_directory() so the removed node no longer exposes its permission (set it to None) before it's unlinked. Deletion still returns the node, and deleting a missing directory still raises KeyError.",
    hints: [
      "delete_directory() removes the node from parent.children — but what does the returned node still contain?",
      "The sensitive field is node.permission; it survives the deletion untouched.",
      "Set node.permission = None before (or right after) removing it from the tree.",
    ],
    language: "python",
    file: "challenge2_stale_permissions.py",
    testCommand: "pytest tests/test_challenge2.py -v",
    lessonAnchor: "pattern-2",
    starterCode: String.raw`class Directory:
    def __init__(self, name, permission):
        self.name = name
        self.permission = permission
        self.parent = None
        self.children = {}

    def add_child(self, child):
        child.parent = self
        self.children[child.name] = child


def delete_directory(parent, name):
    if name not in parent.children:
        raise KeyError(name)
    node = parent.children[name]
    del parent.children[name]
    return node


def build_demo_tree():
    root = Directory("root", "rwx")
    finance = Directory("finance", "admin-only")
    payroll = Directory("payroll", "top-secret")
    root.add_child(finance)
    finance.add_child(payroll)
    return root`,
    tests: String.raw`def test_delete_returns_removed_node():
    root = chal.build_demo_tree()
    finance = root.children["finance"]
    deleted = chal.delete_directory(finance, "payroll")
    assert deleted.name == "payroll"
    assert "payroll" not in finance.children

def test_deleting_missing_directory_raises():
    root = chal.build_demo_tree()
    finance = root.children["finance"]
    with raises(KeyError):
        chal.delete_directory(finance, "missing")

def test_permission_metadata_is_erased():
    root = chal.build_demo_tree()
    finance = root.children["finance"]
    deleted = chal.delete_directory(finance, "payroll")
    assert deleted.permission is None, "Permission metadata survived deletion"

def test_deleted_directory_does_not_leak_old_permission():
    root = chal.build_demo_tree()
    finance = root.children["finance"]
    deleted = chal.delete_directory(finance, "payroll")
    assert "top-secret" not in str(deleted.permission)`,
    solution: {
      code: String.raw`def delete_directory(parent, name):
    if name not in parent.children:
        raise KeyError(name)
    node = parent.children[name]
    node.permission = None     # wipe sensitive metadata before removing
    del parent.children[name]
    return node`,
      explanation: [
        "The bug: delete_directory() removes the node from the tree but leaves node.permission intact, so a leftover reference still reveals it.",
        "The fix: set node.permission = None before unlinking the node.",
        "Deletion still returns the node and still raises KeyError for a missing name — but the old permission is gone.",
      ],
    },
  },
  {
    id: "acl-inheritance",
    name: "ACL Inheritance Bypass",
    points: 60,
    vulnerability: "Permissions reset instead of inherited",
    background:
      "Every directory should inherit its parent's access level. create_child() always stamps new directories PUBLIC instead — so a folder created under an ADMIN directory silently becomes world-readable.",
    task: "Fix create_child() so a new child inherits its parent's permission. Children under a PUBLIC parent stay PUBLIC; children under ADMIN become ADMIN; sensitive subtrees must never fall back to PUBLIC.",
    hints: [
      "create_child() hard-codes PUBLIC. Where could it get the correct permission from instead?",
      "The parent already has a .permission — that's what the child should adopt.",
      "Build the child with parent.permission rather than the fixed PUBLIC value.",
    ],
    language: "python",
    file: "challenge3_acl_inheritance.py",
    testCommand: "pytest tests/test_challenge3.py -v",
    lessonAnchor: "pattern-3",
    starterCode: String.raw`PUBLIC = "public"
ADMIN = "admin"


class Directory:
    def __init__(self, name, permission=PUBLIC):
        self.name = name
        self.permission = permission
        self.parent = None
        self.children = {}

    def add_child(self, child):
        child.parent = self
        self.children[child.name] = child


def create_child(parent, name):
    child = Directory(name, PUBLIC)
    parent.add_child(child)
    return child`,
    tests: String.raw`def test_child_is_added_to_parent():
    root = chal.Directory("root", chal.ADMIN)
    child = chal.create_child(root, "finance")
    assert child is root.children["finance"]
    assert child.parent is root

def test_public_parent_still_supported():
    root = chal.Directory("root", chal.PUBLIC)
    child = chal.create_child(root, "docs")
    assert child.permission == chal.PUBLIC

def test_child_inherits_parent_permission():
    root = chal.Directory("root", chal.ADMIN)
    child = chal.create_child(root, "finance")
    assert child.permission == chal.ADMIN, "Child did not inherit the parent's permission"

def test_sensitive_subtree_does_not_become_public():
    root = chal.Directory("root", chal.ADMIN)
    finance = chal.create_child(root, "finance")
    payroll = chal.create_child(finance, "payroll")
    assert payroll.permission != chal.PUBLIC, "Sensitive subtree became public"`,
    solution: {
      code: String.raw`def create_child(parent, name):
    child = Directory(name, parent.permission)   # inherit, don't reset
    parent.add_child(child)
    return child`,
      explanation: [
        "The bug: create_child() always constructs the child with PUBLIC, discarding the parent's access level.",
        "The fix: pass parent.permission when constructing the child so it inherits correctly.",
        "Now a folder under an ADMIN directory is ADMIN, and sensitive subtrees never silently become public.",
      ],
    },
  },
  {
    id: "tree-duplicate-node",
    name: "Duplicate Node Insertion",
    points: 50,
    vulnerability: "Duplicate children overwrite / replay",
    background:
      "Each task should appear once under a parent. insert_node() adds children blindly, so a replayed request adds a second child with the same name — overwriting the original and causing duplicate execution.",
    task: "Fix insert_node() so inserting a child whose name already exists under that parent raises DuplicateNodeError, and the original child is left untouched. New, unique names still insert normally.",
    hints: [
      "insert_node() writes straight into parent.children by name. What happens if that name is already a key?",
      "Check whether child.name is already in parent.children before inserting.",
      "If it is, raise DuplicateNodeError before overwriting anything.",
    ],
    language: "python",
    file: "challenge4_duplicate_node.py",
    testCommand: "pytest tests/test_challenge4.py -v",
    lessonAnchor: "pattern-4",
    starterCode: String.raw`class DuplicateNodeError(Exception):
    pass


class TreeNode:
    def __init__(self, name):
        self.name = name
        self.parent = None
        self.children = {}


def insert_node(parent, child):
    child.parent = parent
    parent.children[child.name] = child


def traverse(node):
    result = [node.name]
    for child in node.children.values():
        result.extend(traverse(child))
    return result`,
    tests: String.raw`def test_unique_child_is_inserted():
    root = chal.TreeNode("root")
    chal.insert_node(root, chal.TreeNode("A"))
    assert "A" in root.children

def test_duplicate_child_is_rejected():
    root = chal.TreeNode("root")
    chal.insert_node(root, chal.TreeNode("Build"))
    with raises(chal.DuplicateNodeError):
        chal.insert_node(root, chal.TreeNode("Build"))

def test_original_child_not_overwritten():
    root = chal.TreeNode("root")
    first = chal.TreeNode("Build")
    chal.insert_node(root, first)
    try:
        chal.insert_node(root, chal.TreeNode("Build"))
    except chal.DuplicateNodeError:
        pass
    assert root.children["Build"] is first, "Duplicate overwrote the original node"`,
    solution: {
      code: String.raw`def insert_node(parent, child):
    if child.name in parent.children:
        raise DuplicateNodeError(child.name)
    child.parent = parent
    parent.children[child.name] = child`,
      explanation: [
        "The bug: insert_node() assigns parent.children[child.name] directly, so a repeat name silently overwrites the existing child.",
        "The fix: check whether child.name is already present before inserting.",
        "If it is, raise DuplicateNodeError; the original node stays in place and replays are rejected.",
      ],
    },
  },
  {
    id: "tree-poisoning",
    name: "Tree Poisoning",
    points: 60,
    vulnerability: "Untrusted node type injection",
    background:
      "A config tree loaded from an untrusted source should only hold approved node types (folder, file). insert_node() accepts any type, so an attacker can inject a rogue node — like an `execute` command — into the trusted structure.",
    task: "Fix insert_node() so only nodes whose type is in VALID_TYPES are inserted; anything else raises InvalidNodeError and never enters the tree. Valid nodes still insert normally.",
    hints: [
      "insert_node() never looks at child.node_type. Which types should actually be allowed?",
      "There's a VALID_TYPES set. Compare the incoming node's type against it before inserting.",
      "Read it defensively with getattr(child, \"node_type\", None) and raise InvalidNodeError if it isn't allowed.",
    ],
    language: "python",
    file: "challenge5_tree_poisoning.py",
    testCommand: "pytest tests/test_challenge5.py -v",
    lessonAnchor: "pattern-4",
    starterCode: String.raw`VALID_TYPES = {"folder", "file"}


class InvalidNodeError(Exception):
    pass


class TreeNode:
    def __init__(self, name, node_type):
        self.name = name
        self.node_type = node_type
        self.parent = None
        self.children = {}


def insert_node(parent, child):
    child.parent = parent
    parent.children[child.name] = child`,
    tests: String.raw`def test_valid_node_is_inserted():
    root = chal.TreeNode("config", "folder")
    chal.insert_node(root, chal.TreeNode("settings", "folder"))
    assert "settings" in root.children

def test_invalid_node_type_is_rejected():
    root = chal.TreeNode("config", "folder")
    with raises(chal.InvalidNodeError):
        chal.insert_node(root, chal.TreeNode("execute", "command"))

def test_invalid_node_never_enters_tree():
    root = chal.TreeNode("config", "folder")
    try:
        chal.insert_node(root, chal.TreeNode("execute", "command"))
    except chal.InvalidNodeError:
        pass
    assert "execute" not in root.children`,
    solution: {
      code: String.raw`def insert_node(parent, child):
    if getattr(child, "node_type", None) not in VALID_TYPES:
        raise InvalidNodeError("Unauthorized node type.")
    child.parent = parent
    parent.children[child.name] = child`,
      explanation: [
        "The bug: insert_node() stores any node regardless of its type, so an unexpected node type can poison the tree.",
        "The fix: check the incoming node's node_type against VALID_TYPES before inserting.",
        "Anything not on the allow-list raises InvalidNodeError and is kept out of the tree entirely.",
      ],
    },
  },
  {
    id: "recursive-dos",
    name: "Recursive Traversal DoS",
    points: 60,
    vulnerability: "Unbounded recursion → stack exhaustion",
    background:
      "count_nodes() recurses through the tree with no depth limit. An attacker who supplies an extremely deep tree can exhaust the call stack and crash the program with a RecursionError.",
    task: "Fix count_nodes() so it refuses to recurse beyond MAX_DEPTH, raising TraversalDepthError. Trees up to MAX_DEPTH deep must still count correctly.",
    hints: [
      "count_nodes() carries a depth argument but never checks it. What should happen when depth gets too large?",
      "Compare depth against MAX_DEPTH at the start of the call.",
      "If depth exceeds MAX_DEPTH, raise TraversalDepthError instead of recursing further.",
    ],
    language: "python",
    file: "challenge6_recursive_dos.py",
    testCommand: "pytest tests/test_challenge6.py -v",
    lessonAnchor: "pattern-5",
    starterCode: String.raw`MAX_DEPTH = 100


class TraversalDepthError(Exception):
    pass


class TreeNode:
    def __init__(self, name):
        self.name = name
        self.children = []

    def add_child(self, child):
        self.children.append(child)


def count_nodes(node, depth=0):
    total = 1
    for child in node.children:
        total += count_nodes(child, depth + 1)
    return total


def build_deep_tree(depth):
    root = TreeNode("root")
    current = root
    for i in range(depth):
        child = TreeNode(f"node_{i}")
        current.add_child(child)
        current = child
    return root`,
    tests: String.raw`def test_small_tree_counts_correctly():
    root = chal.TreeNode("root")
    root.add_child(chal.TreeNode("A"))
    root.add_child(chal.TreeNode("B"))
    assert chal.count_nodes(root) == 3

def test_tree_at_max_depth_is_allowed():
    root = chal.build_deep_tree(chal.MAX_DEPTH)
    assert chal.count_nodes(root) == chal.MAX_DEPTH + 1

def test_tree_exceeding_max_depth_is_rejected():
    root = chal.build_deep_tree(chal.MAX_DEPTH + 1)
    with raises(chal.TraversalDepthError):
        chal.count_nodes(root)

def test_deep_tree_does_not_crash():
    root = chal.build_deep_tree(500)
    with raises(chal.TraversalDepthError):
        chal.count_nodes(root)`,
    solution: {
      code: String.raw`def count_nodes(node, depth=0):
    if depth > MAX_DEPTH:
        raise TraversalDepthError("Traversal depth exceeded.")
    total = 1
    for child in node.children:
        total += count_nodes(child, depth + 1)
    return total`,
      explanation: [
        "The bug: count_nodes() recurses one level per node with no depth ceiling, so a very deep tree exhausts the call stack and crashes.",
        "The fix: at the top of each call, check whether depth has passed MAX_DEPTH.",
        "If so, raise TraversalDepthError. Trees up to MAX_DEPTH still count; deeper ones are rejected before Python crashes.",
      ],
    },
  },
  {
    id: "tree-metadata-leakage",
    name: "Tree Metadata Leakage",
    points: 50,
    vulnerability: "Over-exposed internal fields",
    background:
      "A directory tree is exposed through an API where users should see only directory names. export_tree() dumps owner, permission, and inode for every node — handing attackers a map of the underlying system.",
    task: "Fix export_tree() so each exported node contains only its name and its children, never owner, permission, or inode. The hierarchy must be preserved.",
    hints: [
      "Look at the dictionary export_tree() builds — which of those keys are internal system details?",
      "Keep name and the recursive children list; drop owner, permission, and inode.",
      "Return {\"name\": node.name, \"children\": [...]} and nothing else.",
    ],
    language: "python",
    file: "challenge7_tree_metadata_leakage.py",
    testCommand: "pytest tests/test_challenge7.py -v",
    lessonAnchor: "pattern-6",
    starterCode: String.raw`class TreeNode:
    def __init__(self, name, owner, permission, inode):
        self.name = name
        self.owner = owner
        self.permission = permission
        self.inode = inode
        self.children = []

    def add_child(self, child):
        self.children.append(child)


def export_tree(node):
    return {
        "name": node.name,
        "owner": node.owner,
        "permission": node.permission,
        "inode": node.inode,
        "children": [export_tree(child) for child in node.children],
    }


def build_demo_tree():
    root = TreeNode("Company", owner="admin", permission="internal", inode=1)
    hr = TreeNode("HR", owner="alice", permission="confidential", inode=2)
    payroll = TreeNode("Payroll", owner="bob", permission="top-secret", inode=3)
    root.add_child(hr)
    hr.add_child(payroll)
    return root`,
    tests: String.raw`def test_tree_structure_is_preserved():
    e = chal.export_tree(chal.build_demo_tree())
    assert e["name"] == "Company"
    assert e["children"][0]["name"] == "HR"
    assert e["children"][0]["children"][0]["name"] == "Payroll"

def test_leaf_exports_with_empty_children():
    leaf = chal.TreeNode("Leaf", owner="alice", permission="private", inode=42)
    e = chal.export_tree(leaf)
    assert e["name"] == "Leaf"
    assert e["children"] == []

def test_sensitive_metadata_not_exported():
    e = chal.export_tree(chal.build_demo_tree())
    assert "owner" not in e
    assert "permission" not in e
    assert "inode" not in e

def test_attacker_cannot_recover_metadata():
    leaked = str(chal.export_tree(chal.build_demo_tree()))
    assert "top-secret" not in leaked, "Permission leaked in export"`,
    solution: {
      code: String.raw`def export_tree(node):
    return {
        "name": node.name,
        "children": [export_tree(child) for child in node.children],
    }`,
      explanation: [
        "The bug: export_tree() copies owner, permission, and inode into every exported node, exposing internal system details.",
        "The fix: build each record with only the public name plus the recursively exported children.",
        "The hierarchy is preserved, but the internal metadata never leaves the server.",
      ],
    },
  },
  {
    id: "merkle-tampering",
    name: "Merkle Tree Tampering",
    points: 75,
    vulnerability: "Ancestor hashes not recomputed",
    background:
      "In a Merkle tree, every internal node's hash is built from its children's hashes, so any change bubbles up to the root. update_leaf() changes a leaf but only re-hashes that leaf — the ancestors keep their old hashes, so the tree still “verifies” even though it was tampered with.",
    task: "Fix update_leaf() so that after a leaf changes, every ancestor's hash up to the root is recomputed. verify_tree() must pass afterward, and the root hash must change so tampering is detectable. Use the recompute() helper.",
    hints: [
      "update_leaf() recomputes the leaf's own hash — but each ancestor's hash was built from the OLD child hash. Are they still right?",
      "A change at a leaf must propagate upward: the parent, its parent, all the way to the root.",
      "After updating the leaf, walk up via node.parent calling recompute() on each node until you pass the root.",
    ],
    language: "python",
    file: "challenge8_merkle_tree_tampering.py",
    testCommand: "pytest tests/test_challenge8.py -v",
    lessonAnchor: "pattern-6",
    starterCode: String.raw`import hashlib


def compute_hash(value):
    return hashlib.sha256(value.encode()).hexdigest()


class TreeNode:
    def __init__(self, value):
        self.value = value
        self.hash = compute_hash(value)
        self.parent = None
        self.children = []

    def add_child(self, child):
        child.parent = self
        self.children.append(child)


def recompute(node):
    if not node.children:
        node.hash = compute_hash(node.value)
        return
    combined = ""
    for child in node.children:
        combined += child.hash
    node.hash = compute_hash(combined)


def update_leaf(node, new_value):
    node.value = new_value
    recompute(node)


def verify_tree(node):
    if not node.children:
        return node.hash == compute_hash(node.value)
    for child in node.children:
        if not verify_tree(child):
            return False
    combined = ""
    for child in node.children:
        combined += child.hash
    return compute_hash(combined) == node.hash


def build_demo_tree():
    root = TreeNode("")
    left = TreeNode("Alice")
    right = TreeNode("Bob")
    root.add_child(left)
    root.add_child(right)
    recompute(root)
    return root, left, right`,
    tests: String.raw`def test_initial_tree_is_valid():
    root, left, right = chal.build_demo_tree()
    assert chal.verify_tree(root) is True

def test_leaf_value_is_updated():
    root, left, right = chal.build_demo_tree()
    chal.update_leaf(left, "Mallory")
    assert left.value == "Mallory"

def test_tree_remains_valid_after_update():
    root, left, right = chal.build_demo_tree()
    chal.update_leaf(left, "Mallory")
    assert chal.verify_tree(root) is True, "Merkle tree became inconsistent after a leaf update"

def test_root_hash_changes_after_update():
    root, left, right = chal.build_demo_tree()
    old = root.hash
    chal.update_leaf(left, "Mallory")
    assert root.hash != old, "Root hash unchanged — tampering would go undetected"`,
    solution: {
      code: String.raw`def update_leaf(node, new_value):
    node.value = new_value
    current = node
    while current:              # walk up to the root
        recompute(current)
        current = current.parent`,
      explanation: [
        "The bug: update_leaf() re-hashes only the changed leaf, so every ancestor keeps a hash built from the old value and the tree still appears valid.",
        "The fix: after changing the leaf, walk upward through node.parent, calling recompute() on each node until you pass the root.",
        "Now the change propagates to the root: verify_tree() passes for the new state and the root hash changes, so real tampering is still caught.",
      ],
    },
  },
];
