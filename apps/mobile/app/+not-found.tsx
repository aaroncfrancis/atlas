import { Text, View } from "react-native";
import { Link, Stack } from "expo-router";
import { useTranslation } from "@atlas/i18n";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background">
      <Stack.Screen options={{ title: "404" }} />
      <Link href="/">
        <Text className="font-body text-base text-primary">{t("nav.home")}</Text>
      </Link>
    </View>
  );
}
