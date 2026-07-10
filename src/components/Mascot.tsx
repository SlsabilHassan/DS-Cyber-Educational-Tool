// Sudo — the tutor mascot. It IS the Hacky Stacky logo: three connected nodes.
// The two upper nodes' holes become big friendly cartoon eyes; the lower node
// stays a hollow node (the logo look). It hops and blinks. Animations live in
// globals.css (.mascot-body / -shadow / -eyes) and respect reduced-motion.
export function Mascot({
  size = 160,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-end justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* ground shadow */}
      <div
        className="mascot-shadow absolute rounded-full bg-black/40"
        style={{ width: size * 0.44, height: size * 0.05, bottom: size * 0.05 }}
      />
      {/* hopping body */}
      <div className="mascot-body absolute inset-x-0 top-0 flex justify-center">
        <svg
          width={size}
          height={size}
          viewBox="0 0 150 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* edges — same connections as the logo (behind the nodes) */}
          <line x1="52" y1="60" x2="102" y2="52" stroke="#4ade80" strokeWidth="9" strokeLinecap="round" />
          <line x1="52" y1="60" x2="78" y2="112" stroke="#4ade80" strokeWidth="9" strokeLinecap="round" />

          {/* lower node — hollow, keeps the classic "node with a hole" */}
          <circle cx="78" cy="112" r="16" fill="none" stroke="#4ade80" strokeWidth="9" />

          {/* two upper nodes — become the eyes */}
          <circle cx="52" cy="60" r="29" fill="#4ade80" stroke="#37c26a" strokeWidth="2" />
          <circle cx="102" cy="52" r="29" fill="#4ade80" stroke="#37c26a" strokeWidth="2" />

          {/* eyes (whites + pupils + highlights) — blinks as a group */}
          <g className="mascot-eyes">
            <circle cx="52" cy="61" r="17" fill="#ffffff" />
            <circle cx="102" cy="53" r="17" fill="#ffffff" />
            {/* pupils looking up-and-inward for a goofy, curious look */}
            <circle cx="57" cy="57" r="8" fill="#0c0c0d" />
            <circle cx="97" cy="49" r="8" fill="#0c0c0d" />
            <circle cx="60" cy="54" r="2.6" fill="#ffffff" />
            <circle cx="100" cy="46" r="2.6" fill="#ffffff" />
          </g>

          {/* little smile */}
          <path
            d="M64 86 Q77 96 90 84"
            stroke="#4ade80"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
