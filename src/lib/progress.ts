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
