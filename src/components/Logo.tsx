import Link from "next/link";
import { SITE } from "@/lib/site";
import { NodesIcon } from "./Icons";

// Icon mark + wordmark.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-surface-2 text-accent">
        <NodesIcon className="h-4 w-4" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-fg">
        {SITE.name}
      </span>
    </Link>
  );
}
