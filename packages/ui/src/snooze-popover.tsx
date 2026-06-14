import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Clock, X } from "lucide-react-native";
import { colorTokens } from "@atlas/config";
import { useTranslation } from "@atlas/i18n";
import { Button } from "./primitives";
import { formatShortDate } from "./lib/labels";

// Native snooze picker (CLAUDE.md §4 mapping: shadcn Popover → RN Modal). The
// three presets mirror the Lovable calendar dialog (Tomorrow / Next week / In a
// month) and return an ISO timestamp for `snoozed_until`.

function addDays(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export interface SnoozePopoverProps {
  onSnooze: (untilIso: string) => void;
  variant?: "default" | "compact";
}

export function SnoozePopover({ onSnooze }: SnoozePopoverProps) {
  const { t, locale } = useTranslation();
  const [open, setOpen] = useState(false);

  const presets = [
    { key: "cal.snoozeTomorrow" as const, iso: addDays(1) },
    { key: "cal.snoozeNextWeek" as const, iso: addDays(7) },
    { key: "cal.snoozeInMonth" as const, iso: addDays(30) },
  ];

  return (
    <>
      <Button
        label={t("obligation.snooze")}
        variant="outline"
        icon={<Clock size={16} color={colorTokens.foreground} />}
        onPress={() => setOpen(true)}
      />
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable className="rounded-t-3xl bg-card px-4 pb-8 pt-3">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-display text-base text-foreground">
                {t("obligation.snooze")}
              </Text>
              <Pressable accessibilityRole="button" onPress={() => setOpen(false)}>
                <X size={20} color={colorTokens.textMuted} />
              </Pressable>
            </View>
            {presets.map((preset) => (
              <Pressable
                key={preset.key}
                accessibilityRole="button"
                onPress={() => {
                  onSnooze(preset.iso);
                  setOpen(false);
                }}
                className="flex-row items-center justify-between py-3"
              >
                <Text className="font-body text-base text-foreground">{t(preset.key)}</Text>
                <Text className="font-mono text-xs text-muted">
                  {formatShortDate(preset.iso, locale)}
                </Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
