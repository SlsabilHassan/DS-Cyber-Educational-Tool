// Leaderboard data helpers. Stats are computed from local progress and synced
// to a public `leaderboard` table in Supabase. A user only appears once they
// opt in and pick a handle.

import { supabase } from "@/lib/supabase";
import { getSolvedSet, challengeKey } from "@/lib/progress";
import { modules } from "@/lib/modules";

export type LeaderRow = {
  handle: string;
  challenges_solved: number;
  modules_crashed: number;
  day_streak: number;
};

export type MyProfile = {
  handle: string | null;
  opted_in: boolean;
  challenges_solved: number;
  modules_crashed: number;
  day_streak: number;
};

// Count solved challenges and fully-cleared ("crashed") modules from the
// local progress set, using the module registry as the source of truth.
export function computeLocalStats(): {
  challengesSolved: number;
  modulesCrashed: number;
} {
  const solved = getSolvedSet();
  let challengesSolved = 0;
  let modulesCrashed = 0;
  for (const m of modules) {
    const total = m.challenges.length;
    if (total === 0) continue;
    const done = m.challenges.filter((c) =>
      solved.has(challengeKey(m.slug, c.id)),
    ).length;
    challengesSolved += done;
    if (done === total) modulesCrashed += 1;
  }
  return { challengesSolved, modulesCrashed };
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

function nextStreak(prevDate: string | null, prevStreak: number): number {
  const today = todayStr();
  if (prevDate === today) return prevStreak || 1; // already counted today
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (prevDate === yesterday) return (prevStreak || 0) + 1; // consecutive day
  return 1; // streak broken (or first ever)
}

async function currentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

// Recompute this user's stats + streak and save them, preserving their handle
// and opt-in choice. Called after solving a challenge and on the leaderboard
// page. No-op when signed out or Supabase isn't configured.
export async function syncMyProfile(): Promise<void> {
  if (!supabase) return;
  const uid = await currentUserId();
  if (!uid) return;

  const { data: existing } = await supabase
    .from("leaderboard")
    .select("handle, opted_in, day_streak, last_active_date")
    .eq("user_id", uid)
    .maybeSingle();

  const { challengesSolved, modulesCrashed } = computeLocalStats();
  const streak = nextStreak(
    existing?.last_active_date ?? null,
    existing?.day_streak ?? 0,
  );

  await supabase.from("leaderboard").upsert(
    {
      user_id: uid,
      handle: existing?.handle ?? null,
      opted_in: existing?.opted_in ?? false,
      challenges_solved: challengesSolved,
      modules_crashed: modulesCrashed,
      day_streak: streak,
      last_active_date: todayStr(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

export async function getMyProfile(): Promise<MyProfile | null> {
  if (!supabase) return null;
  const uid = await currentUserId();
  if (!uid) return null;
  const { data } = await supabase
    .from("leaderboard")
    .select("handle, opted_in, challenges_solved, modules_crashed, day_streak")
    .eq("user_id", uid)
    .maybeSingle();
  return (data as MyProfile) ?? null;
}

// Join (or update handle) and turn visibility on. Returns an error message on
// failure (e.g. handle already taken), or null on success.
export async function joinLeaderboard(handle: string): Promise<string | null> {
  if (!supabase) return "Accounts aren't set up.";
  const uid = await currentUserId();
  if (!uid) return "Please sign in first.";

  const clean = handle.trim();
  if (!/^[A-Za-z0-9_-]{3,20}$/.test(clean)) {
    return "Handles are 3–20 characters: letters, numbers, _ or -.";
  }

  const { challengesSolved, modulesCrashed } = computeLocalStats();
  const { error } = await supabase.from("leaderboard").upsert(
    {
      user_id: uid,
      handle: clean,
      opted_in: true,
      challenges_solved: challengesSolved,
      modules_crashed: modulesCrashed,
      last_active_date: todayStr(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) {
    if (error.code === "23505" || /duplicate|unique/i.test(error.message)) {
      return "That handle is taken — try another.";
    }
    return "Couldn't join right now. Try again.";
  }
  return null;
}

export async function leaveLeaderboard(): Promise<void> {
  if (!supabase) return;
  const uid = await currentUserId();
  if (!uid) return;
  await supabase
    .from("leaderboard")
    .update({ opted_in: false, updated_at: new Date().toISOString() })
    .eq("user_id", uid);
}

// Top players, ranked by challenges solved, then modules crashed, then streak.
export async function fetchLeaderboard(limit = 25): Promise<LeaderRow[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("leaderboard")
    .select("handle, challenges_solved, modules_crashed, day_streak")
    .eq("opted_in", true)
    .not("handle", "is", null)
    .order("challenges_solved", { ascending: false })
    .order("modules_crashed", { ascending: false })
    .order("day_streak", { ascending: false })
    .limit(limit);
  return (data as LeaderRow[]) ?? [];
}
