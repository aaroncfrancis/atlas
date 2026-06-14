import type { Locale } from "./types";

/**
 * Map a device / BCP-47 locale tag (e.g. "fr-CA", "fr", "en-US") to a supported
 * app locale: French when the tag's language is French, English otherwise. French
 * is the meaningful non-English case (CLAUDE.md §11.5, Bill 96 / Law 25).
 *
 * Kept platform-agnostic on purpose — the app layer reads the device locale (via
 * expo-localization) and passes the tag through here, so this mapping rule has one
 * home and the i18n package stays free of native dependencies.
 */
export function resolveLocale(input: string | null | undefined): Locale {
  return input?.toLowerCase().startsWith("fr") ? "fr" : "en";
}
