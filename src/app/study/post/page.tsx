import type { Metadata } from "next";
import { Assessment } from "@/components/assessment/Assessment";
import { POST_ITEMS, EXPERIENCE_ITEMS } from "@/lib/assessment-bank";

export const metadata: Metadata = { title: "Post-test" };

export default function PostTestPage() {
  return (
    <Assessment
      phase="post"
      form="B"
      items={[...POST_ITEMS, ...EXPERIENCE_ITEMS]}
      title="Post-test"
      cta={{ href: "/", label: "Finish" }}
    />
  );
}
