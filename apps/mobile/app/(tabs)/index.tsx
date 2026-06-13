import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { bucketObligations, weeklyProgress, type Obligation } from "@atlas/core";
import { useObligations } from "@atlas/supabase";
import { ObligationRow } from "@atlas/ui";
import { useTranslation } from "@atlas/i18n";

interface Section {
  key: string;
  title: string;
  items: Obligation[];
}

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: obligations = [], isLoading } = useObligations();

  const buckets = bucketObligations(obligations);
  const progress = weeklyProgress(obligations);

  const sections: Section[] = [
    { key: "needs", title: t("home.needsAttention"), items: buckets.needs_attention },
    { key: "upcoming", title: t("home.upcoming"), items: buckets.upcoming },
    { key: "later", title: t("home.later"), items: buckets.later },
  ];

  const openObligation = (obligation: Obligation) => {
    router.push(`/obligations/${obligation.id}`);
  };

  const isEmpty = !isLoading && obligations.length === 0;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="px-4 pb-3 pt-2">
        <Text className="font-display text-2xl text-foreground">{t("home.title")}</Text>
        <Text className="font-body text-sm text-muted">
          {t("home.weeklyProgress", {
            resolved: progress.resolved,
            total: progress.total,
          })}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        {isEmpty ? (
          <Text className="px-4 py-12 text-center font-body text-muted">
            {t("home.empty")}
          </Text>
        ) : null}

        {sections.map((section) =>
          section.items.length > 0 ? (
            <View key={section.key} className="mb-2">
              <Text className="px-4 py-2 font-body text-xs uppercase tracking-wide text-secondary">
                {section.title}
              </Text>
              {section.items.map((obligation) => (
                <ObligationRow
                  key={obligation.id}
                  obligation={obligation}
                  onPress={openObligation}
                />
              ))}
            </View>
          ) : null,
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
