"use client";

import { useRef, useState } from "react";

// A small fixed graph. "Traverse" walks it depth-first from A, lighting each
// node in visit order — showing how a graph is explored (and that each node is
// visited once).
const NODES: Record<string, { x: number; y: number }> = {
  A: { x: 60, y: 45 },
  B: { x: 180, y: 30 },
  C: { x: 285, y: 95 },
  D: { x: 175, y: 145 },
  E: { x: 55, y: 135 },
};
const EDGES: [string, string][] = [
  ["A", "B"],
  ["A", "E"],
  ["B", "C"],
  ["B", "D"],
  ["E", "D"],
  ["D", "C"],
];
const ADJ: Record<string, string[]> = {
  A: ["B", "E"],
  B: ["C", "D"],
  C: [],
  D: ["C"],
  E: ["D"],
};

function dfsOrder(start: string): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  const go = (n: string) => {
    if (seen.has(n)) return;
    seen.add(n);
    order.push(n);
    for (const m of ADJ[n]) go(m);
  };
  go(start);
  return order;
}

export function GraphVisualizer() {
  const [visited, setVisited] = useState<string[]>([]);
  const timers = useRef<number[]>([]);

  function reset() {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    setVisited([]);
  }

  function run() {
    reset();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const order = dfsOrder("A");
    if (reduce) {
      setVisited(order);
      return;
    }
    order.forEach((n, i) => {
      const t = window.setTimeout(
        () => setVisited((v) => [...v, n]),
        i * 450,
      );
      timers.current.push(t);
    });
  }

  return (
    <div className="rounded-xl border border-border bg-[#0a0a0c] p-5">
      <svg viewBox="0 0 340 180" className="w-full" style={{ maxHeight: 220 }}>
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1.5}
          />
        ))}
        {Object.entries(NODES).map(([id, p]) => {
          const idx = visited.indexOf(id);
          const on = idx >= 0;
          return (
            <g key={id}>
              <circle
                cx={p.x}
                cy={p.y}
                r={16}
                fill={on ? "rgba(74,222,128,0.18)" : "#17171b"}
                stroke={on ? "#4ade80" : "rgba(255,255,255,0.18)"}
                strokeWidth={1.5}
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize={12}
                fontFamily="monospace"
                fill={on ? "#4ade80" : "#9498a1"}
              >
                {id}
              </text>
              {on && (
                <text
                  x={p.x + 18}
                  y={p.y - 12}
                  fontSize={9}
                  fontFamily="monospace"
                  fill="#4ade80"
                >
                  {idx + 1}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={run}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          Traverse (depth-first)
        </button>
        <button
          onClick={reset}
          className="rounded-lg border border-border px-4 py-2 text-sm text-fg transition-colors hover:border-white/25 hover:bg-white/5"
        >
          Reset
        </button>
        {visited.length > 0 && (
          <span className="ml-auto font-mono text-xs text-accent">
            {visited.join(" → ")}
          </span>
        )}
      </div>
    </div>
  );
}
