import type { Metadata } from "next";
import Link from "next/link";
import { Mascot } from "@/components/Mascot";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Welcome" };

export default function WelcomePage() {
  return (
    <div className="mx-auto flex min-h-[78vh] max-w-lg flex-col items-center px-4 pt-16 text-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        <Mascot size={190} />

        <h1 className="mt-8 text-3xl font-bold leading-snug tracking-tight text-fg">
          Hi, I&apos;m {SITE.mascot}!
          <br />
          I&apos;ll be your personal tutor.
        </h1>

        <p className="mt-4 max-w-sm text-muted">
          I&apos;ll hop through data structures with you — showing how hackers
          break them, and how you defend them.
        </p>
      </div>

      <Link
        href="/modules"
        className="mb-10 mt-8 inline-flex w-full max-w-sm items-center justify-center rounded-full bg-accent px-6 py-4 text-base font-semibold text-bg transition-opacity hover:opacity-90"
      >
        Continue
      </Link>
    </div>
  );
}
