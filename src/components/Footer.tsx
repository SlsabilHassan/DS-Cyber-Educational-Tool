import Link from "next/link";
import { SITE, NAV } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Logo />
            <p className="max-w-xs text-sm text-muted">{SITE.tagline}</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted transition-colors hover:text-fg"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-xs text-muted">
          © {new Date().getFullYear()} {SITE.name}. Built for learning.
        </div>
      </div>
    </footer>
  );
}
