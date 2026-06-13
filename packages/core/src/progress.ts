import { daysUntil, startOfWeek } from "./date";
import type { Obligation, WeeklyProgress, WeekStart } from "./types";

export interface WeeklyProgressOptions {
  now?: Date;
  /** Week boundary, defaults to "sunday" (matches `profiles.week_start`). */
  weekStart?: WeekStart;
}

/**
 * Weekly progress for the home ProgressRing (CLAUDE.md §8): obligations resolved
 * during the current week vs. active obligations due within the next 7 days.
 * `ratio` is guarded against divide-by-zero.
 *
 * `weekStart` is a parameter (not hardcoded) so the caller can pass the user's
 * `profiles.week_start`; it defaults to Sunday.
 */
export function weeklyProgress(
  obligations: Obligation[],
  options: WeeklyProgressOptions = {},
): WeeklyProgress {
  const now = options.now ?? new Date();
  const weekStart = options.weekStart ?? "sunday";
  const weekStartMs = startOfWeek(now, weekStart);

  let resolved = 0;
  let dueSoon = 0;

  for (const o of obligations) {
    const isResolved = o.status === "done" || o.status === "automated";
    if (isResolved && o.resolved_at !== null) {
      if (new Date(o.resolved_at).getTime() >= weekStartMs) resolved += 1;
      continue;
    }
    const isActive = o.status === "open" || o.status === "snoozed";
    if (isActive && o.due_date !== null) {
      const days = daysUntil(o.due_date, now);
      if (days >= 0 && days <= 7) dueSoon += 1;
    }
  }

  const total = resolved + dueSoon;
  return { resolved, total, ratio: total === 0 ? 0 : resolved / total };
}
