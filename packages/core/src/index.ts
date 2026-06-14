// @atlas/core — shared domain logic & types. Pure, framework-agnostic, unit
// tested. Imported everywhere (app, hooks, future edge functions); never
// duplicated (CLAUDE.md §5).
export * from "./types";
export { daysUntil, startOfUTCDay, startOfWeek, MS_PER_DAY } from "./date";
export { derivePriority, proximity } from "./priority";
export { advanceDate } from "./recurrence";
export { isSubscriptionLike, isAutoPaid, SUBSCRIPTION_RECURRENCES } from "./subscription";
export { monthlyEquivalent } from "./money";
export { weeklyProgress } from "./progress";
export type { WeeklyProgressOptions } from "./progress";
export { bucketObligations } from "./bucketing";
export { relativeDue, formatAmount } from "./format";
export type { DueLabel } from "./format";
export { entityColor, DEFAULT_ENTITY_COLOR } from "./entity";
export { isActive, isResolved, RESOLVED_STATUSES } from "./status";
