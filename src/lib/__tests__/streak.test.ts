import { describe, it, expect } from "vitest";
import { nextStreak, dateStr } from "@/lib/streak";

describe("nextStreak", () => {
  const today = "2026-07-22";
  const yesterday = "2026-07-21";

  it("starts a streak at 1 for a first-ever visit", () => {
    expect(nextStreak(null, 0, today)).toBe(1);
  });

  it("increments when the last visit was yesterday", () => {
    expect(nextStreak(yesterday, 4, today)).toBe(5);
  });

  it("leaves the streak unchanged when already counted today", () => {
    expect(nextStreak(today, 7, today)).toBe(7);
  });

  it("resets to 1 after a gap of more than one day", () => {
    expect(nextStreak("2026-07-19", 9, today)).toBe(1);
  });

  it("treats a stored streak of 0 today as 1", () => {
    expect(nextStreak(today, 0, today)).toBe(1);
  });

  it("handles month boundaries", () => {
    expect(nextStreak("2026-06-30", 3, "2026-07-01")).toBe(4);
  });
});

describe("dateStr", () => {
  it("formats a date as YYYY-MM-DD (UTC)", () => {
    expect(dateStr(new Date("2026-07-22T15:30:00Z"))).toBe("2026-07-22");
  });
});
