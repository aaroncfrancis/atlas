// Shared domain types — mirror the live Supabase schema enums (CLAUDE.md §6).
// String-literal unions (not `const enum`) so the package can be consumed as raw
// TS source by Metro/Babel without isolatedModules issues (CLAUDE.md §5 mapping).

export type Recurrence =
  | "none"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export type Priority = "low" | "medium" | "high" | "urgent";

export type Proximity = "overdue" | "soon" | "ahead";

export type ObligationStatus =
  | "open"
  | "done"
  | "snoozed"
  | "dismissed"
  | "automated";

export type ObligationType =
  | "bill"
  | "renewal"
  | "appointment"
  | "deadline"
  | "task";

export type ObligationSource = "manual" | "seed" | "scan" | "recurrence";

export type ResolvedMethod = "paid" | "automated" | "dismissed";

export type EntityType =
  | "home"
  | "car"
  | "pet"
  | "subscription"
  | "account"
  | "bank"
  | "insurance"
  | "health";

export type WeekStart = "sunday" | "monday";

// NOTE: Row DTOs are `type` aliases, not `interface`s, on purpose: only type
// aliases are assignable to `Record<string, unknown>`, which @supabase's
// generated-types contract (`GenericTable`) requires for typed queries.

/** A real-world thing obligations attach to (CLAUDE.md §6 `entities`). */
export type Entity = {
  id: string;
  user_id: string;
  type: EntityType;
  name: string;
  icon: string | null;
  color: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** The core unit of the product (CLAUDE.md §6 `obligations`). */
export type Obligation = {
  id: string;
  user_id: string;
  entity_id: string | null;
  title: string;
  description: string | null;
  type: ObligationType;
  amount: number | null;
  currency: string;
  due_date: string | null;
  status: ObligationStatus;
  priority: Priority;
  source: ObligationSource;
  snoozed_until: string | null;
  resolved_at: string | null;
  resolved_method: ResolvedMethod | null;
  resolution_note: string | null;
  vendor: string | null;
  recurrence: Recurrence;
  auto_paid: boolean;
  paying_account: string | null;
  created_at: string;
}

/** Weekly progress summary that drives the home `ProgressRing` (CLAUDE.md §8). */
export interface WeeklyProgress {
  /** Obligations resolved during the current week. */
  resolved: number;
  /** resolved + active obligations due within the next 7 days. */
  total: number;
  /** resolved / total, guarded against divide-by-zero (0 when total is 0). */
  ratio: number;
}

/** Home-feed sections (CLAUDE.md §8 "Home grouping intent"). */
export interface BucketedObligations {
  needs_attention: Obligation[];
  upcoming: Obligation[];
  later: Obligation[];
}
