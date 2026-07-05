"use client";

import { useRef, useState } from "react";

// A hands-on tree builder: click a node to select it, then add a child under
// it. Shows how a tree branches out from a single root.
type TNode = { id: number; name: string; children: TNode[] };

function clone(n: TNode): TNode {
  return { ...n, children: n.children.map(clone) };
}

export function TreeVisualizer() {
  const [root, setRoot] = useState<TNode>({
    id: 0,
    name: "root",
    children: [
      { id: 1, name: "docs", children: [{ id: 2, name: "report.txt", children: [] }] },
      { id: 3, name: "photos", children: [] },
    ],
  });
  const [selected, setSelected] = useState(0);
  const [input, setInput] = useState("");
  const nextId = useRef(4);

  function addChild() {
    const name = input.trim() || `node${nextId.current}`;
    const copy = clone(root);
    const stack = [copy];
    while (stack.length) {
      const n = stack.pop()!;
      if (n.id === selected) {
        n.children.push({ id: nextId.current++, name, children: [] });
        break;
      }
      stack.push(...n.children);
    }
    setRoot(copy);
    setInput("");
  }

  function render(node: TNode, depth: number): React.ReactNode {
    return (
      <div key={node.id}>
        <button
          onClick={() => setSelected(node.id)}
          style={{ marginLeft: depth * 18 }}
          className={`my-0.5 flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-sm transition-colors ${
            selected === node.id
              ? "border-accent bg-accent/10 text-fg"
              : "border-border bg-surface-2 text-fg/80 hover:border-white/25"
          }`}
        >
          {node.children.length > 0 ? "📁" : "📄"} {node.name}
        </button>
        {node.children.map((c) => render(c, depth + 1))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-[#0a0a0c] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addChild()}
          placeholder="Child name…"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-accent"
        />
        <button
          onClick={addChild}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          Add child
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">
        Selected parent: <span className="font-mono text-accent">click a node</span> to choose where the next child goes.
      </p>
      <div className="mt-4">{render(root, 0)}</div>
    </div>
  );
}
