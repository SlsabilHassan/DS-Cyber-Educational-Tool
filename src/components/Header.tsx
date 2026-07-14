"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { NAV } from "@/lib/site";
import { Logo } from "./Logo";
import { useAuth } from "./AuthProvider";

// Prefer the name captured at sign-up; fall back to the email handle for
// accounts made before names were collected.
function displayName(user: User): string {
  const meta = user.user_metadata as
    | { first_name?: string; full_name?: string }
    | undefined;
  return (
    meta?.first_name || meta?.full_name || user.email?.split("@")[0] || "You"
  );
}

function fullName(user: User): string {
  const meta = user.user_metadata as
    | { first_name?: string; last_name?: string; full_name?: string }
    | undefined;
  if (meta?.full_name) return meta.full_name;
  if (meta?.first_name || meta?.last_name)
    return [meta.first_name, meta.last_name].filter(Boolean).join(" ");
  return displayName(user);
}

function initial(user: User): string {
  return displayName(user).charAt(0) || "?";
}

// Floating pill navbar, in the reference style.
export function Header() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="relative mx-auto flex max-w-5xl items-center gap-6 rounded-full border border-border bg-surface/70 px-4 py-2 backdrop-blur-xl">
        {/* Hamburger (mobile only) */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Menu"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-fg md:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>

        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors hover:text-fg ${
                isActive(item.href) ? "bg-white/5 text-fg" : "text-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {loading ? null : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Account menu"
                className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-2.5 transition-colors hover:border-white/25 hover:bg-white/5"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-semibold uppercase text-accent">
                  {initial(user)}
                </span>
                <span className="hidden max-w-[9rem] truncate text-sm text-fg sm:block">
                  {displayName(user)}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 text-muted transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  {/* click-away backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/15 text-sm font-semibold uppercase text-accent">
                        {initial(user)}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-fg">
                          {fullName(user)}
                        </div>
                        <div className="truncate text-xs text-muted">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-border" />
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-fg transition-colors hover:bg-white/5"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-muted"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <path d="M16 17l5-5-5-5M21 12H9" />
                      </svg>
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
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

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="absolute inset-x-0 top-full mt-2 md:hidden">
            <nav className="mx-auto flex max-w-5xl flex-col gap-1 rounded-2xl border border-border bg-surface p-2 shadow-xl">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-4 py-3 text-sm transition-colors ${
                    isActive(item.href)
                      ? "bg-white/5 text-fg"
                      : "text-muted hover:bg-white/5 hover:text-fg"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {!loading && !user && (
                <Link
                  href="/login"
                  className="rounded-xl px-4 py-3 text-sm text-muted transition-colors hover:bg-white/5 hover:text-fg"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
