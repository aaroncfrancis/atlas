import type { en } from "./en";

export type Locale = "en" | "fr";

/** The shape every locale dictionary must implement (derived from `en`). */
export type Dictionary = { [K in keyof typeof en]: string };

export type TranslationKey = keyof Dictionary;
