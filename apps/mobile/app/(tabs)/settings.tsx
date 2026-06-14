import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation, type Locale } from "@atlas/i18n";

export default function SettingsScreen() {
  const { t, locale, setLocale } = useTranslation();

  // Manual language override (CLAUDE.md §9 EN/FR parity). The default follows the
  // device locale; this lets the user pin it.
  const options: { value: Locale; label: string }[] = [
    { value: "en", label: t("settings.languageEnglish") },
    { value: "fr", label: t("settings.languageFrench") },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background px-6 py-8">
      <Text className="mb-8 font-display text-2xl text-foreground">{t("nav.settings")}</Text>

      <Text className="mb-2 font-body text-sm text-secondary">{t("settings.language")}</Text>
      <View className="flex-row rounded-xl border border-border bg-card p-1">
        {options.map((option) => {
          const active = locale === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setLocale(option.value)}
              className={`flex-1 items-center rounded-lg py-2 ${active ? "bg-teal" : ""}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                className={`font-body text-sm ${active ? "text-card" : "text-secondary"}`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
