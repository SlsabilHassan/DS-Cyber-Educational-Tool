import type { Challenge } from "./modules";

// The 8 Graph Security & Privacy challenges — same shape as the other modules.
// Starter code is the vulnerable version with the giveaway comments stripped;
// solutions are revealed only on request.

export const graphChallenges: Challenge[] = [
  {
    id: "graph-pointer-corruption",
    name: "Graph Pointer Corruption",
    points: 60,
    vulnerability: "Untrusted node in adjacency list",
    background:
      "A graph connects trusted nodes through adjacency lists (edges). link_nodes() appends whatever node it's handed, so an attacker can splice a fake node into a neighbor list and make it reachable through normal traversal.",
    task: "Fix link_nodes() so only a node carrying the genuine VALID marker gets added as a neighbor; anything else raises InvalidPointerError before the adjacency list changes.",
    hints: [
      "Every real node sets self.marker = VALID. Does link_nodes() check that before appending?",
      "Read it defensively with getattr(next_node, \"marker\", None).",
      "If it isn't VALID, raise InvalidPointerError before the append.",
    ],
    language: "python",
    file: "challenge1_graph_pointer_corruption.py",
    testCommand: "pytest tests/test_challenge1.py -v",
    lessonAnchor: "pattern-1",
    starterCode: String.raw`VALID = "VALID"


class InvalidPointerError(Exception):
    pass


class GraphNode:
    def __init__(self, node_id, secret):
        self.node_id = node_id
        self.secret = secret
        self.marker = VALID
        self.neighbors = []


def link_nodes(current, next_node):
    current.neighbors.append(next_node)`,
    tests: String.raw`def test_valid_node_is_linked():
    a = chal.GraphNode("Alice", "s1"); b = chal.GraphNode("Bob", "s2")
    chal.link_nodes(a, b)
    assert b in a.neighbors

def test_untrusted_node_is_rejected():
    a = chal.GraphNode("Alice", "s1")
    class FakeNode:
        def __init__(self):
            self.node_id = "Mallory"; self.secret = "x"; self.marker = "EVIL"; self.neighbors = []
    with raises(chal.InvalidPointerError):
        chal.link_nodes(a, FakeNode())

def test_untrusted_node_never_added():
    a = chal.GraphNode("Alice", "s1")
    class FakeNode:
        def __init__(self):
            self.node_id = "Mallory"; self.secret = "x"; self.marker = "EVIL"; self.neighbors = []
    fake = FakeNode()
    try:
        chal.link_nodes(a, fake)
    except chal.InvalidPointerError:
        pass
    assert fake not in a.neighbors`,
    solution: {
      code: String.raw`def link_nodes(current, next_node):
    if getattr(next_node, "marker", None) != VALID:
        raise InvalidPointerError("Untrusted node rejected.")
    current.neighbors.append(next_node)`,
      explanation: [
        "The bug: link_nodes() appends any object to the neighbor list without confirming it's a genuine node.",
        "The fix: check getattr(next_node, \"marker\", None) == VALID before appending.",
        "Anything else raises InvalidPointerError and never becomes reachable in the graph.",
      ],
    },
  },
  {
    id: "stale-edges",
    name: "Stale Edges",
    points: 60,
    vulnerability: "Dangling edges after node removal",
    background:
      "When a node leaves a graph, every edge pointing at it should go too. remove_node() deletes the node from the graph's table but leaves other nodes still pointing at it — dangling references that can leak deleted data or misdirect traversal.",
    task: "Fix remove_node() so every edge referencing the removed node is deleted before the node itself is removed. Removing a missing node still raises NodeNotFoundError.",
    hints: [
      "remove_node() deletes graph.nodes[node_id] — but other nodes' neighbor lists may still contain that node.",
      "Before deleting, walk every node in the graph and drop the target from its neighbors.",
      "Rebuild each neighbor list without the removed node, e.g. [n for n in node.neighbors if n is not target].",
    ],
    language: "python",
    file: "challenge2_stale_edges.py",
    testCommand: "pytest tests/test_challenge2.py -v",
    lessonAnchor: "pattern-2",
    starterCode: String.raw`class NodeNotFoundError(Exception):
    pass


class GraphNode:
    def __init__(self, node_id, secret):
        self.node_id = node_id
        self.secret = secret
        self.neighbors = []


class Graph:
    def __init__(self):
        self.nodes = {}

    def add_node(self, node_id, secret):
        self.nodes[node_id] = GraphNode(node_id, secret)

    def add_edge(self, source, destination):
        self.nodes[source].neighbors.append(self.nodes[destination])


def remove_node(graph, node_id):
    if node_id not in graph.nodes:
        raise NodeNotFoundError(node_id)
    del graph.nodes[node_id]`,
    tests: String.raw`def build_graph():
    g = chal.Graph()
    g.add_node("Alice", "s1"); g.add_node("Bob", "s2"); g.add_node("Carol", "s3")
    g.add_edge("Alice", "Bob"); g.add_edge("Bob", "Carol")
    return g

def test_remove_existing_node():
    g = build_graph()
    chal.remove_node(g, "Bob")
    assert "Bob" not in g.nodes

def test_removing_unknown_node_raises():
    g = build_graph()
    with raises(chal.NodeNotFoundError):
        chal.remove_node(g, "Mallory")

def test_stale_edges_are_removed():
    g = build_graph()
    chal.remove_node(g, "Bob")
    assert len(g.nodes["Alice"].neighbors) == 0

def test_removed_node_not_reachable():
    g = build_graph()
    chal.remove_node(g, "Bob")
    for node in g.nodes.values():
        for nb in node.neighbors:
            assert nb.node_id != "Bob", "A stale edge to the removed node remains"`,
    solution: {
      code: String.raw`def remove_node(graph, node_id):
    if node_id not in graph.nodes:
        raise NodeNotFoundError(node_id)
    target = graph.nodes[node_id]
    for node in graph.nodes.values():
        node.neighbors = [n for n in node.neighbors if n is not target]
    del graph.nodes[node_id]`,
      explanation: [
        "The bug: remove_node() deletes the node from graph.nodes but leaves other nodes' neighbor lists still pointing at it.",
        "The fix: before deleting, walk every node and rebuild its neighbor list without the target.",
        "Now no dangling edge references the removed node, so it can't be reached or leak data.",
      ],
    },
  },
  {
    id: "trust-propagation",
    name: "Trust Propagation",
    points: 60,
    vulnerability: "Trust spreads across the whole graph",
    background:
      "A trusted node may vouch for its direct neighbors. propagate_trust() recurses through the entire reachable graph instead — so a long chain of connections lets a distant, unrelated node inherit trust it should never have.",
    task: "Fix propagate_trust() so it trusts the starting node and its DIRECT neighbors only — trust must not reach two or more hops away.",
    hints: [
      "propagate_trust() calls itself on every neighbor, which keeps flowing outward. How far should trust actually reach?",
      "Only the node and its immediate neighbors should be trusted — that's one hop, no recursion.",
      "Set node.trusted, then set each direct neighbor's trusted flag, and stop there.",
    ],
    language: "python",
    file: "challenge3_trust_propagation.py",
    testCommand: "pytest tests/test_challenge3.py -v",
    lessonAnchor: "pattern-3",
    starterCode: String.raw`class GraphNode:
    def __init__(self, node_id):
        self.node_id = node_id
        self.neighbors = []
        self.trusted = False


def propagate_trust(node):
    node.trusted = True
    for neighbor in node.neighbors:
        propagate_trust(neighbor)`,
    tests: String.raw`def build_graph():
    alice = chal.GraphNode("Alice"); bob = chal.GraphNode("Bob")
    carol = chal.GraphNode("Carol"); dave = chal.GraphNode("Dave")
    alice.neighbors.append(bob); bob.neighbors.append(carol); carol.neighbors.append(dave)
    return alice, bob, carol, dave

def test_source_node_becomes_trusted():
    alice, _, _, _ = build_graph()
    chal.propagate_trust(alice)
    assert alice.trusted is True

def test_direct_neighbor_becomes_trusted():
    alice, bob, _, _ = build_graph()
    chal.propagate_trust(alice)
    assert bob.trusted is True

def test_trust_does_not_propagate_beyond_one_hop():
    alice, _, carol, dave = build_graph()
    chal.propagate_trust(alice)
    assert carol.trusted is False
    assert dave.trusted is False`,
    solution: {
      code: String.raw`def propagate_trust(node):
    node.trusted = True
    for neighbor in node.neighbors:
        neighbor.trusted = True     # direct neighbors only, no recursion`,
      explanation: [
        "The bug: propagate_trust() recurses into every neighbor, so trust flows across the entire reachable graph.",
        "The fix: trust the node, then set the trusted flag on each direct neighbor without recursing further.",
        "Trust now stops at one hop, so distant nodes reachable only through a chain never gain access.",
      ],
    },
  },
  {
    id: "graph-duplicate-node",
    name: "Duplicate Node Insertion",
    points: 50,
    vulnerability: "Duplicate IDs overwrite nodes",
    background:
      "Nodes are keyed by a unique identifier. add_node() writes blindly into the node table, so an attacker can re-add an existing ID — overwriting the real node, destroying its edges, and impersonating it.",
    task: "Fix add_node() so adding a node whose ID already exists raises DuplicateNodeError and leaves the original node untouched. New, unique IDs still add normally.",
    hints: [
      "add_node() assigns graph.nodes[node_id] = ... . What happens if that key is already present?",
      "Check whether node_id is already in graph.nodes before creating the node.",
      "If it is, raise DuplicateNodeError before overwriting anything.",
    ],
    language: "python",
    file: "challenge4_duplicate_node.py",
    testCommand: "pytest tests/test_challenge4.py -v",
    lessonAnchor: "pattern-4",
    starterCode: String.raw`class DuplicateNodeError(Exception):
    pass


class GraphNode:
    def __init__(self, node_id, secret):
        self.node_id = node_id
        self.secret = secret
        self.neighbors = []


class Graph:
    def __init__(self):
        self.nodes = {}


def add_node(graph, node_id, secret):
    graph.nodes[node_id] = GraphNode(node_id, secret)`,
    tests: String.raw`def test_unique_node_is_added():
    g = chal.Graph()
    chal.add_node(g, "Alice", "s1")
    assert "Alice" in g.nodes

def test_duplicate_node_is_rejected():
    g = chal.Graph()
    chal.add_node(g, "Alice", "s1")
    with raises(chal.DuplicateNodeError):
        chal.add_node(g, "Alice", "evil")

def test_original_node_not_overwritten():
    g = chal.Graph()
    chal.add_node(g, "Alice", "s1")
    original = g.nodes["Alice"]
    try:
        chal.add_node(g, "Alice", "evil")
    except chal.DuplicateNodeError:
        pass
    assert g.nodes["Alice"] is original
    assert g.nodes["Alice"].secret == "s1"`,
    solution: {
      code: String.raw`def add_node(graph, node_id, secret):
    if node_id in graph.nodes:
        raise DuplicateNodeError(node_id)
    graph.nodes[node_id] = GraphNode(node_id, secret)`,
      explanation: [
        "The bug: add_node() assigns graph.nodes[node_id] directly, so re-adding an existing ID overwrites the real node and its edges.",
        "The fix: check whether node_id is already present before creating the node.",
        "If it is, raise DuplicateNodeError; the original node and its relationships stay intact.",
      ],
    },
  },
  {
    id: "graph-poisoning",
    name: "Graph Poisoning",
    points: 75,
    vulnerability: "Untrusted subgraph injection",
    background:
      "Graphs often accept whole subgraphs from other systems. attach_subgraph() bolts on a supplied subgraph without inspecting it — so a single untrusted node buried inside becomes reachable through the trusted graph.",
    task: "Fix attach_subgraph() so it validates every node in the incoming subgraph (each must carry the VALID marker) before attaching it; if any node is untrusted, raise GraphPoisoningError and attach nothing.",
    hints: [
      "attach_subgraph() only touches the subgraph's root. But the danger could be a node deep inside it.",
      "Walk the entire subgraph (following neighbors) and check every node's marker before attaching.",
      "If any node isn't VALID, raise GraphPoisoningError before the append — so a partially-bad subgraph never gets attached.",
    ],
    language: "python",
    file: "challenge5_graph_poisoning.py",
    testCommand: "pytest tests/test_challenge5.py -v",
    lessonAnchor: "pattern-1",
    starterCode: String.raw`VALID = "VALID"


class GraphPoisoningError(Exception):
    pass


class GraphNode:
    def __init__(self, node_id, secret):
        self.node_id = node_id
        self.secret = secret
        self.marker = VALID
        self.neighbors = []


def attach_subgraph(current, subgraph_root):
    current.neighbors.append(subgraph_root)`,
    tests: String.raw`def build_trusted_subgraph():
    carol = chal.GraphNode("Carol", "s3"); dave = chal.GraphNode("Dave", "s4")
    carol.neighbors.append(dave)
    return carol

def test_trusted_subgraph_is_accepted():
    root = chal.GraphNode("Alice", "s1")
    trusted = build_trusted_subgraph()
    chal.attach_subgraph(root, trusted)
    assert trusted in root.neighbors

def test_untrusted_subgraph_is_rejected():
    root = chal.GraphNode("Alice", "s1")
    good = chal.GraphNode("Carol", "s3")
    class FakeNode:
        def __init__(self):
            self.node_id = "Mallory"; self.secret = "x"; self.marker = "EVIL"; self.neighbors = []
    good.neighbors.append(FakeNode())
    with raises(chal.GraphPoisoningError):
        chal.attach_subgraph(root, good)

def test_untrusted_subgraph_never_attached():
    root = chal.GraphNode("Alice", "s1")
    class FakeNode:
        def __init__(self):
            self.node_id = "Mallory"; self.secret = "x"; self.marker = "EVIL"; self.neighbors = []
    fake = FakeNode()
    try:
        chal.attach_subgraph(root, fake)
    except chal.GraphPoisoningError:
        pass
    assert fake not in root.neighbors`,
    solution: {
      code: String.raw`def attach_subgraph(current, subgraph_root):
    seen = set()
    stack = [subgraph_root]
    while stack:
        node = stack.pop()
        if id(node) in seen:
            continue
        seen.add(id(node))
        if getattr(node, "marker", None) != VALID:
            raise GraphPoisoningError("Untrusted node in subgraph.")
        stack.extend(getattr(node, "neighbors", []))
    current.neighbors.append(subgraph_root)`,
      explanation: [
        "The bug: attach_subgraph() attaches the subgraph without checking the nodes inside it, so one untrusted node anywhere in it becomes reachable.",
        "The fix: walk the whole subgraph (depth-first) and confirm every node carries the VALID marker.",
        "If any node fails, raise GraphPoisoningError before attaching — so a subgraph is attached only when it's entirely trusted.",
      ],
    },
  },
  {
    id: "graph-traversal-dos",
    name: "Cyclic Traversal DoS",
    points: 60,
    vulnerability: "Cycle → infinite traversal",
    background:
      "Unlike trees, graphs can contain cycles. traverse() recurses into every neighbor but never records where it's been — so an attacker-introduced cycle makes it loop forever and exhaust resources.",
    task: "Rewrite traverse() so it returns the list of node ids it visits, visiting each node at most once — so a cycle no longer loops forever. Acyclic graphs must still return every node.",
    hints: [
      "traverse() revisits nodes it has already seen. What would let it recognise a node it already visited?",
      "Keep a set of visited node ids and skip any node already in it.",
      "Thread that visited set through the recursion (a default argument that's created on the first call works well).",
    ],
    language: "python",
    file: "challenge6_traversal_dos.py",
    testCommand: "pytest tests/test_challenge6.py -v",
    lessonAnchor: "pattern-5",
    starterCode: String.raw`class GraphNode:
    def __init__(self, node_id):
        self.node_id = node_id
        self.neighbors = []


def traverse(node):
    result = [node.node_id]
    for neighbor in node.neighbors:
        result.extend(traverse(neighbor))
    return result`,
    tests: String.raw`def build_cycle_graph():
    alice = chal.GraphNode("Alice"); bob = chal.GraphNode("Bob"); carol = chal.GraphNode("Carol")
    alice.neighbors.append(bob); bob.neighbors.append(carol); carol.neighbors.append(bob)
    return alice, bob, carol

def build_acyclic_graph():
    alice = chal.GraphNode("Alice"); bob = chal.GraphNode("Bob"); carol = chal.GraphNode("Carol")
    alice.neighbors.append(bob); bob.neighbors.append(carol)
    return alice, bob, carol

def test_single_node_traversal():
    alice = chal.GraphNode("Alice")
    assert chal.traverse(alice) == ["Alice"]

def test_acyclic_graph_visits_every_node():
    alice, _, _ = build_acyclic_graph()
    assert chal.traverse(alice) == ["Alice", "Bob", "Carol"]

def test_cyclic_graph_terminates_and_visits_once():
    alice, _, _ = build_cycle_graph()
    result = chal.traverse(alice)
    assert sorted(result) == ["Alice", "Bob", "Carol"]
    assert len(result) == 3, "A node was visited more than once"`,
    solution: {
      code: String.raw`def traverse(node, visited=None):
    if visited is None:
        visited = set()
    if node.node_id in visited:
        return []
    visited.add(node.node_id)
    result = [node.node_id]
    for neighbor in node.neighbors:
        result.extend(traverse(neighbor, visited))
    return result`,
      explanation: [
        "The bug: traverse() recurses into neighbors without remembering visited nodes, so a cycle loops forever.",
        "The fix: keep a `visited` set of node ids; if you reach a node already in it, stop instead of recursing.",
        "Thread that set through the recursion. Now every node is visited exactly once, and cycles terminate cleanly.",
      ],
    },
  },
  {
    id: "graph-metadata-leakage",
    name: "Graph Metadata Leakage",
    points: 50,
    vulnerability: "Over-exposed node metadata",
    background:
      "Graphs get exported for visualization or sharing. export_graph() dumps every attribute of every node — including secrets and internal IDs — when clients only need identifiers and connectivity.",
    task: "Fix export_graph() so each exported node contains only its node_id and the ids of its neighbors, never secret or internal_id.",
    hints: [
      "Look at the dictionary export_graph() builds per node — which fields are internal-only?",
      "Keep node_id and the list of neighbor ids; drop secret and internal_id.",
      "Return {\"node_id\": ..., \"neighbors\": [...]} for each node.",
    ],
    language: "python",
    file: "challenge7_graph_metadata_leakage.py",
    testCommand: "pytest tests/test_challenge7.py -v",
    lessonAnchor: "pattern-6",
    starterCode: String.raw`class GraphNode:
    def __init__(self, node_id, secret):
        self.node_id = node_id
        self.secret = secret
        self.internal_id = id(self)
        self.neighbors = []


def export_graph(nodes):
    exported = []
    for node in nodes:
        exported.append({
            "node_id": node.node_id,
            "secret": node.secret,
            "internal_id": node.internal_id,
            "neighbors": [neighbor.node_id for neighbor in node.neighbors],
        })
    return exported`,
    tests: String.raw`def build_nodes():
    a = chal.GraphNode("Alice", "AliceSecret")
    b = chal.GraphNode("Bob", "BobSecret")
    a.neighbors.append(b)
    return [a, b]

def test_export_returns_ids_and_neighbors():
    out = chal.export_graph(build_nodes())
    assert out[0]["node_id"] == "Alice"
    assert out[0]["neighbors"] == ["Bob"]

def test_secret_and_internal_id_not_exported():
    out = chal.export_graph(build_nodes())
    assert "secret" not in out[0]
    assert "internal_id" not in out[0]

def test_attacker_cannot_recover_secret():
    leaked = str(chal.export_graph(build_nodes()))
    assert "AliceSecret" not in leaked, "Node secret leaked in export"`,
    solution: {
      code: String.raw`def export_graph(nodes):
    exported = []
    for node in nodes:
        exported.append({
            "node_id": node.node_id,
            "neighbors": [neighbor.node_id for neighbor in node.neighbors],
        })
    return exported`,
      explanation: [
        "The bug: export_graph() copies every attribute — including secret and internal_id — into the exported data.",
        "The fix: build each record with only node_id and the list of neighbor ids.",
        "Connectivity is preserved for visualization, but the sensitive metadata never leaves the application.",
      ],
    },
  },
  {
    id: "graph-hash-tampering",
    name: "Graph Hash Tampering",
    points: 75,
    vulnerability: "Integrity hash not recomputed",
    background:
      "Each node stores an integrity hash of its id plus its neighbors' ids, so tampering with edges is detectable. add_edge() changes the edges but forgets to recompute the hash — leaving a stale hash that says the graph is untouched.",
    task: "Fix add_edge() so the source node's integrity hash is recomputed immediately after the edge is added. There's a compute_hash() method you can call.",
    hints: [
      "add_edge() appends to source.neighbors — but source.hash was computed from the OLD neighbor list. Is it still correct?",
      "Any change to a node's edges must be reflected in its stored hash.",
      "After appending, set source.hash = source.compute_hash().",
    ],
    language: "python",
    file: "challenge8_graph_hash_tampering.py",
    testCommand: "pytest tests/test_challenge8.py -v",
    lessonAnchor: "pattern-6",
    starterCode: String.raw`import hashlib


class GraphNode:
    def __init__(self, node_id):
        self.node_id = node_id
        self.neighbors = []
        self.hash = self.compute_hash()

    def compute_hash(self):
        data = self.node_id
        for neighbor in self.neighbors:
            data += neighbor.node_id
        return hashlib.sha256(data.encode()).hexdigest()


def add_edge(source, destination):
    source.neighbors.append(destination)`,
    tests: String.raw`def test_edge_is_added():
    a = chal.GraphNode("Alice"); b = chal.GraphNode("Bob")
    chal.add_edge(a, b)
    assert b in a.neighbors

def test_initial_hash_is_correct():
    a = chal.GraphNode("Alice")
    assert a.hash == a.compute_hash()

def test_hash_updates_after_edge_addition():
    a = chal.GraphNode("Alice"); b = chal.GraphNode("Bob")
    old = a.hash
    chal.add_edge(a, b)
    assert a.hash != old
    assert a.hash == a.compute_hash()

def test_tampering_cannot_leave_stale_hash():
    a = chal.GraphNode("Alice"); b = chal.GraphNode("Bob"); c = chal.GraphNode("Carol")
    chal.add_edge(a, b)
    chal.add_edge(a, c)
    assert a.hash == a.compute_hash(), "Stale integrity hash after modification"`,
    solution: {
      code: String.raw`def add_edge(source, destination):
    source.neighbors.append(destination)
    source.hash = source.compute_hash()   # refresh integrity hash`,
      explanation: [
        "The bug: add_edge() changes the neighbor list but leaves source.hash computed from the old edges, so tampering looks valid.",
        "The fix: after appending the edge, recompute the node's hash with source.compute_hash().",
        "Now the stored hash always matches the current edges, so any later mismatch reliably signals tampering.",
      ],
    },
  },
];
