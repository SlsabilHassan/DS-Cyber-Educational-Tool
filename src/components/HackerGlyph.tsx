"use client";

import { useEffect, useState } from "react";

const CHARS = "01<>/\\|#$%&*+=".split("");

// A tiny "hacker" animation shown beside each handle: three matrix-style cells
// that cycle through glitchy characters, capped off by a blinking cursor.
// Purely decorative — respects reduced-motion via CSS.
export function HackerGlyph({ seed = 0 }: { seed?: number }) {
  const [cells, setCells] = useState<string[]>(["0", "1", "0"]);

  useEffect(() => {
    const pick = () =>
      Array.from({ length: 3 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]);
    // Stagger start slightly by seed so rows don't cycle in lockstep.
    const start = setTimeout(() => setCells(pick()), (seed % 5) * 90);
    const id = setInterval(() => setCells(pick()), 700 + (seed % 4) * 120);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [seed]);

  return (
    <span
      aria-hidden
      className="inline-flex items-center gap-0.5 font-mono text-[11px] leading-none text-accent"
    >
      {cells.map((c, i) => (
        <span key={i} className="hack-cell">
          {c}
        </span>
      ))}
      <span className="hack-cursor ml-0.5 inline-block h-3 w-[7px] bg-accent align-middle" />
    </span>
  );
}
