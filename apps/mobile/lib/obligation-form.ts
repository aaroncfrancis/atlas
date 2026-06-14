import { derivePriority } from "@atlas/core";
import type { TablesInsert, TablesUpdate } from "@atlas/supabase";
import type { ObligationFormValues } from "@atlas/ui";

// Map the UI form values onto DB insert/update shapes (CLAUDE.md §12: no DB calls
// inline in components — screens use these + the typed mutation hooks). Priority is
// derived from the due date (CLAUDE.md §8), matching the reference build.

export function formToInsert(
  values: ObligationFormValues,
): Omit<TablesInsert<"obligations">, "user_id"> {
  return {
    title: values.title,
    entity_id: values.entity_id,
    type: values.type,
    amount: values.amount,
    currency: values.currency,
    due_date: values.due_date,
    description: values.description,
    recurrence: values.recurrence,
    auto_paid: values.auto_paid,
    paying_account: values.paying_account,
    priority: derivePriority(values.due_date),
    source: "manual",
  };
}

export function formToUpdate(values: ObligationFormValues): TablesUpdate<"obligations"> {
  return {
    title: values.title,
    entity_id: values.entity_id,
    type: values.type,
    amount: values.amount,
    currency: values.currency,
    due_date: values.due_date,
    description: values.description,
    recurrence: values.recurrence,
    auto_paid: values.auto_paid,
    paying_account: values.paying_account,
    priority: derivePriority(values.due_date),
  };
}
