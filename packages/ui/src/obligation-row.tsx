import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Pencil,
  X,
  XCircle,
  Zap,
} from "lucide-react-native";
import {
  entityColor,
  formatAmount,
  isAutoPaid,
  type Entity,
  type Obligation,
} from "@atlas/core";
import { useTranslation } from "@atlas/i18n";
import { colorTokens } from "@atlas/config";
import { Badge } from "./badge";
import { DuePill } from "./due-pill";
import { EntityIcon } from "./entity-icon";
import { Button } from "./primitives";
import { SnoozePopover } from "./snooze-popover";
import { localeTag, recurrenceLabel, typeLabel } from "./lib/labels";

// Action callbacks the expanded row needs (structurally matches the supabase
// `useObligationActions()` result; declared here so @atlas/ui stays supabase-free).
export interface ObligationRowActions {
  onDone: (obligation: Obligation) => void;
  onSnooze: (obligation: Obligation, until: string) => void;
  onDismiss: (obligation: Obligation) => void;
  onAutomate?: (obligation: Obligation) => void;
  onCancelSub: (obligation: Obligation) => void;
}

export interface ObligationRowProps {
  obligation: Obligation;
  entity?: Entity | null;
  now?: Date;
  /**
   * Navigation-only mode (home feed): tapping fires this instead of expanding.
   * Ignored when `actions` is provided (the row becomes an inline accordion).
   */
  onPress?: (obligation: Obligation) => void;
  /** Expanded-state action handlers. Presence makes the row expandable. */
  actions?: ObligationRowActions;
  onEdit?: (obligation: Obligation) => void;
  onViewEntity?: (entityId: string) => void;
  /** Start expanded (used by the calendar/history inline dialog). */
  defaultExpanded?: boolean;
  /**
   * Controlled expansion. When `onToggle` is provided the row is parent-controlled
   * (the home feed lifts this to a single `expandedId` so only one row opens at a
   * time); otherwise the row owns its own expand state.
   */
  expanded?: boolean;
  onToggle?: () => void;
}

function NeutralBadge({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-muted/10 px-2 py-0.5">
      <Text className="font-body text-xs text-secondary">{label}</Text>
    </View>
  );
}

/**
 * Obligation row (CLAUDE.md §3, §10). Compact by default; when `actions` are
 * supplied, tapping expands it inline into the resolve surface (Done / Snooze /
 * Edit / View entity / Dismiss / Cancel subscription / Automate).
 */
export function ObligationRow({
  obligation,
  entity = null,
  now,
  onPress,
  actions,
  onEdit,
  onViewEntity,
  defaultExpanded = false,
  expanded,
  onToggle,
}: ObligationRowProps) {
  const { t, locale } = useTranslation();
  const expandable = actions !== undefined;
  const controlled = onToggle !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isOpen = controlled ? expanded === true : internalExpanded;

  const autoPaid = isAutoPaid(obligation);
  const amount = formatAmount(obligation.amount, obligation.currency, localeTag(locale));
  const dot = entityColor(entity);
  const snoozedUntil = obligation.status === "snoozed" ? obligation.snoozed_until : null;

  function handlePress() {
    if (expandable) {
      if (controlled) onToggle?.();
      else setInternalExpanded((value) => !value);
    } else {
      onPress?.(obligation);
    }
  }

  const Chevron = expandable && isOpen ? ChevronUp : ChevronDown;

  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-card">
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={obligation.title}
        className="flex-row items-center gap-3 px-4 py-3"
      >
        <EntityIcon icon={entity?.icon} type={entity?.type} color={dot} size={18} />
        <View className="flex-1">
          <Text className="font-display text-sm text-foreground" numberOfLines={1}>
            {obligation.title}
          </Text>
        </View>

        <View className="items-end gap-1">
          {amount !== null ? (
            <Text className="font-mono text-sm text-foreground">{amount}</Text>
          ) : null}
          <View className="flex-row items-center gap-1">
            {autoPaid ? <Badge label={t("obligation.autoPaid")} /> : null}
            <DuePill due={obligation.due_date} snoozedUntil={snoozedUntil} now={now} />
          </View>
        </View>

        <Chevron size={18} color={colorTokens.textMuted} />
      </Pressable>

      {expandable && isOpen ? (
        <View className="gap-3 border-t border-border px-4 pb-4 pt-3">
          <View className="flex-row flex-wrap gap-2">
            <NeutralBadge label={typeLabel(t, obligation.type)} />
            {entity !== null ? <NeutralBadge label={entity.name} /> : null}
            {autoPaid ? <NeutralBadge label={recurrenceLabel(t, obligation.recurrence)} /> : null}
            {autoPaid && obligation.paying_account !== null ? (
              <NeutralBadge label={obligation.paying_account} />
            ) : null}
          </View>

          {obligation.description !== null ? (
            <Text className="font-body text-sm text-secondary">{obligation.description}</Text>
          ) : null}

          <View className="flex-row flex-wrap gap-2">
            <Button
              label={t("obligation.done")}
              variant="teal"
              icon={<Check size={16} color={colorTokens.card} />}
              onPress={() => actions?.onDone(obligation)}
            />
            <SnoozePopover onSnooze={(until) => actions?.onSnooze(obligation, until)} />
            {onEdit !== undefined ? (
              <Button
                label={t("obligation.edit")}
                variant="outline"
                icon={<Pencil size={16} color={colorTokens.foreground} />}
                onPress={() => onEdit(obligation)}
              />
            ) : null}
            {entity !== null && onViewEntity !== undefined ? (
              <Button
                label={t("obligation.viewEntity")}
                variant="outline"
                icon={<ArrowRight size={16} color={colorTokens.foreground} />}
                onPress={() => onViewEntity(entity.id)}
              />
            ) : null}
            <Button
              label={t("obligation.dismiss")}
              variant="outline"
              icon={<X size={16} color={colorTokens.foreground} />}
              onPress={() => actions?.onDismiss(obligation)}
            />
            {autoPaid ? (
              <Button
                label={t("obligation.cancelSubscription")}
                variant="danger"
                icon={<XCircle size={16} color={colorTokens.overdue} />}
                onPress={() => actions?.onCancelSub(obligation)}
              />
            ) : null}
            <Button
              label={t("obligation.automate")}
              variant="purple"
              disabled
              icon={<Zap size={16} color={colorTokens.purple} />}
              onPress={() => undefined}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}
