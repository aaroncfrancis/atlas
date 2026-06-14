import { type ReactNode, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { bucketObligations, weeklyProgress, type Entity, type Obligation } from "@atlas/core";
import {
  toast,
  useEntities,
  useObligationActions,
  useObligations,
  useUpdateObligation,
} from "@atlas/supabase";
import { ObligationFormSheet, ObligationRow, type ObligationFormValues } from "@atlas/ui";
import { useTranslation } from "@atlas/i18n";
import { colorTokens } from "@atlas/config";
import { AddObligationFab } from "../../components/add-obligation-fab";
import { formToUpdate } from "../../lib/obligation-form";

interface Section {
  key: string;
  title: string;
  items: Obligation[];
  color: string;
  accent: boolean;
}

// Home-feed section (CLAUDE.md §8): colored uppercase heading + count badge, with
// an accent container on "Needs attention" (mirrors the Lovable `Group`).
function FeedSection({
  title,
  color,
  count,
  accent,
  children,
}: {
  title: string;
  color: string;
  count: number;
  accent: boolean;
  children: ReactNode;
}) {
  return (
    <View
      className={accent ? "mx-4 mb-3 rounded-2xl border p-3" : "mb-3 px-4"}
      style={accent ? { borderColor: `${color}33`, backgroundColor: `${color}0D` } : undefined}
    >
      <View className="mb-3 flex-row items-center gap-2">
        <Text className="font-display text-sm uppercase tracking-wide" style={{ color }}>
          {title}
        </Text>
        <View
          className="h-5 min-w-[20px] items-center justify-center rounded-full px-1.5"
          style={{ backgroundColor: `${color}1A` }}
        >
          <Text className="font-display text-xs" style={{ color }}>
            {count}
          </Text>
        </View>
      </View>
      <View className="gap-2.5">{children}</View>
    </View>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: obligations = [], isLoading } = useObligations();
  const { data: entities = [] } = useEntities();
  const actions = useObligationActions();
  const update = useUpdateObligation();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Obligation | null>(null);

  const buckets = bucketObligations(obligations);
  const progress = weeklyProgress(obligations);

  const sections: Section[] = [
    {
      key: "needs",
      title: t("home.needsAttention"),
      items: buckets.needs_attention,
      color: colorTokens.overdue,
      accent: true,
    },
    {
      key: "upcoming",
      title: t("home.upcoming"),
      items: buckets.upcoming,
      color: colorTokens.amber,
      accent: false,
    },
    {
      key: "later",
      title: t("home.later"),
      items: buckets.later,
      color: colorTokens.textMuted,
      accent: false,
    },
  ];

  const entityFor = (o: Obligation): Entity | null =>
    entities.find((e) => e.id === o.entity_id) ?? null;

  function handleUpdate(values: ObligationFormValues, editingId: string | null) {
    if (editingId === null) return;
    update.mutate(
      { id: editingId, patch: formToUpdate(values) },
      { onSuccess: () => toast.success(t("toast.updated")) },
    );
  }

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

      <ScrollView className="flex-1" contentContainerClassName="pb-28">
        {isEmpty ? (
          <Text className="px-4 py-12 text-center font-body text-muted">
            {t("home.empty")}
          </Text>
        ) : null}

        {sections.map((section) =>
          section.items.length > 0 ? (
            <FeedSection
              key={section.key}
              title={section.title}
              color={section.color}
              count={section.items.length}
              accent={section.accent}
            >
              {section.items.map((obligation) => (
                <ObligationRow
                  key={obligation.id}
                  obligation={obligation}
                  entity={entityFor(obligation)}
                  actions={actions}
                  expanded={expandedId === obligation.id}
                  onToggle={() =>
                    setExpandedId((current) => (current === obligation.id ? null : obligation.id))
                  }
                  onEdit={(o) => setEditing(o)}
                  onViewEntity={(eid) => router.push(`/entities/${eid}`)}
                />
              ))}
            </FeedSection>
          ) : null,
        )}
      </ScrollView>

      <ObligationFormSheet
        visible={editing !== null}
        onClose={() => setEditing(null)}
        entities={entities}
        obligation={editing}
        onSubmit={handleUpdate}
      />

      <AddObligationFab />
    </SafeAreaView>
  );
}
