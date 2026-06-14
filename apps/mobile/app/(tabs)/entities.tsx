import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, Plus } from "lucide-react-native";
import { entityColor } from "@atlas/core";
import { useEntities, useObligations } from "@atlas/supabase";
import { EntityIcon } from "@atlas/ui";
import { useTranslation } from "@atlas/i18n";
import { colorTokens } from "@atlas/config";
import { AddObligationFab } from "../../components/add-obligation-fab";

export default function EntitiesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: entities = [] } = useEntities();
  const { data: obligations = [] } = useObligations();

  const openCount = (entityId: string) =>
    obligations.filter(
      (o) => o.entity_id === entityId && (o.status === "open" || o.status === "snoozed"),
    ).length;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-row items-start justify-between px-4 pb-3 pt-2">
        <View className="flex-1">
          <Text className="font-display text-2xl text-foreground">{t("entity.title")}</Text>
          <Text className="font-body text-sm text-muted">{t("entity.subtitle")}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("entity.add")}
          onPress={() => router.push("/add")}
          className="flex-row items-center gap-1 rounded-xl bg-teal px-3 py-2"
        >
          <Plus size={16} color={colorTokens.card} />
          <Text className="font-display text-sm text-card">{t("entity.add")}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="px-4 pb-28">
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {entities.map((entity) => {
            const color = entityColor(entity);
            return (
              <Pressable
                key={entity.id}
                accessibilityRole="button"
                accessibilityLabel={entity.name}
                onPress={() => router.push(`/entities/${entity.id}`)}
                className="w-[48%] rounded-2xl border border-border bg-card p-4"
              >
                <View className="mb-3 flex-row items-center justify-between">
                  <View
                    className="h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${color}1A` }}
                  >
                    <EntityIcon icon={entity.icon} type={entity.type} color={color} />
                  </View>
                  <ChevronRight size={18} color={colorTokens.textMuted} />
                </View>
                <Text className="font-display text-base text-foreground" numberOfLines={1}>
                  {entity.name}
                </Text>
                <Text className="font-body text-sm text-secondary">
                  {t("entity.openCount", { n: openCount(entity.id) })}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <AddObligationFab />
    </SafeAreaView>
  );
}
