import { describe, expect, it } from "vitest";
import { DEFAULT_ENTITY_COLOR, entityColor } from "./entity";

describe("entityColor", () => {
  it("uses the per-type hue", () => {
    expect(entityColor({ type: "home", color: null })).toBe("#F0654A");
    expect(entityColor({ type: "subscription", color: "#000000" })).toBe("#7C5CFC");
  });

  it("falls back to the row color seed for unknown types", () => {
    expect(entityColor({ type: "unknown" as never, color: "#123456" })).toBe("#123456");
  });

  it("falls back to the muted default with no entity or color", () => {
    expect(entityColor(null)).toBe(DEFAULT_ENTITY_COLOR);
    expect(entityColor({ type: "unknown" as never, color: null })).toBe(DEFAULT_ENTITY_COLOR);
  });
});
