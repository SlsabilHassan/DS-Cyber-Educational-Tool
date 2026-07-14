"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { onProgressChange } from "@/lib/progress";
import { pullAndMergeProgress, pushProgress } from "@/lib/progress-sync";
import { syncMyProfile } from "@/lib/leaderboard";

// Invisible glue: when a user is signed in, mirror their local progress to
// their account (and pull the account's progress down on login). Also refreshes
// their leaderboard stats. Does nothing when signed out.
export function ProgressSync() {
  const { user, loading } = useAuth();
  const mergedFor = useRef<string | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On sign-in (once per user): pull the account's progress, merge, sync stats.
  useEffect(() => {
    if (loading || !user) return;
    if (mergedFor.current === user.id) return;
    mergedFor.current = user.id;
    (async () => {
      await pullAndMergeProgress(user.id);
      await syncMyProfile();
    })();
  }, [user, loading]);

  // On any local progress change while signed in: debounce-push to the account.
  useEffect(() => {
    if (!user) return;
    return onProgressChange(() => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(() => pushProgress(user.id), 800);
    });
  }, [user]);

  return null;
}
