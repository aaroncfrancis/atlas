import type { Entity } from "./types";

/**
 * Distinct hue per entity type (CLAUDE.md §9). These are per-entity brand seeds,
 * not theme tokens, so they live here as raw hex (ported from the Lovable
 * reference) and override any reused `entities.color` seed.
 */
const ENTITY_TYPE_COLOR: Record<string, string> = {
  home: "#F0654A",
  car: "#2D6CDF",
  account: "#22386A",
  bank: "#22386A",
  subscription: "#7C5CFC",
  insurance: "#16A34A",
  health: "#F5871F",
  pet: "#E0A106",
};

/** Fallback when an entity has no type/color. Mirrors `colorTokens.textMuted`. */
export const DEFAULT_ENTITY_COLOR = "#94A3B8";

/**
 * Resolve a display color for an entity: type hue first, then the row's own
 * `color` seed, then the muted default. Used for icon tints and stripes.
 */
export function entityColor(
  entity?: Pick<Entity, "type" | "color"> | null,
): string {
  if (!entity) return DEFAULT_ENTITY_COLOR;
  return ENTITY_TYPE_COLOR[entity.type ?? ""] ?? entity.color ?? DEFAULT_ENTITY_COLOR;
}
