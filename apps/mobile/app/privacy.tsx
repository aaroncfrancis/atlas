import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "@atlas/i18n";

// Privacy explainer + scan consent (CLAUDE.md §10, §11.5 Law 25). Stub.
export default function PrivacyScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <Text className="font-body text-base text-muted">{t("common.comingSoon")}</Text>
    </SafeAreaView>
  );
}
