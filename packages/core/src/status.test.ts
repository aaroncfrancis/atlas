import { describe, expect, it } from "vitest";
import { isActive, isResolved } from "./status";
import { makeObligation } from "./test-utils";

const NOW = new Date("2026-06-14T12:00:00.000Z");

describe("isResolved", () => {
  it("is true for done / automated / dismissed", () => {
    expect(isResolved({ status: "done" })).toBe(true);
    expect(isResolved({ status: "automated" })).toBe(true);
    expect(isResolved({ status: "dismissed" })).toBe(true);
  });

  it("is false for open / snoozed", () => {
    expect(isResolved({ status: "open" })).toBe(false);
    expect(isResolved({ status: "snoozed" })).toBe(false);
  });
});

describe("isActive", () => {
  it("is true for open obligations", () => {
    expect(isActive(makeObligation({ status: "open" }), NOW)).toBe(true);
  });

  it("is false for resolved obligations", () => {
    expect(isActive(makeObligation({ status: "done" }), NOW)).toBe(false);
  });

  it("treats a snoozed item as inactive until snoozed_until passes", () => {
    expect(
      isActive(makeObligation({ status: "snoozed", snoozed_until: "2026-06-20T00:00:00.000Z" }), NOW),
    ).toBe(false);
    expect(
      isActive(makeObligation({ status: "snoozed", snoozed_until: "2026-06-10T00:00:00.000Z" }), NOW),
    ).toBe(true);
  });
});
