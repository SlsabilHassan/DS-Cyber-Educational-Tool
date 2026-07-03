import type { ComponentType } from "react";
import { StackLesson } from "./StackLesson";

// Maps a module slug to its "learn first" lesson component. Add an entry here
// to give any module an educational primer above its challenges.
export const lessons: Record<string, ComponentType> = {
  "stack-smashing": StackLesson,
};
