import { describe, expect, it } from "vitest";
import { weeklyProgress } from "./progress";
import { makeObligation } from "./test-utils";

// 2026-06-14 is a Sunday (UTC), so with weekStart "sunday" the week begins at
// exactly 2026-06-14T00:00:00Z — handy for testing the boundary precisely.
const NOW = new Date("2026-06-14T12:00:00.000Z");

describe("weeklyProgress", () => {
  it("returns zeros for an empty list (no divide-by-zero)", () => {
    expect(weeklyProgress([], { now: NOW })).toEqual({ resolved: 0, total: 0, ratio: 0 });
  });

  it("counts a resolution at the first instant of the week, but not one before", () => {
    const thisWeek = makeObligation({
      id: "a",
      status: "done",
      resolved_at: "2026-06-14T00:00:00.000Z", // exactly week start
    });
    const lastWeek = makeObligation({
      id: "b",
      status: "done",
      resolved_at: "2026-06-13T23:59:59.999Z", // one ms before week start
    });
    const result = weeklyProgress([thisWeek, lastWeek], { now: NOW });
    expect(result.resolved).toBe(1);
    expect(result.total).toBe(1);
    expect(result.ratio).toBe(1);
  });

  it("counts active items due within 7 days inclusive, not +8", () => {
    const dueIn7 = makeObligation({ id: "c", status: "open", due_date: "2026-06-21" }); // +7
    const dueIn8 = makeObligation({ id: "d", status: "open", due_date: "2026-06-22" }); // +8
    const result = weeklyProgress([dueIn7, dueIn8], { now: NOW });
    expect(result.total).toBe(1); // only the +7 item
    expect(result.resolved).toBe(0);
    expect(result.ratio).toBe(0);
  });

  it("computes the ratio of resolved to resolved + due-soon", () => {
    const done = makeObligation({ id: "e", status: "automated", resolved_at: "2026-06-15T09:00:00.000Z" });
    const dueSoon = makeObligation({ id: "f", status: "open", due_date: "2026-06-18" });
    const result = weeklyProgress([done, dueSoon], { now: NOW });
    expect(result).toEqual({ resolved: 1, total: 2, ratio: 0.5 });
  });

  it("honors a Monday week start", () => {
    // With weekStart "monday" and NOW on Sun 2026-06-14, the week began Mon 06-08.
    const inWeek = makeObligation({ id: "g", status: "done", resolved_at: "2026-06-10T00:00:00.000Z" });
    const beforeWeek = makeObligation({ id: "h", status: "done", resolved_at: "2026-06-07T00:00:00.000Z" });
    const result = weeklyProgress([inWeek, beforeWeek], { now: NOW, weekStart: "monday" });
    expect(result.resolved).toBe(1);
  });
});
