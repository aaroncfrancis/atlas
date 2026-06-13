import { describe, expect, it } from "vitest";
import { isAutoPaid, isSubscriptionLike } from "./subscription";

describe("isSubscriptionLike", () => {
  it("is true for renewals regardless of entity", () => {
    expect(isSubscriptionLike({ type: "renewal" }, null)).toBe(true);
  });

  it("is true when the entity is a subscription", () => {
    expect(isSubscriptionLike({ type: "bill" }, { type: "subscription" })).toBe(true);
  });

  it("is false for a non-renewal on a non-subscription entity", () => {
    expect(isSubscriptionLike({ type: "bill" }, { type: "home" })).toBe(false);
    expect(isSubscriptionLike({ type: "task" }, null)).toBe(false);
  });
});

describe("isAutoPaid", () => {
  it("requires both the flag and a recurrence", () => {
    expect(isAutoPaid({ auto_paid: true, recurrence: "monthly" })).toBe(true);
    expect(isAutoPaid({ auto_paid: true, recurrence: "none" })).toBe(false);
    expect(isAutoPaid({ auto_paid: false, recurrence: "monthly" })).toBe(false);
  });
});
