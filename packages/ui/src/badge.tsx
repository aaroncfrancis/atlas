import { Text, View } from "react-native";
import { cn } from "./lib/cn";

export interface BadgeProps {
  label: string;
  className?: string;
}

/** Small pill. Defaults to the purple auto-paid styling (CLAUDE.md §9). */
export function Badge({ label, className }: BadgeProps) {
  return (
    <View className={cn("rounded-full bg-purple/10 px-2 py-0.5", className)}>
      <Text className="font-body text-xs text-purple">{label}</Text>
    </View>
  );
}
