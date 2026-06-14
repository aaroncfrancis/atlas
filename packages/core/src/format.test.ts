import { describe, expect, it } from "vitest";
import { formatAmount, relativeDue } from "./format";

const NOW = new Date("2026-06-14T12:00:00.000Z");

describe("relativeDue", () => {
  it("returns 'none' for a null due date", () => {
    expect(relativeDue(null, NOW)).toEqual({ kind: "none" });
  });

  it("describes overdue items with a positive day count", () => {
    expect(relativeDue("2026-06-12", NOW)).toEqual({ kind: "overdue", days: 2 });
    expect(relativeDue("2026-06-13", NOW)).toEqual({ kind: "overdue", days: 1 });
  });

  it("describes today and tomorrow", () => {
    expect(relativeDue("2026-06-14", NOW)).toEqual({ kind: "today" });
    expect(relativeDue("2026-06-15", NOW)).toEqual({ kind: "tomorrow" });
  });

  it("describes future items", () => {
    expect(relativeDue("2026-06-20", NOW)).toEqual({ kind: "future", days: 6 });
  });
});

describe("formatAmount", () => {
  it("returns null for a null amount", () => {
    expect(formatAmount(null, "CAD")).toBeNull();
  });

  it("omits decimals for whole amounts", () => {
    expect(formatAmount(12, "CAD")).toBe("$12");
  });

  it("keeps decimals for fractional amounts", () => {
    expect(formatAmount(12.5, "CAD")).toBe("$12.50");
  });

  it("falls back to CAD for an empty currency", () => {
    expect(formatAmount(5, "")).toBe("$5");
  });
});
