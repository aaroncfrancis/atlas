import { daysUntil } from "./date";
import { proximity } from "./priority";
import type { BucketedObligations, Obligation } from "./types";

/**
 * Group active obligations into the home-feed sections (CLAUDE.md §8):
 *  - needs_attention: open/snoozed AND (overdue OR stored priority urgent|high)
 *  - upcoming:        otherwise, due within the next 7 days
 *  - later:           everything else (beyond 7 days OR undated)
 *
 * Uses the obligation's STORED `priority` (not the derived one) so a manually
 * flagged item far in the future can still surface as "needs attention".
 * Resolved/dismissed obligations are excluded entirely.
 */
export function bucketObligations(
  obligations: Obligation[],
  now: Date = new Date(),
): BucketedObligations {
  const needs_attention: Obligation[] = [];
  const upcoming: Obligation[] = [];
  const later: Obligation[] = [];

  for (const o of obligations) {
    if (o.status !== "open" && o.status !== "snoozed") continue;

    const isOverdue = proximity(o.due_date, now) === "overdue";
    const isUrgentOrHigh = o.priority === "urgent" || o.priority === "high";

    if (isOverdue || isUrgentOrHigh) {
      needs_attention.push(o);
      continue;
    }

    if (o.due_date !== null) {
      const days = daysUntil(o.due_date, now);
      if (days >= 0 && days <= 7) {
        upcoming.push(o);
        continue;
      }
    }

    later.push(o);
  }

  return { needs_attention, upcoming, later };
}
