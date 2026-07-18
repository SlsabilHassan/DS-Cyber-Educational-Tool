// Research event logging. Writes structured learning events to Supabase so
// they can be queried and exported for analysis. Everything here is a no-op
// until the visitor grants consent (see ResearchConsent), and it never throws
// — a failed insert must never break the learning experience.

import { supabase } from "@/lib/supabase";

const CONSENT_KEY = "hs:research-consent:v1";
const DEVICE_KEY = "hs:device-id:v1";
const SESSION_KEY = "hs:session-id:v1";
const CONSENT_EVENT = "hs:consent-change";

// The signed-in user's id, kept current by AuthProvider. Null when anonymous.
let currentUserId: string | null = null;
export function setAnalyticsUser(userId: string | null) {
  currentUserId = userId;
}

export type ConsentState = "unset" | "granted" | "declined";

// Consent is stored in sessionStorage — so it is asked again every time the
// site is opened fresh (a new tab/visit), for every visitor including
// signed-in ones. The device_id below stays in localStorage, so a
// participant's pre- and post-tests still pair across sessions.
export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "unset";
  const v = window.sessionStorage.getItem(CONSENT_KEY);
  return v === "granted" || v === "declined" ? v : "unset";
}

export function setConsent(state: "granted" | "declined") {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(CONSENT_KEY, state);
  window.dispatchEvent(new Event(CONSENT_EVENT));
  // Record the consent decision itself (only sends if granted).
  track("consent", { granted: state === "granted" });
}

export function onConsentChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CONSENT_EVENT, cb);
  return () => window.removeEventListener(CONSENT_EVENT, cb);
}

// A stable random id per browser (survives sessions) and per session.
// Neither contains personal information.
function stableId(storage: Storage, key: string): string {
  let id = storage.getItem(key);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    storage.setItem(key, id);
  }
  return id;
}

// The anonymous ids for research records (device survives sessions, session
// is per-visit). Returns null before consent or on the server — callers must
// treat null as "don't record". Reused by the pre/post assessment.
export function getResearchIds(): { deviceId: string; sessionId: string } | null {
  if (typeof window === "undefined") return null;
  if (getConsent() !== "granted") return null;
  return {
    deviceId: stableId(window.localStorage, DEVICE_KEY),
    sessionId: stableId(window.sessionStorage, SESSION_KEY),
  };
}

export type EventPayload = {
  module?: string;
  challengeId?: string;
  [key: string]: unknown;
};

// Fire-and-forget: record one learning event. Safe to call anywhere.
export function track(eventType: string, payload: EventPayload = {}): void {
  if (typeof window === "undefined") return;
  if (getConsent() !== "granted") return;
  if (!supabase) return;

  const { module: mod, challengeId, ...rest } = payload;
  void supabase
    .from("learning_events")
    .insert({
      user_id: currentUserId,
      device_id: stableId(window.localStorage, DEVICE_KEY),
      session_id: stableId(window.sessionStorage, SESSION_KEY),
      event_type: eventType,
      module: mod ?? null,
      challenge_id: challengeId ?? null,
      payload: rest,
    })
    .then(
      () => {},
      () => {}, // swallow — logging must never disrupt the learner
    );
}
