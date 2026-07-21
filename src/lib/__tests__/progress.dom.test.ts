// Runs under jsdom (see vitest.config.ts environmentMatchGlobs) so localStorage
// exists. Covers the sequential-unlock and merge logic.

import { describe, it, expect, beforeEach } from "vitest";
import {
  challengeKey,
  markSolved,
  isSolved,
  isChallengeDone,
  isChallengeUnlocked,
  markRevealed,
  mergeProgress,
  getSolvedKeys,
} from "@/lib/progress";

const IDS = ["a", "b", "c"];

beforeEach(() => {
  window.localStorage.clear();
});

describe("solved state", () => {
  it("marks and reads a solve", () => {
    expect(isSolved("stack", "a")).toBe(false);
    markSolved("stack", "a");
    expect(isSolved("stack", "a")).toBe(true);
    expect(getSolvedKeys()).toContain(challengeKey("stack", "a"));
  });
});

describe("sequential unlocking", () => {
  it("unlocks the first challenge unconditionally", () => {
    expect(isChallengeUnlocked("stack", IDS, "a")).toBe(true);
  });

  it("keeps later challenges locked until the previous is done", () => {
    expect(isChallengeUnlocked("stack", IDS, "b")).toBe(false);
    markSolved("stack", "a");
    expect(isChallengeUnlocked("stack", IDS, "b")).toBe(true);
    expect(isChallengeUnlocked("stack", IDS, "c")).toBe(false);
  });

  it("counts a revealed solution as 'done' for unlocking", () => {
    expect(isChallengeDone("stack", "a")).toBe(false);
    markRevealed("stack", "a");
    expect(isChallengeDone("stack", "a")).toBe(true);
    expect(isChallengeUnlocked("stack", IDS, "b")).toBe(true);
  });
});

describe("mergeProgress", () => {
  it("unions incoming keys without dropping local ones", () => {
    markSolved("stack", "a");
    mergeProgress(["stack/b", "queue/x"], ["tree/y"]);
    expect(isSolved("stack", "a")).toBe(true);
    expect(isSolved("stack", "b")).toBe(true);
    expect(isSolved("queue", "x")).toBe(true);
    expect(isChallengeDone("tree", "y")).toBe(true); // via revealed
  });

  it("never removes anything already solved", () => {
    markSolved("stack", "a");
    mergeProgress([], []);
    expect(isSolved("stack", "a")).toBe(true);
  });
});
