// @atlas/core — shared domain logic & types. Pure, framework-agnostic, unit
// tested. Imported everywhere (app, hooks, future edge functions); never
// duplicated (CLAUDE.md §5).
export * from "./types";
export { derivePriority, proximity } from "./priority";
export { advanceDate } from "./recurrence";
export { isSubscriptionLike, isAutoPaid } from "./subscription";
export { monthlyEquivalent } from "./money";
export { weeklyProgress } from "./progress";
export type { WeeklyProgressOptions } from "./progress";
export { bucketObligations } from "./bucketing";
