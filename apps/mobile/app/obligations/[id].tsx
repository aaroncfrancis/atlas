import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Check, Pencil, X, XCircle, Zap } from "lucide-react-native";
import { entityColor, formatAmount, isAutoPaid, relativeDue } from "@atlas/core";
import {
  toast,
  useDocuments,
  useEntities,
  useObligationActions,
  useObligationEvents,
  useObligations,
  useUpdateObligation,
} from "@atlas/supabase";
import {
  Button,
  EntityIcon,
  ObligationFormSheet,
  SnoozePopover,
  dueLabelText,
  formatLongDate,
  localeTag,
  statusLabel,
  typeLabel,
  type ObligationFormValues,
} from "@atlas/ui";
import { useTranslation } from "@atlas/i18n";
import { colorTokens } from "@atlas/config";
import { formToUpdate } from "../../lib/obligation-form";

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-1/2 py-1.5">
      <Text className="font-body text-xs text-muted">{label}</Text>
      <Text className="font-body text-sm text-foreground">{value}</Text>
    </View>
  );
}

const EVENT_LABEL_KEY: Record<string, "event.created" | "event.resolved" | "event.snoozed" | "event.automated" | "event.dismissed"> = {
  created: "event.created",
  resolved: "event.resolved",
  snoozed: "event.snoozed",
  automated: "event.automated",
  dismissed: "event.dismissed",
};

// Obligation detail (CLAUDE.md §3, route /obligations/:id). Presented modally.
export default function ObligationDetail() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: obligations = [] } = useObligations();
  const { data: entities = [] } = useEntities();
  const { data: events = [] } = useObligationEvents(id);
  const { data: documents = [] } = useDocuments(id);
  const actions = useObligationActions();
  const update = useUpdateObligation();

  const [editing, setEditing] = useState(false);

  const obligation = obligations.find((o) => o.id === id) ?? null;
  const entity = obligation
    ? entities.find((e) => e.id === obligation.entity_id) ?? null
    : null;

  function close() {
    router.back();
  }

  function handleUpdate(values: ObligationFormValues, editingId: string | null) {
    if (editingId === null) return;
    update.mutate(
      { id: editingId, patch: formToUpdate(values) },
      { onSuccess: () => toast.success(t("toast.updated")) },
    );
  }

  if (obligation === null) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 items-center justify-center bg-background">
        <Text className="font-body text-base text-muted">{t("obd.notFound")}</Text>
      </SafeAreaView>
    );
  }

  const color = entityColor(entity);
  const amount = formatAmount(obligation.amount, obligation.currency, localeTag(locale));
  const resolved = obligation.status === "done" || obligation.status === "automated";
  const autoPaid = isAutoPaid(obligation);
  const receipts = documents.filter((d) => d.signedUrl !== null);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <Pressable
        accessibilityRole="button"
        onPress={close}
        className="flex-row items-center gap-1 px-4 py-3"
      >
        <ArrowLeft size={20} color={colorTokens.foreground} />
        <Text className="font-body text-sm text-foreground">{t("obd.back")}</Text>
      </Pressable>

      <ScrollView contentContainerClassName="px-4 pb-12">
        <View className="rounded-2xl border border-border bg-card p-5">
          {entity !== null ? (
            <View className="mb-2 flex-row items-center gap-2">
              <EntityIcon icon={entity.icon} type={entity.type} color={color} size={16} />
              <Text className="font-body text-sm" style={{ color }}>
                {entity.name}
              </Text>
            </View>
          ) : null}

          <Text className="font-display text-2xl text-foreground">{obligation.title}</Text>

          <View className="mt-3 flex-row flex-wrap">
            <MetaCell label={t("obd.type")} value={typeLabel(t, obligation.type)} />
            <MetaCell
              label={t("obd.due")}
              value={dueLabelText(t, relativeDue(obligation.due_date))}
            />
            {amount !== null ? <MetaCell label={t("obd.amount")} value={amount} /> : null}
            <MetaCell label={t("obd.status")} value={statusLabel(t, obligation.status)} />
          </View>

          {obligation.description !== null ? (
            <Text className="mt-3 font-body text-sm text-secondary">{obligation.description}</Text>
          ) : null}

          {obligation.status === "automated" ? (
            <View className="mt-3 flex-row items-center gap-1.5 self-start rounded-full bg-purple/10 px-2.5 py-1">
              <Zap size={14} color={colorTokens.purple} />
              <Text className="font-body text-xs text-purple">{t("obd.automated")}</Text>
            </View>
          ) : null}

          {!resolved ? (
            <View className="mt-5 flex-row flex-wrap gap-2">
              <Button
                label={t("obd.markDone")}
                variant="teal"
                icon={<Check size={16} color={colorTokens.card} />}
                onPress={() => {
                  actions.onDone(obligation);
                  close();
                }}
              />
              <SnoozePopover
                onSnooze={(until) => {
                  actions.onSnooze(obligation, until);
                  close();
                }}
              />
              <Button
                label={t("obligation.edit")}
                variant="outline"
                icon={<Pencil size={16} color={colorTokens.foreground} />}
                onPress={() => setEditing(true)}
              />
              <Button
                label={t("obligation.dismiss")}
                variant="outline"
                icon={<X size={16} color={colorTokens.foreground} />}
                onPress={() => {
                  actions.onDismiss(obligation);
                  close();
                }}
              />
              {autoPaid ? (
                <Button
                  label={t("obligation.cancelSubscription")}
                  variant="danger"
                  icon={<XCircle size={16} color={colorTokens.overdue} />}
                  onPress={() => {
                    actions.onCancelSub(obligation);
                    close();
                  }}
                />
              ) : null}
            </View>
          ) : null}
        </View>

        {events.length > 0 ? (
          <View className="mt-6 rounded-2xl border border-border bg-card p-5">
            <Text className="mb-3 font-body text-xs uppercase tracking-wide text-secondary">
              {t("obd.activity")}
            </Text>
            <View className="gap-2.5">
              {events.map((event) => (
                <View key={event.id} className="flex-row items-center justify-between">
                  <Text className="font-body text-sm text-foreground">
                    {t(EVENT_LABEL_KEY[event.action] ?? "event.created")}
                  </Text>
                  <Text className="font-mono text-xs text-muted">
                    {formatLongDate(event.occurred_at, locale)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {receipts.length > 0 ? (
          <View className="mt-6">
            <Text className="mb-2 font-body text-xs uppercase tracking-wide text-secondary">
              {t("obd.receipts")}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {receipts.map((doc) => (
                <Image
                  key={doc.id}
                  source={{ uri: doc.signedUrl ?? undefined }}
                  className="h-32 w-[47%] rounded-xl border border-border"
                  resizeMode="cover"
                />
              ))}
            </View>
          </View>
        ) : null}

        <Text className="mt-6 font-body text-xs text-muted">
          {t("obd.created", { date: formatLongDate(obligation.created_at, locale) })}
        </Text>
      </ScrollView>

      <ObligationFormSheet
        visible={editing}
        onClose={() => setEditing(false)}
        entities={entities}
        obligation={obligation}
        onSubmit={handleUpdate}
      />
    </SafeAreaView>
  );
}
