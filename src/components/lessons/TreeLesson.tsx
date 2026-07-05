"use client";

import { ModuleLesson, Snippet, type Concept, type GlossaryItem } from "./lessonui";
import { TreeVisualizer } from "./interactives/TreeVisualizer";
import { PathTraversalDemo } from "./interactives/PathTraversalDemo";
import { AclDemo } from "./interactives/AclDemo";

export function TreeLesson() {
  return (
    <ModuleLesson
      title="What's a tree?"
      intro={
        <>
          <p>
            Think of a family tree, or the folders on your computer. There&apos;s
            one <span className="text-fg">root</span> at the top, and every item
            branches into <span className="text-fg">children</span> below it. A
            node with no children is a <span className="text-fg">leaf</span>.
          </p>
          <p>
            That&apos;s a tree: a branching hierarchy where each node has exactly
            one parent (except the root) and any number of children. File
            systems, permission systems, parsers, and even blockchains are all
            trees — which is why a bug in one can expose a whole subtree.
          </p>
        </>
      }
      tryIt={
        <>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Try it yourself
          </h3>
          <p className="mt-2 text-sm text-muted">
            Click a node to select it, then add a child under it and watch the
            tree branch out.
          </p>
          <div className="mt-4">
            <TreeVisualizer />
          </div>
          <div className="mt-4">
            <Snippet
              code={`class Node:
    def __init__(self, name):
        self.name = name
        self.children = {}     # name -> child node

root = Node("root")
root.children["docs"] = Node("docs")   # root branches to docs`}
            />
          </div>
        </>
      }
      patternsIntro={
        <>
          The eight challenges are all about the edges of a tree — where you
          enter it, what you leave behind, how permissions flow down, and how
          integrity flows up. Each idea pairs{" "}
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

const CONCEPTS: Concept[] = [
  {
    title: "Confine traversal to the root",
    analogy:
      "a hotel key that opens your floor — but if the elevator lets you press '..' enough times, you end up in the basement vault.",
    explain: [
      "When you walk a tree from a supplied root, a `..` component moves up to the parent. With no boundary, enough `..`s climb right out of the intended root — the classic ../../etc/passwd path traversal.",
      "The fix is to treat the root as a ceiling: refuse any `..` that would step above it.",
      "Try the demo: open a path with the boundary off, then on.",
    ],
    demo: PathTraversalDemo,
    bad: `if part == "..":
    if current.parent:
        current = current.parent   # climbs forever`,
    good: `if part == "..":
    if current is root:
        raise PathTraversalError    # can't escape
    current = current.parent`,
    badCaption: "'..' can climb above the intended root.",
    goodCaption: "The root is a hard ceiling.",
    takeaway: "Anchor traversal to a root and never let input climb past it.",
  },
  {
    title: "Erase metadata when you delete",
    analogy:
      "shredding a folder's label but leaving the confidential files sitting in the empty drawer.",
    explain: [
      "Removing a node from a tree just detaches a pointer. The node object — and any sensitive metadata like a permission string — still exists for anyone holding a reference.",
      "The fix is to wipe the sensitive fields before (or as) you unlink the node.",
    ],
    bad: `def delete_directory(parent, name):
    node = parent.children[name]
    del parent.children[name]   # permission survives
    return node`,
    good: `def delete_directory(parent, name):
    node = parent.children[name]
    node.permission = None       # wipe it
    del parent.children[name]
    return node`,
    badCaption: "The deleted node still reveals its old permission.",
    goodCaption: "Sensitive metadata is erased first.",
    takeaway: "Deletion should destroy the data, not just the link.",
  },
  {
    title: "Inherit permissions, don't reset them",
    analogy:
      "a locked wing of a building where every new room is accidentally left unlocked.",
    explain: [
      "In a permission tree, a child should inherit its parent's access level. A bug that hard-codes new nodes to PUBLIC quietly turns a folder inside an ADMIN directory into something everyone can read.",
      "The fix is to build each child with the parent's permission instead of a fixed default.",
      "Try the demo: create nested folders under an ADMIN root, with inheritance off then on.",
    ],
    demo: AclDemo,
    bad: `def create_child(parent, name):
    child = Directory(name, PUBLIC)   # ignores parent`,
    good: `def create_child(parent, name):
    child = Directory(name, parent.permission)  # inherit`,
    badCaption: "Sensitive subtrees silently become public.",
    goodCaption: "Children inherit the parent's access level.",
    takeaway: "Default to the safest inherited permission, never to open.",
  },
  {
    title: "Reject duplicates and unknown node types",
    analogy:
      "a guest list where two people can share a name — or a stranger can walk in claiming a role that doesn't exist.",
    explain: [
      "Two related insertion bugs. First: adding a child with a name that already exists overwrites the original (and enables replay). Check for the name before inserting.",
      "Second: accepting a node of any type lets an attacker poison the tree with something unexpected — like an `execute` node in a config tree. Validate the type against an allow-list.",
      "Both fixes are the same shape: check on the way in, and refuse before modifying the tree.",
    ],
    bad: `def insert_node(parent, child):
    parent.children[child.name] = child   # overwrites / any type`,
    good: `def insert_node(parent, child):
    if child.name in parent.children:
        raise DuplicateNodeError
    if child.node_type not in VALID_TYPES:
        raise InvalidNodeError
    parent.children[child.name] = child`,
    badCaption: "Duplicates overwrite; unknown types poison the tree.",
    goodCaption: "Unique names and allow-listed types only.",
    takeaway: "Validate identity and type at the boundary, before you insert.",
  },
  {
    title: "Cap recursion depth",
    analogy:
      "reading a choose-your-own-adventure that loops forever — eventually you pass out.",
    explain: [
      "Walking a tree recursively is natural, but a maliciously deep tree makes the recursion pile up until the call stack is exhausted and the program crashes.",
      "The fix is a depth budget: refuse to recurse past MAX_DEPTH.",
    ],
    bad: `def count_nodes(node, depth=0):
    total = 1
    for c in node.children:
        total += count_nodes(c, depth + 1)`,
    good: `def count_nodes(node, depth=0):
    if depth > MAX_DEPTH:
        raise TraversalDepthError
    total = 1
    for c in node.children:
        total += count_nodes(c, depth + 1)`,
    badCaption: "A deep tree exhausts the call stack.",
    goodCaption: "A depth cap stops it before it crashes.",
    takeaway: "Bound recursion depth on any attacker-shaped tree.",
  },
  {
    title: "Export the minimum, and keep Merkle hashes fresh",
    analogy:
      "publishing an org chart with names only — and re-stamping every seal above a document when its text changes.",
    explain: [
      "The last two challenges are exposure and integrity. When you export a tree to a client, include only the public fields (names) — never owner, permission, or inode.",
      "And in a Merkle tree, each node's hash is built from its children's, so changing a leaf must recompute every ancestor up to the root. Skip that and the tree still 'verifies' while being tampered — the whole point of a Merkle tree is lost.",
    ],
    bad: `# leaks internals:
{"name": .., "owner": .., "permission": .., "inode": ..}

# re-hashes only the leaf:
recompute(leaf)`,
    good: `# public only:
{"name": .., "children": [...]}

# walk up to the root:
while node:
    recompute(node)
    node = node.parent`,
    badCaption: "Leaks metadata; leaves ancestor hashes stale.",
    goodCaption: "Shows only names; propagates the change to the root.",
    takeaway: "Reveal only what's public, and let integrity changes reach the root.",
  },
];

const GLOSSARY: GlossaryItem[] = [
  { term: "root", def: "The single top node of a tree; every traversal starts here." },
  { term: "child / parent", def: "A node directly below another (child) and the node directly above it (parent)." },
  { term: "leaf", def: "A node with no children — the tip of a branch." },
  { term: "path traversal", def: "Using '..' to climb out of an intended directory and reach files you shouldn't." },
  { term: "ACL", def: "Access Control List — the permissions attached to a resource, often inherited down a tree." },
  { term: "Merkle tree", def: "A tree where each node's hash depends on its children's, making any tampering detectable at the root." },
];
