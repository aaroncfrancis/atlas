import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "@atlas/i18n";

// Scan-a-bill (CLAUDE.md §7): photo → edge-function extraction → confirm.
// Server-side AI only (§11.4). Stub for the skeleton.
export default function ScanScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <Text className="font-body text-base text-muted">{t("common.comingSoon")}</Text>
    </SafeAreaView>
  );
}
