// Integration test across every challenge. For each one, run its STARTER code
// through its own test harness (the same driver the in-browser autograder uses)
// under local CPython, and assert:
//   1. the starter is valid Python (loads without error),
//   2. the harness is valid and defines at least one test,
//   3. the starter FAILS at least one test — i.e. the vulnerability is real and
//      the autograder actually detects it.
// This catches regressions: a broken starter, a broken harness, or a challenge
// whose tests no longer catch the bug they're supposed to.

import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { modules } from "@/lib/modules";

const HARNESS = resolve(__dirname, "../../../scripts/pyharness.py");

type Result = {
  loadError: boolean;
  harnessError: boolean;
  passed: number;
  failed: number;
  total: number;
  detail: string;
};

function grade(code: string, tests: string): Result {
  const res = spawnSync("python3", [HARNESS], {
    input: JSON.stringify({ code, tests }),
    encoding: "utf-8",
    timeout: 20000,
  });
  const line = (res.stdout || "").trim().split("\n").pop() || "{}";
  return JSON.parse(line) as Result;
}

const graded = modules.flatMap((m) =>
  m.challenges
    .filter((c) => c.tests && c.starterCode)
    .map((c) => ({ module: m.slug, id: c.id, name: c.name, challenge: c })),
);

describe("challenge suite integrity", () => {
  it("has 8 modules and 64 gradable challenges", () => {
    expect(modules.length).toBe(8);
    expect(graded.length).toBe(64);
  });

  for (const { module, id, name, challenge } of graded) {
    it(`${module} / ${id} — ${name}`, () => {
      const r = grade(challenge.starterCode!, challenge.tests!);
      expect(r.loadError, `starter didn't load:\n${r.detail}`).toBe(false);
      expect(r.harnessError, `test harness didn't load:\n${r.detail}`).toBe(
        false,
      );
      expect(r.total, "harness defines no tests").toBeGreaterThan(0);
      // The vulnerable starter must be caught by at least one test.
      expect(
        r.failed,
        `starter passed every test — the vulnerability isn't detected`,
      ).toBeGreaterThan(0);
    });
  }
});
