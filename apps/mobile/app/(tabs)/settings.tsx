import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "@atlas/i18n";

export default function SettingsScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <Text className="font-display text-xl text-foreground">{t("nav.settings")}</Text>
    </SafeAreaView>
  );
}
