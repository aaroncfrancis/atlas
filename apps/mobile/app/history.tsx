import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, Search } from "lucide-react-native";
import {
  entityColor,
  formatAmount,
  isResolved,
  type Obligation,
  type ObligationStatus,
} from "@atlas/core";
import { useEntities, useObligationActions, useObligations } from "@atlas/supabase";
import {
  EntityIcon,
  ObligationDialog,
  Select,
  formatLongDate,
  formatMonthYear,
  localeTag,
} from "@atlas/ui";
import { useTranslation } from "@atlas/i18n";
import { colorTokens } from "@atlas/config";

const STATUS_KEY: Record<ObligationStatus, "hist.statusPaid" | "hist.statusAutomated" | "hist.statusDismissed"> = {
  done: "hist.statusPaid",
  automated: "hist.statusAutomated",
  dismissed: "hist.statusDismissed",
  open: "hist.statusPaid",
  snoozed: "hist.statusPaid",
};

interface MonthGroup {
  key: string;
  label: string;
  items: Obligation[];
}

export default function HistoryScreen() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { data: obligations = [] } = useObligations();
  const { data: entities = [] } = useEntities();
  const actions = useObligationActions();

  const [query, setQuery] = useState("");
  const [entityId, setEntityId] = useState("");
  const [selected, setSelected] = useState<Obligation | null>(null);

  const groups = useMemo<MonthGroup[]>(() => {
    const resolved = obligations
      .filter((o) => isResolved(o) && o.resolved_at !== null)
      .filter((o) => (entityId === "" ? true : o.entity_id === entityId))
      .filter((o) => o.title.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => (b.resolved_at ?? "").localeCompare(a.resolved_at ?? ""));

    const map = new Map<string, Obligation[]>();
    for (const o of resolved) {
      const key = (o.resolved_at ?? "").slice(0, 7); // YYYY-MM
      const bucket = map.get(key);
      if (bucket) bucket.push(o);
      else map.set(key, [o]);
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      label: formatMonthYear(items[0]?.resolved_at ?? "", locale),
      items,
    }));
  }, [obligations, entityId, query, locale]);

  const entityFor = (o: Obligation) => entities.find((e) => e.id === o.entity_id) ?? null;

  const entityOptions = [
    { value: "", label: t("hist.allEntities") },
    ...entities.map((e) => ({ value: e.id, label: e.name })),
  ];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        className="flex-row items-center gap-1 px-4 pt-3"
      >
        <ArrowLeft size={20} color={colorTokens.foreground} />
        <Text className="font-body text-sm text-foreground">{t("obd.back")}</Text>
      </Pressable>

      <View className="px-4 pb-2 pt-1">
        <Text className="font-display text-2xl text-foreground">{t("hist.title")}</Text>
        <Text className="font-body text-sm text-muted">{t("hist.subtitle")}</Text>
      </View>

      <View className="gap-2 px-4 pb-2">
        <View className="flex-row items-center gap-2 rounded-xl border border-border bg-card px-3">
          <Search size={18} color={colorTokens.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("hist.searchPlaceholder")}
            placeholderTextColor={colorTokens.textMuted}
            className="flex-1 py-2.5 font-body text-base text-foreground"
          />
        </View>
        <Select
          label={t("form.entity")}
          value={entityId}
          options={entityOptions}
          onChange={setEntityId}
        />
      </View>

      <ScrollView contentContainerClassName="px-4 pb-12">
        {groups.length === 0 ? (
          <Text className="py-12 text-center font-body text-muted">{t("hist.empty")}</Text>
        ) : (
          groups.map((group) => (
            <View key={group.key} className="mb-4">
              <Text className="mb-2 font-body text-xs uppercase tracking-wide text-secondary">
                {group.label}
              </Text>
              <View className="gap-2">
                {group.items.map((o) => {
                  const entity = entityFor(o);
                  const color = entityColor(entity);
                  const amount = formatAmount(o.amount, o.currency, localeTag(locale));
                  return (
                    <Pressable
                      key={o.id}
                      accessibilityRole="button"
                      onPress={() => setSelected(o)}
                      className="flex-row items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3"
                    >
                      <View className="h-8 w-8 items-center justify-center rounded-full bg-teal/10">
                        <Check size={16} color={colorTokens.teal} />
                      </View>
                      <View
                        className="h-9 w-9 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${color}1A` }}
                      >
                        <EntityIcon icon={entity?.icon} type={entity?.type} color={color} size={16} />
                      </View>
                      <View className="flex-1">
                        <Text className="font-display text-sm text-foreground" numberOfLines={1}>
                          {o.title}
                        </Text>
                        <Text className="font-body text-xs text-muted">
                          {t("hist.paidOn", {
                            date: formatLongDate(o.resolved_at ?? o.created_at, locale),
                          })}
                          {amount !== null ? ` · ${amount}` : ""}
                        </Text>
                      </View>
                      <View className="rounded-full bg-teal/10 px-2 py-0.5">
                        <Text className="font-body text-xs text-teal">{t(STATUS_KEY[o.status])}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <ObligationDialog
        obligation={selected}
        entity={selected ? entityFor(selected) : null}
        actions={actions}
        onEdit={(o) => router.push(`/obligations/${o.id}`)}
        onViewEntity={(eid) => router.push(`/entities/${eid}`)}
        onClose={() => setSelected(null)}
      />
    </SafeAreaView>
  );
}
