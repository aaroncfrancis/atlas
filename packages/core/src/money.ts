import type { Recurrence } from "./types";

/**
 * Normalize a recurring amount to its monthly equivalent (CLAUDE.md §8), used by
 * the Budget view. Weekly ×52/12, biweekly ×26/12, monthly ×1, quarterly ÷3,
 * yearly ÷12. A non-recurring amount is returned as-is.
 */
export function monthlyEquivalent(amount: number, recurrence: Recurrence): number {
  switch (recurrence) {
    case "weekly":
      return (amount * 52) / 12;
    case "biweekly":
      return (amount * 26) / 12;
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "yearly":
      return amount / 12;
    case "none":
      return amount;
  }
}
