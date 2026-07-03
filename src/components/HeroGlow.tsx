import { NodeField } from "./NodeField";

// Decorative hero background: a soft radial spotlight plus a live, drifting
// graph of nodes and edges. Purely visual, hidden from assistive tech.
export function HeroGlow() {
  return (
    <div
      aria-hidden
      className="spotlight pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] overflow-hidden"
    >
      <NodeField />
    </div>
  );
}
