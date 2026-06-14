import { daysUntil } from "./date";

/**
 * A localizable description of how far away an obligation's due date is
 * (CLAUDE.md §8). Core stays i18n-agnostic: it returns a semantic descriptor and
 * the UI maps each `kind` to a dictionary key (`due.*`), so all user-facing copy
 * lives in the EN/FR dictionaries (CLAUDE.md §11.5).
 */
export type DueLabel =
  | { kind: "none" }
  | { kind: "overdue"; days: number }
  | { kind: "today" }
  | { kind: "tomorrow" }
  | { kind: "future"; days: number };

/** Describe an obligation's proximity to its due date (mirrors `relativeDue`). */
export function relativeDue(due: string | null, now: Date = new Date()): DueLabel {
  if (due === null) return { kind: "none" };
  const days = daysUntil(due, now);
  if (days < 0) return { kind: "overdue", days: Math.abs(days) };
  if (days === 0) return { kind: "today" };
  if (days === 1) return { kind: "tomorrow" };
  return { kind: "future", days };
}

/**
 * Format a money amount for display (CLAUDE.md §8). Returns `null` for a null
 * amount so callers can skip rendering. Decimals are omitted for whole amounts.
 * Locale defaults to Canadian English; pass `fr-CA` for French screens.
 */
export function formatAmount(
  amount: number | null,
  currency: string,
  locale: string = "en-CA",
): string | null {
  if (amount === null) return null;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency || "CAD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
