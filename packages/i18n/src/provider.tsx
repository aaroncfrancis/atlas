import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { en } from "./en";
import { fr } from "./fr";
import type { Dictionary, Locale, TranslationKey } from "./types";

const dictionaries: Record<Locale, Dictionary> = { en, fr };

export type TranslateParams = Record<string, string | number>;

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: TranslateParams) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

export interface I18nProviderProps {
  children: ReactNode;
  /** Defaults to "fr" to match `profiles.language` (CLAUDE.md §6). */
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale = "fr" }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, params) => interpolate(dictionaries[locale][key], params),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (context === null) {
    throw new Error("useI18n must be used within an <I18nProvider>");
  }
  return context;
}

/** Convenience alias mirroring the common `useTranslation()` hook name. */
export function useTranslation(): I18nContextValue {
  return useI18n();
}
