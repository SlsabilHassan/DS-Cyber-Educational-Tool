// Runs under jsdom (localStorage). Verifies challenges-solved and
// modules-"crashed" counting from the module registry.

import { describe, it, expect, beforeEach } from "vitest";
import { modules } from "@/lib/modules";
import { challengeKey } from "@/lib/progress";
import { computeLocalStats } from "@/lib/leaderboard";

const SOLVED_KEY = "structsec:solved:v1";

beforeEach(() => {
  window.localStorage.clear();
});

describe("computeLocalStats", () => {
  it("is all zeros with no progress", () => {
    expect(computeLocalStats()).toEqual({
      challengesSolved: 0,
      modulesCrashed: 0,
    });
  });

  it("counts solved challenges and fully-cleared modules", () => {
    const full = modules[0]; // every challenge solved → "crashed"
    const partial = modules[1]; // only one solved → not crashed

    const solved = [
      ...full.challenges.map((c) => challengeKey(full.slug, c.id)),
      challengeKey(partial.slug, partial.challenges[0].id),
    ];
    window.localStorage.setItem(SOLVED_KEY, JSON.stringify(solved));

    const stats = computeLocalStats();
    expect(stats.challengesSolved).toBe(full.challenges.length + 1);
    expect(stats.modulesCrashed).toBe(1);
  });

  it("counts every module as crashed once all are fully solved", () => {
    const solved = modules.flatMap((m) =>
      m.challenges.map((c) => challengeKey(m.slug, c.id)),
    );
    window.localStorage.setItem(SOLVED_KEY, JSON.stringify(solved));

    const stats = computeLocalStats();
    expect(stats.modulesCrashed).toBe(modules.length);
  });
});
