import type { Metadata } from "next";
import { SearchClient } from "@/components/SearchClient";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-fg">Search</h1>
      <p className="mt-2 text-muted">
        Every module and challenge, one box away.
      </p>
      <div className="mt-8">
        <SearchClient />
      </div>
    </div>
  );
}
