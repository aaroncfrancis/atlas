import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { X } from "lucide-react-native";
import {
  isSubscriptionLike,
  SUBSCRIPTION_RECURRENCES,
  type Entity,
  type Obligation,
  type ObligationType,
  type Recurrence,
} from "@atlas/core";
import { useTranslation } from "@atlas/i18n";
import { colorTokens } from "@atlas/config";
import { Button, Field, Select, SwitchRow, type SelectOption } from "./primitives";
import { recurrenceLabel, typeLabel } from "./lib/labels";

// Native obligation form (CLAUDE.md §3, §10 — shadcn ObligationFormSheet → RN).
// Stays supabase-free: it builds typed values and hands them to `onSubmit`; the
// screen wires create/update + toast.
export interface ObligationFormValues {
  title: string;
  entity_id: string | null;
  type: ObligationType;
  amount: number | null;
  currency: string;
  due_date: string | null;
  description: string | null;
  recurrence: Recurrence;
  auto_paid: boolean;
  paying_account: string | null;
}

export interface ObligationFormSheetProps {
  visible: boolean;
  onClose: () => void;
  entities: Entity[];
  /** Present → edit mode. */
  obligation?: Obligation | null;
  /** Preselect an entity when adding from an entity screen. */
  defaultEntityId?: string | null;
  onSubmit: (values: ObligationFormValues, editingId: string | null) => void;
}

const TYPES: ObligationType[] = ["bill", "renewal", "appointment", "deadline", "task"];
const NO_ENTITY = "";

export function ObligationFormSheet({
  visible,
  onClose,
  entities,
  obligation = null,
  defaultEntityId = null,
  onSubmit,
}: ObligationFormSheetProps) {
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [entityId, setEntityId] = useState<string>(NO_ENTITY);
  const [type, setType] = useState<ObligationType>("task");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("CAD");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState<Recurrence>("monthly");
  const [autoPaid, setAutoPaid] = useState(false);
  const [payingAccount, setPayingAccount] = useState("");

  // Re-seed the form whenever it opens (edit row or fresh add).
  useEffect(() => {
    if (!visible) return;
    setTitle(obligation?.title ?? "");
    setEntityId(obligation?.entity_id ?? defaultEntityId ?? NO_ENTITY);
    setType(obligation?.type ?? "task");
    setAmount(obligation?.amount != null ? String(obligation.amount) : "");
    setCurrency(obligation?.currency ?? "CAD");
    setDueDate(obligation?.due_date ?? "");
    setDescription(obligation?.description ?? "");
    setRecurrence(
      obligation?.recurrence && obligation.recurrence !== "none"
        ? obligation.recurrence
        : "monthly",
    );
    setAutoPaid(obligation?.auto_paid ?? false);
    setPayingAccount(obligation?.paying_account ?? "");
  }, [visible, obligation, defaultEntityId]);

  const selectedEntity = entities.find((e) => e.id === entityId) ?? null;
  const showSubscription = isSubscriptionLike({ type }, selectedEntity);

  const entityOptions: SelectOption<string>[] = [
    { value: NO_ENTITY, label: t("form.noEntity") },
    ...entities.map((e) => ({ value: e.id, label: e.name })),
  ];
  const typeOptions: SelectOption<ObligationType>[] = TYPES.map((value) => ({
    value,
    label: typeLabel(t, value),
  }));
  const recurrenceOptions: SelectOption<Recurrence>[] = SUBSCRIPTION_RECURRENCES.map((value) => ({
    value,
    label: recurrenceLabel(t, value),
  }));

  function handleSave() {
    const trimmed = title.trim();
    if (trimmed === "") return;
    const parsedAmount = amount.trim() === "" ? null : Number(amount);
    onSubmit(
      {
        title: trimmed,
        entity_id: entityId === NO_ENTITY ? null : entityId,
        type,
        amount: parsedAmount !== null && Number.isNaN(parsedAmount) ? null : parsedAmount,
        currency: currency.trim() || "CAD",
        due_date: dueDate.trim() === "" ? null : dueDate.trim(),
        description: description.trim() === "" ? null : description.trim(),
        recurrence: showSubscription ? recurrence : "none",
        auto_paid: showSubscription ? autoPaid : false,
        paying_account: showSubscription && autoPaid && payingAccount.trim() !== ""
          ? payingAccount.trim()
          : null,
      },
      obligation?.id ?? null,
    );
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[88%] rounded-t-3xl bg-background">
          <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
            <Text className="font-display text-lg text-foreground">
              {obligation !== null ? t("form.editTitle") : t("form.title")}
            </Text>
            <Pressable accessibilityRole="button" onPress={onClose}>
              <X size={22} color={colorTokens.textMuted} />
            </Pressable>
          </View>

          <ScrollView contentContainerClassName="gap-3 p-4" keyboardShouldPersistTaps="handled">
            <Field
              label={t("form.fTitle")}
              value={title}
              onChangeText={setTitle}
              autoCapitalize="sentences"
            />
            <Select
              label={t("form.entity")}
              value={entityId}
              options={entityOptions}
              onChange={setEntityId}
            />
            <Select label={t("form.type")} value={type} options={typeOptions} onChange={setType} />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field
                  label={t("form.amount")}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                />
              </View>
              <View className="w-24">
                <Field
                  label={t("form.currency")}
                  value={currency}
                  onChangeText={setCurrency}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <Field
              label={t("form.dueDate")}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
            />

            {showSubscription ? (
              <View className="gap-3 rounded-2xl border border-purple/30 bg-purple/5 p-3">
                <Text className="font-display text-sm text-purple">{t("form.subSection")}</Text>
                <Select
                  label={t("form.recurrence")}
                  value={recurrence}
                  options={recurrenceOptions}
                  onChange={setRecurrence}
                />
                <SwitchRow
                  label={t("form.autoPaid")}
                  value={autoPaid}
                  onValueChange={setAutoPaid}
                />
                {autoPaid ? (
                  <Field
                    label={t("form.payingAccount")}
                    value={payingAccount}
                    onChangeText={setPayingAccount}
                    placeholder={t("form.payingPlaceholder")}
                    autoCapitalize="none"
                  />
                ) : null}
              </View>
            ) : null}

            <Field
              label={t("form.description")}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Button label={t("common.save")} variant="teal" onPress={handleSave} className="mt-2" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
