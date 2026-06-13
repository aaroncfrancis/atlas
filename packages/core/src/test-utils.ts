import type { Obligation } from "./types";

/** Build a fully-typed Obligation for tests, overriding only what matters. */
export function makeObligation(overrides: Partial<Obligation> = {}): Obligation {
  return {
    id: "o1",
    user_id: "u1",
    entity_id: null,
    title: "Test obligation",
    description: null,
    type: "task",
    amount: null,
    currency: "CAD",
    due_date: null,
    status: "open",
    priority: "medium",
    source: "manual",
    snoozed_until: null,
    resolved_at: null,
    resolved_method: null,
    resolution_note: null,
    vendor: null,
    recurrence: "none",
    auto_paid: false,
    paying_account: null,
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}
