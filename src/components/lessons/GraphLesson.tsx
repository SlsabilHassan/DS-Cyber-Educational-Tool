"use client";

import { ModuleLesson, Snippet, type Concept, type GlossaryItem } from "./lessonui";
import { GraphVisualizer } from "./interactives/GraphVisualizer";
import { TrustPropagationDemo } from "./interactives/TrustPropagationDemo";
import { CycleTraversalDemo } from "./interactives/CycleTraversalDemo";

export function GraphLesson() {
  return (
    <ModuleLesson
      slug="graph-gauntlet"
      title="What's a graph?"
      intro={
        <>
          <p>
            Think of a map of friendships, or a network of computers. Each
            person or machine is a <span className="text-fg">node</span>, and a
            connection between two of them is an <span className="text-fg">edge</span>
            . Unlike a tree, there&apos;s no single root and connections can loop
            back on each other.
          </p>
          <p>
            That&apos;s a graph: nodes joined by edges, in any shape. Social
            networks, package dependencies, road maps, and the trust between
            services are all graphs — and so is the map an attacker draws to
            move through a network.
          </p>
        </>
      }
      tryIt={
        <>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Try it yourself
          </h3>
          <p className="mt-2 text-sm text-muted">
            Hit traverse and watch the graph get explored node by node — each
            visited exactly once.
          </p>
          <div className="mt-4">
            <GraphVisualizer />
          </div>
          <div className="mt-4">
            <Snippet
              code={`graph = {
    "Alice": ["Bob", "Eve"],   # Alice is connected to Bob and Eve
    "Bob":   ["Carol"],
    "Carol": [],
}`}
            />
          </div>
        </>
      }
      patternsIntro={
        <>
          Graphs are powerful because anything can connect to anything — which
          is exactly why they need guardrails: what you connect, how far trust
          flows, and remembering where you&apos;ve been. Each idea pairs{" "}
          <span className="text-red-400">risky</span> code with a{" "}
          <span className="text-accent">safer</span> version.
        </>
      }
      concepts={CONCEPTS}
      glossary={GLOSSARY}
      closing="That's the toolkit. Now try the challenges below — and lean on the hints if you get stuck. ↓"
    />
  );
}

export const CONCEPTS: Concept[] = [
  {
    title: "Validate what you connect",
    analogy:
      "a contacts app that lets a stranger add themselves to your trusted circle just by asking.",
    explain: [
      "A graph is only as safe as the nodes in it. If you add an edge — or attach a whole subgraph — without checking what you're connecting, an attacker can splice in a fake node that becomes reachable through normal traversal.",
      "The fix is to verify a trusted marker before linking, and when attaching a subgraph, to check every node inside it — not just the root.",
    ],
    bad: `def link_nodes(current, next_node):
    current.neighbors.append(next_node)   # trusts anything`,
    good: `def link_nodes(current, next_node):
    if getattr(next_node, "marker", None) != VALID:
        raise InvalidPointerError
    current.neighbors.append(next_node)`,
    badCaption: "Any node — or whole subgraph — can be attached.",
    goodCaption: "Only verified nodes get connected.",
    takeaway: "Check every node you connect, all the way through a subgraph.",
  },
  {
    title: "Remove stale edges on delete",
    analogy:
      "deleting a contact but leaving their number saved in everyone else's phone.",
    explain: [
      "Deleting a node from the graph's table doesn't remove the edges pointing at it. Those dangling references can leak the deleted node's data or send traversal to a ghost.",
      "The fix is to sweep every node's neighbor list and drop the deleted node before removing it.",
    ],
    bad: `def remove_node(graph, node_id):
    del graph.nodes[node_id]   # edges to it survive`,
    good: `def remove_node(graph, node_id):
    target = graph.nodes[node_id]
    for node in graph.nodes.values():
        node.neighbors = [n for n in node.neighbors
                          if n is not target]
    del graph.nodes[node_id]`,
    badCaption: "Other nodes still point at the deleted one.",
    goodCaption: "Every edge to it is swept away first.",
    takeaway: "Delete the relationships, not just the record.",
  },
  {
    title: "Limit how far trust flows",
    analogy:
      "a building pass that lets a guest into every room its holder can reach — down an endless chain of introductions.",
    explain: [
      "Graphs often model trust. The danger is letting trust flow recursively across the whole graph: a long chain of connections lets a distant, unrelated node inherit access it should never have.",
      "The fix is to grant trust to direct neighbors only — one hop, never a recursive sweep.",
      "Try the demo: grant trust to Alice, with the one-hop limit off and on.",
    ],
    demo: TrustPropagationDemo,
    bad: `def propagate_trust(node):
    node.trusted = True
    for n in node.neighbors:
        propagate_trust(n)     # spreads everywhere`,
    good: `def propagate_trust(node):
    node.trusted = True
    for n in node.neighbors:
        n.trusted = True        # direct neighbors only`,
    badCaption: "Trust reaches every connected node.",
    goodCaption: "Trust stops at one hop.",
    takeaway: "Bound how far authority propagates through a graph.",
  },
  {
    title: "Keep node identifiers unique",
    analogy:
      "letting a second person register with your exact username — and quietly replace you.",
    explain: [
      "Nodes are keyed by an identifier. Inserting a node with an ID that already exists overwrites the real node, destroys its edges, and lets an attacker impersonate it.",
      "The fix is to check for the ID before inserting, and reject duplicates.",
    ],
    bad: `def add_node(graph, node_id, secret):
    # overwrites whatever was there
    graph.nodes[node_id] = GraphNode(node_id, secret)`,
    good: `def add_node(graph, node_id, secret):
    if node_id in graph.nodes:
        raise DuplicateNodeError
    graph.nodes[node_id] = GraphNode(node_id, secret)`,
    badCaption: "A duplicate ID overwrites the real node.",
    goodCaption: "Duplicate identifiers are refused.",
    takeaway: "Enforce identity uniqueness before inserting.",
  },
  {
    title: "Remember where you've been",
    analogy:
      "wandering a hall of mirrors — without marking your path, you circle forever.",
    explain: [
      "Graphs can contain cycles, so traversing without recording visited nodes means the same nodes get processed again and again — an attacker adds one cycle and your traversal never returns.",
      "The fix is to keep a set of visited nodes and skip any you've already seen.",
      "Try the demo: traverse a cyclic graph with visited-tracking off, then on.",
    ],
    demo: CycleTraversalDemo,
    bad: `def traverse(node):
    result = [node.node_id]
    for n in node.neighbors:
        result += traverse(n)   # loops on a cycle`,
    good: `def traverse(node, visited=None):
    visited = visited or set()
    if node.node_id in visited:
        return []
    visited.add(node.node_id)
    ...`,
    badCaption: "A cycle makes traversal loop forever.",
    goodCaption: "A visited set makes every node process once.",
    takeaway: "Track visited nodes so cycles can't trap your traversal.",
  },
  {
    title: "Export the minimum, and refresh integrity hashes",
    analogy:
      "sharing a network diagram with only the machine names — and re-sealing a tamper-evident bag every time you change what's inside.",
    explain: [
      "The last two challenges are exposure and integrity. When you export a graph, include only node ids and connectivity — never secrets or internal ids.",
      "And when a node stores an integrity hash of its edges, any change to those edges must recompute the hash immediately — otherwise a stale hash falsely reports the graph is untouched.",
    ],
    bad: `# leaks internals:
{"node_id": .., "secret": .., "internal_id": ..}

# adds an edge but not the hash:
source.neighbors.append(dest)`,
    good: `# public only:
{"node_id": .., "neighbors": [...]}

# refresh after the change:
source.neighbors.append(dest)
source.hash = source.compute_hash()`,
    badCaption: "Leaks metadata; leaves a stale integrity hash.",
    goodCaption: "Shows only public data; keeps the hash current.",
    takeaway: "Reveal only what's needed, and recompute integrity on every change.",
  },
];

const GLOSSARY: GlossaryItem[] = [
  { term: "node / vertex", def: "A single entity in a graph — a person, computer, or service." },
  { term: "edge", def: "A connection between two nodes (e.g. a friendship, a network link, a trust grant)." },
  { term: "neighbor", def: "A node directly connected to another by an edge." },
  { term: "cycle", def: "A path that loops back to where it started — possible in graphs, unlike trees." },
  { term: "traversal", def: "Systematically visiting the nodes of a graph, e.g. depth-first or breadth-first." },
  { term: "lateral movement", def: "An attacker hopping node-to-node through a network graph toward a target." },
];
