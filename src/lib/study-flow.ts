// Tracks, per module, whether the participant has taken the pre-test and the
// post-test — so the module page can nudge them at the right moments. Stored
// in localStorage; components subscribe to the shared progress event.

const PRE_KEY = "hs:pretest-done:v1";
const POST_KEY = "hs:posttest-done:v1";
const EVENT = "hs:studyflow";

function getSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function add(key: string, slug: string) {
  if (typeof window === "undefined") return;
  const set = getSet(key);
  if (set.has(slug)) return;
  set.add(slug);
  window.localStorage.setItem(key, JSON.stringify([...set]));
  window.dispatchEvent(new Event(EVENT));
}

export function hasPretest(slug: string): boolean {
  return getSet(PRE_KEY).has(slug);
}
export function hasPosttest(slug: string): boolean {
  return getSet(POST_KEY).has(slug);
}
export function markPretestDone(slug: string): void {
  add(PRE_KEY, slug);
}
export function markPosttestDone(slug: string): void {
  add(POST_KEY, slug);
}

export function onStudyFlowChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
