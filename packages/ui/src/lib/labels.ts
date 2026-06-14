import type {
  DueLabel,
  ObligationStatus,
  ObligationType,
  Recurrence,
} from "@atlas/core";
import type { Locale, TranslationKey } from "@atlas/i18n";

// Maps @atlas/core values / DueLabel descriptors to dictionary text. Keeps all
// user-facing strings in the EN/FR dictionaries (CLAUDE.md §11.5) while core
// stays i18n-agnostic.

export type TFunction = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

/** BCP-47 tag for Intl formatting, derived from the active UI locale. */
export function localeTag(locale: Locale): string {
  return locale === "fr" ? "fr-CA" : "en-CA";
}

/** Human text for a relativeDue() descriptor. */
export function dueLabelText(t: TFunction, label: DueLabel): string {
  switch (label.kind) {
    case "none":
      return t("due.noDate");
    case "today":
      return t("due.today");
    case "tomorrow":
      return t("due.tomorrow");
    case "overdue":
      return label.days === 1 ? t("due.overdueOne") : t("due.overdue", { n: label.days });
    case "future":
      return t("due.inDays", { n: label.days });
  }
}

export function typeLabel(t: TFunction, type: ObligationType): string {
  return t(`type.${type}` as TranslationKey);
}

export function recurrenceLabel(t: TFunction, recurrence: Recurrence): string {
  return t(`rec.${recurrence}` as TranslationKey);
}

export function statusLabel(t: TFunction, status: ObligationStatus): string {
  return t(`status.${status}` as TranslationKey);
}

/** Short month/day, e.g. "Jun 14". */
export function formatShortDate(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(localeTag(locale), {
    month: "short",
    day: "numeric",
  });
}

/** Long-ish date, e.g. "Jun 14, 2026". */
export function formatLongDate(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(localeTag(locale), {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Month + year group header, e.g. "June 2026". */
export function formatMonthYear(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(localeTag(locale), {
    month: "long",
    year: "numeric",
  });
}
