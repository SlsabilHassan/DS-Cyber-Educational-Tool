"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/site";
import { Logo } from "./Logo";
import { useAuth } from "./AuthProvider";

// Floating pill navbar, in the reference style.
export function Header() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="mx-auto flex max-w-5xl items-center gap-6 rounded-full border border-border bg-surface/70 px-4 py-2 backdrop-blur-xl">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors hover:text-fg ${
                isActive(item.href)
                  ? "bg-white/5 text-fg"
                  : "text-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {loading ? null : user ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-sm text-muted sm:block">
                {user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="rounded-full border border-border px-4 py-2 text-sm text-fg transition-colors hover:border-white/25 hover:bg-white/5"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm text-muted transition-colors hover:text-fg sm:block"
              >
                Login
              </Link>
              <Link
                href="/welcome"
                className="rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
