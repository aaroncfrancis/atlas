import { useState, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Switch as RNSwitch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Check, ChevronDown, X } from "lucide-react-native";
import { colorTokens } from "@atlas/config";
import { cn } from "./lib/cn";

// Small native UI primitives (CLAUDE.md §4 mapping: shadcn → packages/ui). All
// styled with design-token classNames; no raw hex.

export interface ButtonProps {
  label: string;
  onPress: () => void;
  /** teal = primary CTA, outline = secondary, danger = destructive. */
  variant?: "teal" | "outline" | "danger" | "purple";
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

const BTN_BASE = "flex-row items-center justify-center gap-1.5 rounded-xl px-3 py-2";
const BTN_VARIANT: Record<NonNullable<ButtonProps["variant"]>, string> = {
  teal: "bg-teal",
  outline: "border border-border bg-card",
  danger: "border border-overdue/30 bg-overdue/10",
  purple: "border border-purple/30 bg-purple/10",
};
const BTN_TEXT: Record<NonNullable<ButtonProps["variant"]>, string> = {
  teal: "text-card",
  outline: "text-foreground",
  danger: "text-overdue",
  purple: "text-purple",
};

export function Button({
  label,
  onPress,
  variant = "teal",
  icon,
  disabled = false,
  className,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      className={cn(BTN_BASE, BTN_VARIANT[variant], disabled && "opacity-50", className)}
    >
      {icon}
      <Text className={cn("font-display text-sm", BTN_TEXT[variant])}>{label}</Text>
    </Pressable>
  );
}

export interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "email-address";
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences";
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
  autoCapitalize = "sentences",
}: FieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="font-body text-xs text-secondary">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colorTokens.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        className={cn(
          "rounded-xl border border-border bg-card px-3 py-2.5 font-body text-base text-foreground",
          multiline && "h-20",
        )}
      />
    </View>
  );
}

export interface SwitchRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function SwitchRow({ label, value, onValueChange }: SwitchRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-body text-sm text-foreground">{label}</Text>
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colorTokens.purple, false: colorTokens.border }}
        thumbColor={colorTokens.card}
      />
    </View>
  );
}

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string> {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}

/** A label + tappable value that opens a modal option list (no native dep). */
export function Select<T extends string>({ label, value, options, onChange }: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <View className="gap-1.5">
      <Text className="font-body text-xs text-secondary">{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5"
      >
        <Text className="font-body text-base text-foreground">{current?.label ?? value}</Text>
        <ChevronDown size={18} color={colorTokens.textMuted} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable className="rounded-t-3xl bg-card px-4 pb-8 pt-3">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-display text-base text-foreground">{label}</Text>
              <Pressable accessibilityRole="button" onPress={() => setOpen(false)}>
                <X size={20} color={colorTokens.textMuted} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {options.map((option) => {
                const selected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className="flex-row items-center justify-between py-3"
                  >
                    <Text
                      className={cn(
                        "font-body text-base",
                        selected ? "text-teal" : "text-foreground",
                      )}
                    >
                      {option.label}
                    </Text>
                    {selected ? <Check size={18} color={colorTokens.teal} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
