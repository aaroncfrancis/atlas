import { describe, expect, it } from "vitest";
import { bucketObligations } from "./bucketing";
import { makeObligation } from "./test-utils";
import type { Obligation } from "./types";

const NOW = new Date("2026-06-13T00:00:00.000Z");

const idsIn = (list: Obligation[]): string[] => list.map((o) => o.id);

describe("bucketObligations", () => {
  it("puts overdue active items in needs_attention", () => {
    const overdue = makeObligation({ id: "overdue", status: "open", due_date: "2026-06-10", priority: "medium" });
    const result = bucketObligations([overdue], NOW);
    expect(idsIn(result.needs_attention)).toContain("overdue");
  });

  it("puts a high-priority far-future item in needs_attention (priority path)", () => {
    const highFuture = makeObligation({ id: "high", status: "open", due_date: "2026-07-03", priority: "high" }); // +20
    const result = bucketObligations([highFuture], NOW);
    expect(idsIn(result.needs_attention)).toContain("high");
  });

  it("puts a low-priority item due within 7 days in upcoming", () => {
    const soon = makeObligation({ id: "soon", status: "open", due_date: "2026-06-16", priority: "low" }); // +3
    const result = bucketObligations([soon], NOW);
    expect(idsIn(result.upcoming)).toContain("soon");
    expect(idsIn(result.needs_attention)).not.toContain("soon");
  });

  it("puts undated and far-future low-priority items in later", () => {
    const undated = makeObligation({ id: "undated", status: "open", due_date: null, priority: "low" });
    const far = makeObligation({ id: "far", status: "open", due_date: "2026-07-20", priority: "low" }); // +37
    const result = bucketObligations([undated, far], NOW);
    expect(idsIn(result.later)).toEqual(expect.arrayContaining(["undated", "far"]));
  });

  it("treats a snoozed item as active", () => {
    const snoozed = makeObligation({
      id: "snoozed",
      status: "snoozed",
      snoozed_until: "2026-06-20",
      due_date: "2026-06-14", // +1
      priority: "medium",
    });
    const result = bucketObligations([snoozed], NOW);
    expect(idsIn(result.upcoming)).toContain("snoozed");
  });

  it("excludes resolved and dismissed obligations from every bucket", () => {
    const done = makeObligation({ id: "done", status: "done", due_date: "2026-06-10" });
    const dismissed = makeObligation({ id: "dismissed", status: "dismissed", due_date: "2026-06-10" });
    const result = bucketObligations([done, dismissed], NOW);
    const all = [...result.needs_attention, ...result.upcoming, ...result.later];
    expect(idsIn(all)).toHaveLength(0);
  });
});
