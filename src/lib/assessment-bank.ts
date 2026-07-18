// The assessment item bank. PRE and POST use PARALLEL forms — same construct
// and item_id (so they pair for analysis), matched difficulty, but different
// specifics to blunt the test-retest memory effect. Self-efficacy items appear
// in BOTH pre and post to measure confidence change; experience items are
// post-only. This is a starter set — expand it to cover all 8 modules.

import type { AssessmentItem, LikertItem } from "@/lib/assessment";

// ── Self-efficacy (asked in BOTH pre and post) ────────────────────────
const SELF_EFFICACY: LikertItem[] = [
  {
    id: "se-overflow",
    kind: "likert",
    construct: "self-efficacy",
    prompt: "How much do you agree?",
    statement: "I could find and fix a buffer-overflow bug in a piece of code.",
  },
  {
    id: "se-ds-security",
    kind: "likert",
    construct: "self-efficacy",
    prompt: "How much do you agree?",
    statement:
      "I understand how everyday data structures create security risks.",
  },
];

// ── PRE-TEST (Form A) ──────────────────────────────────────────────────
export const PRE_ITEMS: AssessmentItem[] = [
  {
    id: "array-last-index",
    kind: "choice",
    construct: "array-bounds",
    module: "array-armory",
    prompt: "An array has 8 slots (indices start at 0). What is the last valid index?",
    askConfidence: true,
    options: [
      { text: "8" },
      { text: "7", correct: true },
      { text: "9" },
      { text: "It depends on the language" },
    ],
  },
  {
    id: "stack-pop-order",
    kind: "choice",
    construct: "stack-lifo",
    module: "stack-smashing",
    prompt: "You push A, then B, then C onto a stack, then pop twice. What comes out, in order?",
    askConfidence: true,
    code: `push(A); push(B); push(C)\npop()  # ?\npop()  # ?`,
    options: [
      { text: "A, then B" },
      { text: "C, then B", correct: true },
      { text: "C, then A" },
    ],
  },
  {
    id: "spot-oob-write",
    kind: "spotbug",
    construct: "array-bounds",
    module: "array-armory",
    prompt: "Click the line that lets an out-of-bounds write happen.",
    askConfidence: true,
    codeLines: [
      "def write_value(array, index, value):",
      "    array.data[index] = value",
      "    array.count += 1",
      "    return True",
    ],
    buggyLine: 1,
  },
  {
    id: "safe-write-order",
    kind: "order",
    construct: "defensive-validation",
    module: "array-armory",
    prompt: "Put these steps in the correct order for a SAFE write to an array.",
    askConfidence: true,
    steps: [
      "Check the index is inside [0, length)",
      "If it's out of range, reject the write",
      "Otherwise, write the value into the slot",
    ],
  },
  {
    id: "hash-collision",
    kind: "choice",
    construct: "hashing",
    module: "hash-heist",
    prompt:
      "Two different keys hash to the SAME bucket. In a correct hash table, what happens?",
    askConfidence: true,
    options: [
      { text: "The table crashes" },
      { text: "The second key is rejected" },
      { text: "Both entries chain together in that bucket", correct: true },
      { text: "The first value is silently overwritten" },
    ],
  },
  ...SELF_EFFICACY,
];

// ── POST-TEST (Form B — parallel, matched to the pre) ──────────────────
export const POST_ITEMS: AssessmentItem[] = [
  {
    id: "array-last-index",
    kind: "choice",
    construct: "array-bounds",
    module: "array-armory",
    prompt: "An array has 6 slots (indices start at 0). What is the last valid index?",
    askConfidence: true,
    options: [
      { text: "6" },
      { text: "5", correct: true },
      { text: "7" },
      { text: "It depends on the language" },
    ],
  },
  {
    id: "stack-pop-order",
    kind: "choice",
    construct: "stack-lifo",
    module: "stack-smashing",
    prompt: "You push X, then Y, then Z onto a stack, then pop twice. What comes out, in order?",
    askConfidence: true,
    code: `push(X); push(Y); push(Z)\npop()  # ?\npop()  # ?`,
    options: [
      { text: "X, then Y" },
      { text: "Z, then Y", correct: true },
      { text: "Z, then X" },
    ],
  },
  {
    id: "spot-oob-write",
    kind: "spotbug",
    construct: "array-bounds",
    module: "array-armory",
    prompt: "Click the line that lets an out-of-bounds write happen.",
    askConfidence: true,
    codeLines: [
      "def store(buffer, pos, item):",
      "    buffer.slots[pos] = item",
      "    buffer.size += 1",
      "    return True",
    ],
    buggyLine: 1,
  },
  {
    id: "safe-write-order",
    kind: "order",
    construct: "defensive-validation",
    module: "array-armory",
    prompt: "Put these steps in the correct order for a SAFE write to an array.",
    askConfidence: true,
    steps: [
      "Confirm the index is within bounds",
      "Refuse the write if it is out of range",
      "Only then store the value in the slot",
    ],
  },
  {
    id: "hash-collision",
    kind: "choice",
    construct: "hashing",
    module: "hash-heist",
    prompt:
      "When two keys land in the same hash bucket, a well-written hash table…",
    askConfidence: true,
    options: [
      { text: "Throws an error" },
      { text: "Drops the newer key" },
      { text: "Keeps both by chaining them in the bucket", correct: true },
      { text: "Overwrites the older value without warning" },
    ],
  },
  ...SELF_EFFICACY,
];

// ── EXPERIENCE SURVEY (post only) ──────────────────────────────────────
export const EXPERIENCE_ITEMS: LikertItem[] = [
  {
    id: "exp-visuals",
    kind: "likert",
    construct: "experience",
    prompt: "How much do you agree?",
    statement: "The interactive visualizations helped me understand the ideas.",
  },
  {
    id: "exp-challenges",
    kind: "likert",
    construct: "experience",
    prompt: "How much do you agree?",
    statement: "Fixing the vulnerable code kept me engaged.",
  },
  {
    id: "exp-recommend",
    kind: "likert",
    construct: "experience",
    prompt: "How much do you agree?",
    statement: "I would recommend Hacky Stacky to another student.",
  },
];
