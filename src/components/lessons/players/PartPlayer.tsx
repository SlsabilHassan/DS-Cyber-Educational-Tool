"use client";

import { useMemo } from "react";
import { LessonPlayer, type LessonStep } from "../LessonPlayer";
import { ConceptCard, type Concept } from "../lessonui";
import {
  CONCEPTS as STACK_CONCEPTS,
  PatternCard,
  type Concept as StackConcept,
} from "../StackLesson";
import { CONCEPTS as QUEUE_CONCEPTS } from "../QueueLesson";
import { CONCEPTS as LINKED_CONCEPTS } from "../LinkedListLesson";
import { CONCEPTS as TREE_CONCEPTS } from "../TreeLesson";
import { CONCEPTS as GRAPH_CONCEPTS } from "../GraphLesson";
import { CONCEPTS as ARRAY_CONCEPTS } from "../ArrayLesson";
import { CONCEPTS as HASH_CONCEPTS } from "../HashTableLesson";
import { CONCEPTS as HEAP_CONCEPTS } from "../HeapLesson";
import {
  buildPatternSteps,
  buildChallengeSteps,
  patternsIntroStep,
  challengesIntroStep,
} from "./parts";
import { stackIntroSteps } from "./intros/stack";
import { queueIntroSteps } from "./intros/queue";
import { linkedListIntroSteps } from "./intros/linkedlist";
import { treeIntroSteps } from "./intros/tree";
import { graphIntroSteps } from "./intros/graph";
import { arrayIntroSteps } from "./intros/array";
import { hashTableIntroSteps } from "./intros/hashtable";
import { heapIntroSteps } from "./intros/heap";
import { getModule } from "@/lib/modules";
import type { LessonPart } from "@/lib/lesson-parts";

// Per-module ingredients: the authored intro steps, the pattern cards, and
// the plain-English name of the thing being kept safe ("your stacks", …).
type ModuleDef = {
  intro: LessonStep[];
  patternCards: LessonStep[];
  thing: string;
};

const genericPatterns = (concepts: Concept[]) =>
  buildPatternSteps(concepts, (c) => <ConceptCard concept={c} />);

const REGISTRY: Record<string, ModuleDef> = {
  "array-armory": {
    intro: arrayIntroSteps,
    patternCards: genericPatterns(ARRAY_CONCEPTS),
    thing: "arrays",
  },
  "stack-smashing": {
    intro: stackIntroSteps,
    patternCards: buildPatternSteps(STACK_CONCEPTS, (c: StackConcept) => (
      <PatternCard concept={c} />
    )),
    thing: "stacks",
  },
  "queue-quarantine": {
    intro: queueIntroSteps,
    patternCards: genericPatterns(QUEUE_CONCEPTS),
    thing: "queues",
  },
  "linked-labyrinth": {
    intro: linkedListIntroSteps,
    patternCards: genericPatterns(LINKED_CONCEPTS),
    thing: "linked lists",
  },
  "hash-heist": {
    intro: hashTableIntroSteps,
    patternCards: genericPatterns(HASH_CONCEPTS),
    thing: "hash tables",
  },
  "tree-trojan": {
    intro: treeIntroSteps,
    patternCards: genericPatterns(TREE_CONCEPTS),
    thing: "trees",
  },
  "graph-gauntlet": {
    intro: graphIntroSteps,
    patternCards: genericPatterns(GRAPH_CONCEPTS),
    thing: "graphs",
  },
  "heap-havoc": {
    intro: heapIntroSteps,
    patternCards: genericPatterns(HEAP_CONCEPTS),
    thing: "heaps",
  },
};

// Assembles the steps and completion screen for one part of one module,
// and hands them to the LessonPlayer.
export function PartPlayer({
  slug,
  part,
}: {
  slug: string;
  part: LessonPart;
}) {
  const player = useMemo(() => {
    const def = REGISTRY[slug];
    const module = getModule(slug);
    if (!def || !module) return null;

    if (part === "basics") {
      return {
        steps: def.intro,
        completeTitle: "Basics down!",
        completeMessage: `You know how ${def.thing} work. Next: the patterns that keep them safe.`,
        cta: {
          href: `/modules/${slug}/learn/patterns`,
          label: "Continue to the patterns",
        },
      };
    }
    if (part === "patterns") {
      return {
        steps: [
          patternsIntroStep(def.patternCards.length, def.thing),
          ...def.patternCards,
        ],
        completeTitle: "Patterns mastered!",
        completeMessage:
          "That's the defensive toolkit. Time to use it on real vulnerable code.",
        cta: {
          href: `/modules/${slug}/learn/challenges`,
          label: "Continue to the challenges",
        },
      };
    }
    return {
      steps: [
        challengesIntroStep(),
        ...buildChallengeSteps(slug, module.challenges),
      ],
      completeTitle: "Module complete! 🎉",
      completeMessage: "Every fix shipped. Sudo salutes you.",
      cta: { href: `/modules/${slug}`, label: `Back to ${module.title}` },
    };
  }, [slug, part]);

  if (!player) return null;

  return (
    <LessonPlayer
      steps={player.steps}
      moduleSlug={slug}
      completeTitle={player.completeTitle}
      completeMessage={player.completeMessage}
      cta={player.cta}
    />
  );
}
