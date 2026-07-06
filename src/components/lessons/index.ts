import type { ComponentType } from "react";
import { StackLesson } from "./StackLesson";
import { QueueLesson } from "./QueueLesson";
import { LinkedListLesson } from "./LinkedListLesson";
import { TreeLesson } from "./TreeLesson";
import { GraphLesson } from "./GraphLesson";
import { ArrayLesson } from "./ArrayLesson";
import { HashTableLesson } from "./HashTableLesson";

// Maps a module slug to its "learn first" lesson component. Add an entry here
// to give any module an educational primer above its challenges.
export const lessons: Record<string, ComponentType> = {
  "stack-smashing": StackLesson,
  "queue-quarantine": QueueLesson,
  "linked-labyrinth": LinkedListLesson,
  "tree-trojan": TreeLesson,
  "graph-gauntlet": GraphLesson,
  "array-armory": ArrayLesson,
  "hash-heist": HashTableLesson,
};
