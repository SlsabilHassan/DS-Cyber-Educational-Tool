"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { HackerGlyph } from "@/components/HackerGlyph";
import { onProgressChange } from "@/lib/progress";
import {
  fetchLeaderboard,
  getMyProfile,
  joinLeaderboard,
  leaveLeaderboard,
  syncMyProfile,
  type LeaderRow,
  type MyProfile,
} from "@/lib/leaderboard";

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardClient() {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [me, setMe] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [board, mine] = await Promise.all([fetchLeaderboard(), getMyProfile()]);
    setRows(board);
    setMe(mine);
    setLoading(false);
  }, []);

  // On load (and when the user changes): push my latest stats, then read the board.
  useEffect(() => {
    if (authLoading) return;
    let alive = true;
    (async () => {
      await syncMyProfile(); // keep my row current before showing rankings
      if (alive) await refresh();
    })();
    return () => {
      alive = false;
    };
  }, [authLoading, user, refresh]);

  // If they solve something in another tab while here, restay fresh.
  useEffect(() => onProgressChange(refresh), [refresh]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-fg">
            Leaderboard
          </h1>
          <p className="mt-2 text-muted">
            The top hackers on Hacky Stacky. Crash modules, solve challenges,
            keep your streak alive.
          </p>
        </div>
      </div>

      {/* Your standing / join card */}
      <div className="mt-8">
        {authLoading ? null : !user ? (
          <SignInPrompt />
        ) : (
          <JoinCard me={me} onChange={refresh} />
        )}
      </div>

      {/* The board */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-border">
        <div className="grid grid-cols-[3rem_1fr_5rem_5rem_5rem] items-center gap-2 border-b border-border bg-surface-2 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted sm:grid-cols-[3rem_1fr_7rem_7rem_6rem]">
          <span>#</span>
          <span>Hacker</span>
          <span className="text-right">Modules</span>
          <span className="text-right">Solved</span>
          <span className="text-right">Streak</span>
        </div>

        {loading ? (
          <div className="px-4 py-12 text-center text-sm text-muted">
            Loading the board…
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-muted">
            No one&apos;s on the board yet. Be the first — join above!
          </div>
        ) : (
          rows.map((r, i) => {
            const mine = me?.opted_in && me.handle === r.handle;
            return (
              <div
                key={r.handle}
                className={`grid grid-cols-[3rem_1fr_5rem_5rem_5rem] items-center gap-2 border-b border-border px-4 py-3 text-sm last:border-0 sm:grid-cols-[3rem_1fr_7rem_7rem_6rem] ${
                  mine ? "bg-accent/5" : ""
                }`}
              >
                <span className="font-mono text-muted">
                  {i < 3 ? (
                    <span className="text-base">{MEDALS[i]}</span>
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                <span className="flex min-w-0 items-center gap-2">
                  <HackerGlyph seed={i} />
                  <span className="truncate font-medium text-fg">
                    {r.handle}
                    {mine && (
                      <span className="ml-1.5 text-xs font-normal text-accent">
                        (you)
                      </span>
                    )}
                  </span>
                </span>
                <span className="text-right font-mono text-fg">
                  {r.modules_crashed}
                </span>
                <span className="text-right font-mono text-fg">
                  {r.challenges_solved}
                </span>
                <span className="text-right font-mono text-accent">
                  {r.day_streak}🔥
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function SignInPrompt() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        <span className="font-medium text-fg">Want on the board?</span> Sign in
        and pick a hacker handle to compete.
      </p>
      <Link
        href="/login"
        className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
      >
        Sign in
      </Link>
    </div>
  );
}

function JoinCard({
  me,
  onChange,
}: {
  me: MyProfile | null;
  onChange: () => void;
}) {
  const [handle, setHandle] = useState(me?.handle ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHandle(me?.handle ?? "");
  }, [me?.handle]);

  async function join() {
    setBusy(true);
    setError(null);
    const err = await joinLeaderboard(handle);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    onChange();
  }

  async function leave() {
    setBusy(true);
    await leaveLeaderboard();
    setBusy(false);
    onChange();
  }

  const onBoard = me?.opted_in && me.handle;

  return (
    <div className="rounded-2xl border border-accent/25 bg-accent/5 p-5">
      {onBoard ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-fg">
            You&apos;re on the board as{" "}
            <span className="font-semibold text-accent">{me!.handle}</span> —{" "}
            {me!.challenges_solved} solved · {me!.modules_crashed} crashed ·{" "}
            {me!.day_streak}🔥 streak.
          </p>
          <button
            onClick={leave}
            disabled={busy}
            className="shrink-0 rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:text-fg disabled:opacity-50"
          >
            Leave leaderboard
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-fg">
            <span className="font-medium">Join the leaderboard.</span> Pick a
            hacker handle — your real name stays private.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && join()}
              placeholder="e.g. n0va, byte_bandit"
              maxLength={20}
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-accent"
            />
            <button
              onClick={join}
              disabled={busy || handle.trim().length < 3}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Joining…" : "Join"}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          <p className="mt-2 text-xs text-muted">
            3–20 characters: letters, numbers, _ or -.
          </p>
        </>
      )}
    </div>
  );
}
