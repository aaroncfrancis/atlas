import { colorTokens } from "@atlas/config";
import type { Priority, Proximity } from "@atlas/core";

// Token-backed color maps for places that need a raw value (SVG/icon tints,
// inline stripe/bar styles) where a NativeWind className can't apply. Always go
// through the design tokens — never a literal hex (CLAUDE.md §9, §12).

export const proximityColor: Record<Proximity, string> = {
  overdue: colorTokens.overdue,
  soon: colorTokens.amber,
  ahead: colorTokens.green,
};

export const priorityColor: Record<Priority, string> = {
  urgent: colorTokens.overdue,
  high: colorTokens.amber,
  medium: colorTokens.primary,
  low: colorTokens.textMuted,
};
