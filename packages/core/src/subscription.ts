import type { Entity, Obligation, Recurrence } from "./types";

/**
 * Recurrence options offered in the subscription form section (CLAUDE.md §8).
 * Excludes `none` and `quarterly` to match the Lovable reference.
 */
export const SUBSCRIPTION_RECURRENCES: Recurrence[] = [
  "weekly",
  "biweekly",
  "monthly",
  "yearly",
];

/**
 * An obligation behaves like a subscription when it's a renewal or hangs off a
 * subscription entity (CLAUDE.md §8). Drives the subscription form section and
 * the Cancel-Subscription action.
 */
export function isSubscriptionLike(
  obligation: Pick<Obligation, "type">,
  entity: Pick<Entity, "type"> | null,
): boolean {
  return obligation.type === "renewal" || entity?.type === "subscription";
}

/**
 * Whether an obligation is on auto-pay (CLAUDE.md §8): the user-tracked
 * `auto_paid` flag is set AND it recurs. NOTE: "auto-paid" is a label only —
 * Atlas never moves money (CLAUDE.md §11.8).
 */
export function isAutoPaid(
  obligation: Pick<Obligation, "auto_paid" | "recurrence">,
): boolean {
  return obligation.auto_paid && obligation.recurrence !== "none";
}
