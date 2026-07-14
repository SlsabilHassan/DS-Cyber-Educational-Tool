// Tracks which challenges the learner has solved, in localStorage. Client-only.
// Components subscribe to the custom "structsec:progress" event to stay in sync
// within a page; a fresh read on mount handles navigation between pages.

const KEY = "structsec:solved:v1";
const EVENT = "structsec:progress";

export function challengeKey(slug: string, challengeId: string): string {
  return `${slug}/${challengeId}`;
}

export function getSolvedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function isSolved(slug: string, challengeId: string): boolean {
  return getSolvedSet().has(challengeKey(slug, challengeId));
}

export function markSolved(slug: string, challengeId: string): void {
  if (typeof window === "undefined") return;
  const set = getSolvedSet();
  const key = challengeKey(slug, challengeId);
  if (set.has(key)) return;
  set.add(key);
  window.localStorage.setItem(KEY, JSON.stringify([...set]));
  window.dispatchEvent(new Event(EVENT));
}

// ── Revealed solutions ────────────────────────────────────────────────
// Challenges unlock in order. Genuinely stuck learners can reveal the
// detailed solution instead — that counts as "done" for unlocking the next
// challenge (but not as a solve).

const REVEALED_KEY = "structsec:revealed:v1";

export function getRevealedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(REVEALED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function markRevealed(slug: string, challengeId: string): void {
  if (typeof window === "undefined") return;
  const set = getRevealedSet();
  const key = challengeKey(slug, challengeId);
  if (set.has(key)) return;
  set.add(key);
  window.localStorage.setItem(REVEALED_KEY, JSON.stringify([...set]));
  window.dispatchEvent(new Event(EVENT));
}

// ── Bulk access, for syncing with the account ─────────────────────────
export function getSolvedKeys(): string[] {
  return [...getSolvedSet()];
}
export function getRevealedKeys(): string[] {
  return [...getRevealedSet()];
}

// Union incoming keys into local progress (never removes anything) and fire
// one change event. Used when merging a signed-in account's saved progress.
export function mergeProgress(solved: string[], revealed: string[]): void {
  if (typeof window === "undefined") return;
  const s = getSolvedSet();
  const r = getRevealedSet();
  const beforeS = s.size;
  const beforeR = r.size;
  solved.forEach((k) => s.add(k));
  revealed.forEach((k) => r.add(k));
  if (s.size === beforeS && r.size === beforeR) return; // nothing new
  window.localStorage.setItem(KEY, JSON.stringify([...s]));
  window.localStorage.setItem(REVEALED_KEY, JSON.stringify([...r]));
  window.dispatchEvent(new Event(EVENT));
}

// Solved or solution revealed — either way the learner may move on.
export function isChallengeDone(slug: string, challengeId: string): boolean {
  const key = challengeKey(slug, challengeId);
  return getSolvedSet().has(key) || getRevealedSet().has(key);
}

// A challenge is unlocked when it's the first in its module or the one
// before it is done.
export function isChallengeUnlocked(
  slug: string,
  challengeIds: string[],
  challengeId: string,
): boolean {
  const i = challengeIds.indexOf(challengeId);
  if (i <= 0) return true;
  return isChallengeDone(slug, challengeIds[i - 1]);
}

// Subscribe to progress changes (this tab's custom event + other tabs' storage
// event). Returns an unsubscribe function.
export function onProgressChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
