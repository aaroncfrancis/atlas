import { colors, fonts } from "../tokens";

/**
 * Raw color tokens (hex) for places that can't use a NativeWind className —
 * e.g. native navigator tint colors, status bar, SVG fills. UI styling should
 * prefer the className tokens (`bg-teal`, `text-overdue`, …) wired through the
 * Tailwind preset; reach for these only when a raw value is unavoidable.
 */
export const colorTokens = colors;

/** Font family names. Must match the keys registered with `useFonts`. */
export const fontTokens = fonts;

export type ColorToken = keyof typeof colors;
export type FontToken = keyof typeof fonts;
