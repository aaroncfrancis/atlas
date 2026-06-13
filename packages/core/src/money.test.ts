import { describe, expect, it } from "vitest";
import { monthlyEquivalent } from "./money";

describe("monthlyEquivalent", () => {
  // Use a round base so the expected values are easy to verify.
  it("normalizes each recurrence to a monthly figure", () => {
    expect(monthlyEquivalent(120, "weekly")).toBeCloseTo(520); // 120 * 52 / 12
    expect(monthlyEquivalent(120, "biweekly")).toBeCloseTo(260); // 120 * 26 / 12
    expect(monthlyEquivalent(120, "monthly")).toBeCloseTo(120);
    expect(monthlyEquivalent(120, "quarterly")).toBeCloseTo(40); // / 3
    expect(monthlyEquivalent(120, "yearly")).toBeCloseTo(10); // / 12
    expect(monthlyEquivalent(120, "none")).toBeCloseTo(120);
  });
});
