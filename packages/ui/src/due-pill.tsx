import { Text, View } from "react-native";
import { proximity, type Proximity } from "@atlas/core";
import { cn } from "./lib/cn";

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
  now?: Date;
}

export function DuePill({ due, now }: DuePillProps) {
  if (due === null) return null;
  const p = proximity(due, now);
  return (
    <View className={cn("rounded-full px-2 py-0.5", containerClass[p])}>
      <Text className={cn("font-mono text-xs", textClass[p])}>{due}</Text>
    </View>
  );
}
