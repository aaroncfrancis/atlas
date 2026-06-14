import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, FileText } from "lucide-react-native";
import { entityColor, type Obligation } from "@atlas/core";
import {
  toast,
  useEntities,
  useEntityDocuments,
  useObligationActions,
  useObligations,
  useUpdateObligation,
} from "@atlas/supabase";
import {
  EntityIcon,
  ObligationFormSheet,
  ObligationRow,
  type ObligationFormValues,
} from "@atlas/ui";
import { useTranslation } from "@atlas/i18n";
import { colorTokens } from "@atlas/config";
import { AddObligationFab } from "../../components/add-obligation-fab";
import { formToUpdate } from "../../lib/obligation-form";

// Entity detail (CLAUDE.md §3, route /entities/:id).
export default function EntityDetail() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: entities = [] } = useEntities();
  const { data: obligations = [] } = useObligations();
  const { data: documents = [] } = useEntityDocuments(id);
  const actions = useObligationActions();
  const update = useUpdateObligation();

  const [editing, setEditing] = useState<Obligation | null>(null);

  const entity = entities.find((e) => e.id === id) ?? null;
  const open = obligations.filter(
    (o) => o.entity_id === id && (o.status === "open" || o.status === "snoozed"),
  );

  function handleUpdate(values: ObligationFormValues, editingId: string | null) {
    if (editingId === null) return;
    update.mutate(
      { id: editingId, patch: formToUpdate(values) },
      { onSuccess: () => toast.success(t("toast.updated")) },
    );
  }

  const color = entityColor(entity);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        className="flex-row items-center gap-1 px-4 py-3"
      >
        <ArrowLeft size={20} color={colorTokens.foreground} />
        <Text className="font-body text-sm text-foreground">{t("nav.entities")}</Text>
      </Pressable>

      {entity === null ? (
        <Text className="px-4 py-12 text-center font-body text-muted">{t("entity.notFound")}</Text>
      ) : (
        <ScrollView contentContainerClassName="px-4 pb-28">
          <View className="mb-4 flex-row items-center gap-3">
            <View
              className="h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${color}1A` }}
            >
              <EntityIcon icon={entity.icon} type={entity.type} color={color} size={26} />
            </View>
            <View className="flex-1">
              <Text className="font-display text-2xl text-foreground">{entity.name}</Text>
              <Text className="font-body text-sm text-secondary">{entity.type}</Text>
            </View>
          </View>

          {entity.metadata !== null && Object.keys(entity.metadata).length > 0 ? (
            <View className="mb-5 flex-row flex-wrap gap-2">
              {Object.entries(entity.metadata).map(([key, value]) => (
                <View key={key} className="rounded-full border border-border bg-card px-3 py-1">
                  <Text className="font-body text-xs text-secondary">
                    {key}: {String(value)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <Text className="mb-2 font-body text-xs uppercase tracking-wide text-secondary">
            {t("entity.openObligations")}
          </Text>
          {open.length === 0 ? (
            <Text className="py-6 text-center font-body text-muted">
              {t("entity.noObligations")}
            </Text>
          ) : (
            <View className="gap-2.5">
              {open.map((obligation) => (
                <ObligationRow
                  key={obligation.id}
                  obligation={obligation}
                  entity={entity}
                  actions={actions}
                  onEdit={setEditing}
                />
              ))}
            </View>
          )}

          {documents.length > 0 ? (
            <View className="mt-6">
              <Text className="mb-2 font-body text-xs uppercase tracking-wide text-secondary">
                {t("entity.documents")}
              </Text>
              <View className="gap-2">
                {documents.map((doc) => (
                  <View
                    key={doc.id}
                    className="flex-row items-center gap-2 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <FileText size={18} color={colorTokens.textMuted} />
                    <Text className="font-body text-sm text-foreground">{doc.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      )}

      <AddObligationFab defaultEntityId={id} />

      <ObligationFormSheet
        visible={editing !== null}
        onClose={() => setEditing(null)}
        entities={entities}
        obligation={editing}
        onSubmit={handleUpdate}
      />
    </SafeAreaView>
  );
}
