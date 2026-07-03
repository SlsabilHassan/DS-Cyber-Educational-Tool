"use client";

import { useEffect, useRef } from "react";

// A living graph: nodes drift and connect to nearby neighbors, on-theme for a
// data-structures site. Rendered on a canvas behind the hero. Respects
// prefers-reduced-motion (draws a single static frame instead of animating).
export function NodeField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    // Non-null bindings captured for use inside the closures below.
    const canvas = canvasEl;
    const c = ctx;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const LINK_DIST = 135;

    let width = 0;
    let height = 0;
    let nodes: { x: number; y: number; vx: number; vy: number }[] = [];
    let raf = 0;

    function resize() {
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect?.width ?? window.innerWidth;
      height = rect?.height ?? 600;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(64, Math.max(26, Math.floor(width / 26)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    }

    function draw() {
      c.clearRect(0, 0, width, height);

      // edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            const opacity = (1 - dist / LINK_DIST) * 0.38;
            c.strokeStyle = `rgba(74, 222, 128, ${opacity})`;
            c.lineWidth = 1;
            c.beginPath();
            c.moveTo(a.x, a.y);
            c.lineTo(b.x, b.y);
            c.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        c.beginPath();
        c.arc(n.x, n.y, 1.7, 0, Math.PI * 2);
        c.fillStyle = "rgba(190, 255, 210, 0.75)";
        c.fill();
      }
    }

    function tick() {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }
      draw();
      raf = requestAnimationFrame(tick);
    }

    resize();
    if (prefersReduced) {
      draw();
    } else {
      raf = requestAnimationFrame(tick);
    }

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="node-fade absolute inset-0 h-full w-full"
    />
  );
}
