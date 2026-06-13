import { daysUntil } from "./date";
import type { Priority, Proximity } from "./types";

/**
 * Derive a priority from a due date (CLAUDE.md §8):
 * Urgent `< 0` days · High `≤ 2` · Medium `≤ 7` · Low `> 7`.
 * An undated obligation is the lowest priority.
 */
export function derivePriority(due: string | null, now: Date = new Date()): Priority {
  if (due === null) return "low";
  const days = daysUntil(due, now);
  if (days < 0) return "urgent";
  if (days <= 2) return "high";
  if (days <= 7) return "medium";
  return "low";
}

/**
 * Proximity bucket driving the due-pill color (CLAUDE.md §8):
 * `overdue (< 0)` · `soon (≤ 2)` · `ahead (> 2)`.
 * An undated obligation is treated as not-soon (`ahead`).
 */
export function proximity(due: string | null, now: Date = new Date()): Proximity {
  if (due === null) return "ahead";
  const days = daysUntil(due, now);
  if (days < 0) return "overdue";
  if (days <= 2) return "soon";
  return "ahead";
}
