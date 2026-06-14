import type { Obligation, ObligationStatus } from "./types";

/** Statuses that take an obligation out of the active feed (CLAUDE.md §8). */
export const RESOLVED_STATUSES: ObligationStatus[] = ["done", "automated", "dismissed"];

/** Whether an obligation is resolved (done / automated / dismissed). */
export function isResolved(
  obligation: Pick<Obligation, "status">,
): boolean {
  return RESOLVED_STATUSES.includes(obligation.status);
}

/**
 * Whether an obligation is active in the main feed right now (CLAUDE.md §8):
 * resolved items are out; a snoozed item only returns once `snoozed_until` has
 * passed.
 */
export function isActive(
  obligation: Pick<Obligation, "status" | "snoozed_until">,
  now: Date = new Date(),
): boolean {
  if (RESOLVED_STATUSES.includes(obligation.status)) return false;
  if (obligation.status === "snoozed") {
    if (obligation.snoozed_until === null) return false;
    return new Date(obligation.snoozed_until).getTime() <= now.getTime();
  }
  return true;
}
