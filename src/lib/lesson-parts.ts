// The three parts of a module's stepped lesson. Shared between the server
// route (static params, validation) and the client-side player registry.

export const LESSON_PARTS = ["basics", "patterns", "challenges"] as const;
export type LessonPart = (typeof LESSON_PARTS)[number];

export function isLessonPart(value: string): value is LessonPart {
  return (LESSON_PARTS as readonly string[]).includes(value);
}

export const LESSON_PART_LABELS: Record<LessonPart, string> = {
  basics: "The basics",
  patterns: "Safety patterns",
  challenges: "Challenges",
};
