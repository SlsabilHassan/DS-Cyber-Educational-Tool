import type { Metadata } from "next";
import { StudyLanding } from "@/components/assessment/StudyLanding";

export const metadata: Metadata = { title: "Research study" };

export default function StudyPage() {
  return <StudyLanding />;
}
