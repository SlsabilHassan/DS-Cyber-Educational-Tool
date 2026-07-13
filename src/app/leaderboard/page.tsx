import type { Metadata } from "next";
import { LeaderboardClient } from "@/components/LeaderboardClient";

export const metadata: Metadata = { title: "Leaderboard" };

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
