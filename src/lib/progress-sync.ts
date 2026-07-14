// Syncs local challenge progress with the signed-in user's account so it
// follows them across devices. Progress is only ever unioned (once solved,
// always solved), which sidesteps clobbering when two devices are used.

import { supabase } from "@/lib/supabase";
import {
  getSolvedKeys,
  getRevealedKeys,
  mergeProgress,
} from "@/lib/progress";

// Pull the account's saved progress, merge it into local storage, then write
// the merged set back — so both sides end up complete. Call on sign-in.
export async function pullAndMergeProgress(userId: string): Promise<void> {
  if (!supabase) return;

  const { data } = await supabase
    .from("user_progress")
    .select("solved, revealed")
    .eq("user_id", userId)
    .maybeSingle();

  const serverSolved: string[] = data?.solved ?? [];
  const serverRevealed: string[] = data?.revealed ?? [];

  // Bring the server's progress into local (fires a UI refresh if anything new).
  mergeProgress(serverSolved, serverRevealed);

  // Push the now-merged local set back up so the account is complete too.
  await pushProgress(userId);
}

// Save the current local progress to the account (upsert the whole set).
export async function pushProgress(userId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      solved: getSolvedKeys(),
      revealed: getRevealedKeys(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}
