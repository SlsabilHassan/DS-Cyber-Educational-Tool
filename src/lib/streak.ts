// Pure day-streak math, split out so it can be unit-tested without a clock.

// Return YYYY-MM-DD for a Date (UTC).
export function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Given the last active date and previous streak, compute the streak for
// `today`: unchanged if already counted today, +1 if yesterday, else reset to 1.
export function nextStreak(
  prevDate: string | null,
  prevStreak: number,
  today: string,
): number {
  if (prevDate === today) return prevStreak || 1; // already counted today
  const yesterday = dateStr(new Date(Date.parse(today + "T00:00:00Z") - 86400000));
  if (prevDate === yesterday) return (prevStreak || 0) + 1; // consecutive day
  return 1; // streak broken (or first ever)
}
