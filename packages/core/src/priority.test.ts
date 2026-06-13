import { describe, expect, it } from "vitest";
import { derivePriority, proximity } from "./priority";

// Fixed "now" so day math is deterministic. 2026-06-13 (UTC).
const NOW = new Date("2026-06-13T00:00:00.000Z");

describe("derivePriority", () => {
  it("is urgent when overdue", () => {
    expect(derivePriority("2026-06-12", NOW)).toBe("urgent"); // -1
    expect(derivePriority("2026-06-03", NOW)).toBe("urgent"); // -10
  });

  it("is high for today through +2 days", () => {
    expect(derivePriority("2026-06-13", NOW)).toBe("high"); // 0
    expect(derivePriority("2026-06-15", NOW)).toBe("high"); // +2
  });

  it("is medium for +3 through +7 days (boundary at 2/3 and 7/8)", () => {
    expect(derivePriority("2026-06-16", NOW)).toBe("medium"); // +3
    expect(derivePriority("2026-06-20", NOW)).toBe("medium"); // +7
  });

  it("is low beyond +7 days and for undated", () => {
    expect(derivePriority("2026-06-21", NOW)).toBe("low"); // +8
    expect(derivePriority(null, NOW)).toBe("low");
  });
});

describe("proximity", () => {
  it("classifies overdue / soon / ahead with the right boundaries", () => {
    expect(proximity("2026-06-12", NOW)).toBe("overdue"); // -1
    expect(proximity("2026-06-13", NOW)).toBe("soon"); // 0
    expect(proximity("2026-06-15", NOW)).toBe("soon"); // +2
    expect(proximity("2026-06-16", NOW)).toBe("ahead"); // +3
  });

  it("treats undated as ahead", () => {
    expect(proximity(null, NOW)).toBe("ahead");
  });
});
