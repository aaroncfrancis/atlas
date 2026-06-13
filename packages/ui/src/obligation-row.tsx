import { Pressable, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { isAutoPaid, type Obligation } from "@atlas/core";
import { useTranslation } from "@atlas/i18n";
import { colorTokens } from "@atlas/config";
import { Badge } from "./badge";
import { DuePill } from "./due-pill";

export interface ObligationRowProps {
  obligation: Obligation;
  onPress?: (obligation: Obligation) => void;
  now?: Date;
}

/**
 * Compact obligation row for the home feed (CLAUDE.md §3, §10). Dense by design;
 * tapping expands inline in the app. Auto-paid items get the purple badge.
 */
export function ObligationRow({ obligation, onPress, now }: ObligationRowProps) {
  const { t } = useTranslation();
  const autoPaid = isAutoPaid(obligation);

  return (
    <Pressable
      onPress={() => onPress?.(obligation)}
      accessibilityRole="button"
      accessibilityLabel={obligation.title}
      className="flex-row items-center gap-3 border-b border-border bg-card px-4 py-3"
    >
      <View className="flex-1">
        <Text className="font-body text-base text-foreground" numberOfLines={1}>
          {obligation.title}
        </Text>
        {obligation.vendor !== null ? (
          <Text className="font-body text-xs text-muted" numberOfLines={1}>
            {obligation.vendor}
          </Text>
        ) : null}
      </View>

      <View className="items-end gap-1">
        {obligation.amount !== null ? (
          <Text className="font-mono text-sm text-foreground">
            {obligation.amount.toFixed(2)} {obligation.currency}
          </Text>
        ) : null}
        <View className="flex-row items-center gap-1">
          {autoPaid ? <Badge label={t("obligation.autoPaid")} /> : null}
          <DuePill due={obligation.due_date} now={now} />
        </View>
      </View>

      <ChevronRight size={18} color={colorTokens.textMuted} />
    </Pressable>
  );
}
