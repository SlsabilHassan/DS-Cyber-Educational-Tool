import Link from "next/link";

type Variant = "primary" | "ghost";

// Rounded pill buttons in the reference style: white/black primary,
// subtle bordered ghost.
export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all";
  const styles =
    variant === "primary"
      ? "bg-fg text-bg hover:opacity-90"
      : "border border-border text-fg hover:border-white/25 hover:bg-white/5";

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}
