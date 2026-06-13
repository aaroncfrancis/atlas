import { describe, expect, it } from "vitest";
import { advanceDate } from "./recurrence";

describe("advanceDate", () => {
  it("returns the same date for `none`", () => {
    expect(advanceDate("2026-06-13", "none")).toBe("2026-06-13");
  });

  it("advances weekly by 7 days", () => {
    expect(advanceDate("2026-06-13", "weekly")).toBe("2026-06-20");
  });

  it("advances biweekly by 14 days", () => {
    expect(advanceDate("2026-06-13", "biweekly")).toBe("2026-06-27");
  });

  it("advances monthly, clamping to the month end", () => {
    expect(advanceDate("2026-06-13", "monthly")).toBe("2026-07-13");
    expect(advanceDate("2026-01-31", "monthly")).toBe("2026-02-28");
  });

  it("advances quarterly by 3 months", () => {
    expect(advanceDate("2026-01-15", "quarterly")).toBe("2026-04-15");
  });

  it("advances yearly, clamping leap days", () => {
    expect(advanceDate("2026-06-13", "yearly")).toBe("2027-06-13");
    expect(advanceDate("2028-02-29", "yearly")).toBe("2029-02-28");
  });
});
