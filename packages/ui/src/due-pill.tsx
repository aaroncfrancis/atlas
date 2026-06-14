import { Text, View } from "react-native";
import { proximity, relativeDue, type Proximity } from "@atlas/core";
import { useTranslation } from "@atlas/i18n";
import { cn } from "./lib/cn";
import { dueLabelText, formatShortDate } from "./lib/labels";

// Proximity drives the pill color (CLAUDE.md §8, §9 tokens — never a raw hex).
const containerClass: Record<Proximity, string> = {
  overdue: "bg-overdue/10",
  soon: "bg-amber/10",
  ahead: "bg-green/10",
};

const textClass: Record<Proximity, string> = {
  overdue: "text-overdue",
  soon: "text-amber",
  ahead: "text-green",
};

export interface DuePillProps {
  due: string | null;
  /** When set (and the item is snoozed), show "snoozed until …" in muted. */
  snoozedUntil?: string | null;
  now?: Date;
}

export function DuePill({ due, snoozedUntil = null, now }: DuePillProps) {
  const { t, locale } = useTranslation();

  if (snoozedUntil !== null) {
    return (
      <View className="rounded-full bg-muted/10 px-2 py-0.5">
        <Text className="font-mono text-xs text-muted">
          {t("due.snoozedUntil", { date: formatShortDate(snoozedUntil, locale) })}
        </Text>
      </View>
    );
  }

  if (due === null) return null;
  const p = proximity(due, now);
  return (
    <View className={cn("rounded-full px-2 py-0.5", containerClass[p])}>
      <Text className={cn("font-mono text-xs", textClass[p])}>
        {dueLabelText(t, relativeDue(due, now))}
      </Text>
    </View>
  );
}
