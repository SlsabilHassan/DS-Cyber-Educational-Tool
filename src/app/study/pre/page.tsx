import type { Metadata } from "next";
import { Assessment } from "@/components/assessment/Assessment";
import { PRE_ITEMS } from "@/lib/assessment-bank";

export const metadata: Metadata = { title: "Pre-test" };

export default function PreTestPage() {
  return (
    <Assessment
      phase="pre"
      form="A"
      items={PRE_ITEMS}
      cta={{ href: "/modules", label: "Go to the modules" }}
    />
  );
}
