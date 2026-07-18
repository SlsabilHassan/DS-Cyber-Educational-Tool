// Pre/post assessment types + the item-level recorder. Interactive items
// measure understanding by making the learner *do* something (order steps,
// spot the vulnerable line, predict output), not just pick a letter. Every
// answer is stored with per-item time and (for scored items) a self-rated
// confidence, so you can analyze learning gain, item difficulty, and
// confidence-vs-accuracy. Keyed by the anonymous device_id; consent-gated.

import { supabase } from "@/lib/supabase";
import { getResearchIds } from "@/lib/analytics";

export type Phase = "pre" | "post" | "experience";

type BaseItem = {
  id: string; // stable — pre and post use matching ids to pair up
  construct: string; // the concept measured, e.g. "array-bounds"
  module?: string;
  prompt: string;
  askConfidence?: boolean; // show a "how sure?" rating after answering
};

// Multiple choice / predict-the-output. An optional code block sets the scene.
export type ChoiceItem = BaseItem & {
  kind: "choice";
  code?: string;
  options: { text: string; correct?: boolean }[];
};

// Put the steps in the right order (click to sequence).
export type OrderItem = BaseItem & {
  kind: "order";
  steps: string[]; // shown shuffled; correct order is the given array order
};

// Click the line that contains the vulnerability.
export type SpotBugItem = BaseItem & {
  kind: "spotbug";
  codeLines: string[];
  buggyLine: number; // 0-based index of the vulnerable line
};

// Self-report (Likert). No right answer — measures confidence/attitude.
export type LikertItem = BaseItem & {
  kind: "likert";
  statement: string;
};

export type AssessmentItem = ChoiceItem | OrderItem | SpotBugItem | LikertItem;

export type ItemResult = {
  item: AssessmentItem;
  correct: boolean | null; // null for likert
  confidence: number | null; // 1–5, or null if not asked
  timeMs: number;
  response: Record<string, unknown>; // the raw answer
};

// Store one item response. Fire-and-forget; never throws.
export async function recordItemResponse(
  phase: Phase,
  form: string,
  r: ItemResult,
): Promise<void> {
  const ids = getResearchIds();
  if (!ids || !supabase) return; // no consent / not configured → skip
  try {
    await supabase.from("assessment_responses").insert({
      device_id: ids.deviceId,
      session_id: ids.sessionId,
      phase,
      form,
      item_id: r.item.id,
      construct: r.item.construct,
      module: r.item.module ?? null,
      kind: r.item.kind,
      correct: r.correct,
      confidence: r.confidence,
      time_ms: r.timeMs,
      response: r.response,
    });
  } catch {
    // never disrupt the participant
  }
}
