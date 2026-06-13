import type { Recurrence } from "./types";

function formatUTC(year: number, monthIndex: number, day: number): string {
  // Date.UTC normalizes day/month overflow (e.g. day 44 rolls into next month).
  return new Date(Date.UTC(year, monthIndex, day)).toISOString().slice(0, 10);
}

/** Add whole months, clamping the day to the target month's last day. */
function addMonthsClamped(date: Date, months: number): string {
  const year = date.getUTCFullYear();
  const monthIndex = date.getUTCMonth();
  const day = date.getUTCDate();

  const absoluteMonth = monthIndex + months;
  const targetYear = year + Math.floor(absoluteMonth / 12);
  const targetMonth = ((absoluteMonth % 12) + 12) % 12;
  // Day 0 of the following month === last day of the target month.
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return formatUTC(targetYear, targetMonth, Math.min(day, lastDay));
}

/**
 * Roll a due date forward by ONE recurrence interval (CLAUDE.md §8).
 * Returns a "YYYY-MM-DD" date. `none` returns the input unchanged. Month/quarter/
 * year steps clamp to the end of the target month (e.g. Jan 31 + 1mo → Feb 28).
 */
export function advanceDate(due: string, recurrence: Recurrence): string {
  if (recurrence === "none") return due;
  const date = new Date(due);
  switch (recurrence) {
    case "weekly":
      return formatUTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 7);
    case "biweekly":
      return formatUTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 14);
    case "monthly":
      return addMonthsClamped(date, 1);
    case "quarterly":
      return addMonthsClamped(date, 3);
    case "yearly":
      return addMonthsClamped(date, 12);
  }
  return due;
}
