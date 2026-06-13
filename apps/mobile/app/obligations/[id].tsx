import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "@atlas/i18n";

// Obligation detail (CLAUDE.md §3, route /obligations/:id). Presented modally
// from the root stack. Stub for the skeleton.
export default function ObligationDetail() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-2 bg-background">
      <Text className="font-body text-base text-muted">{t("common.comingSoon")}</Text>
      <Text className="font-mono text-xs text-secondary">{id}</Text>
    </SafeAreaView>
  );
}
