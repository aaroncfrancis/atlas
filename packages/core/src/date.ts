// Internal date helpers. All math is done on the calendar day in UTC so results
// are deterministic regardless of the device timezone (important for tests and
// for matching due-date semantics across regions).
import type { WeekStart } from "./types";

export const MS_PER_DAY = 86_400_000;

/** Midnight (UTC) of the calendar day containing `d`, as epoch ms. */
export function startOfUTCDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Whole calendar days from `now` until `due` (date-only, UTC).
 * Negative = in the past, 0 = today, positive = in the future.
 * Accepts a "YYYY-MM-DD" date or a full ISO timestamp.
 */
export function daysUntil(due: string, now: Date): number {
  const diff = startOfUTCDay(new Date(due)) - startOfUTCDay(now);
  return Math.round(diff / MS_PER_DAY);
}

/** Epoch ms of the start (00:00 UTC) of the week containing `now`. */
export function startOfWeek(now: Date, weekStart: WeekStart): number {
  const startDay = weekStart === "sunday" ? 0 : 1;
  let diff = now.getUTCDay() - startDay;
  if (diff < 0) diff += 7;
  return startOfUTCDay(now) - diff * MS_PER_DAY;
}
