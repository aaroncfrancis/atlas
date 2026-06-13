import { useMutation, useQueryClient } from "@tanstack/react-query";
import { advanceDate, type Obligation } from "@atlas/core";
import { useTranslation } from "@atlas/i18n";
import { supabase } from "../client";
import { toast } from "../toast";
import { obligationsQueryKey } from "./use-obligations";

// Toast-wrapped action layer (CLAUDE.md §12). Mutations live here, each paired
// with localized success/error feedback, so screens just call the hook.
//
// NOTE (CLAUDE.md §6/§8 open decision): recurrence advancement + event logging
// run app-side here today, mirroring the reference build. The pure helpers are
// in @atlas/core so the same logic could later be promoted to DB triggers.

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/** Mark an obligation done; spawn the next occurrence if it recurs. */
export function useResolveObligation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (obligation: Obligation): Promise<void> => {
      const nowIso = new Date().toISOString();

      const { error } = await supabase
        .from("obligations")
        .update({ status: "done", resolved_at: nowIso, resolved_method: "paid" })
        .eq("id", obligation.id);
      if (error) throw error;

      await supabase.from("obligation_events").insert({
        user_id: obligation.user_id,
        obligation_id: obligation.id,
        action: "resolved",
        amount: obligation.amount,
        occurred_at: nowIso,
      });

      if (obligation.recurrence !== "none" && obligation.due_date !== null) {
        await supabase.from("obligations").insert({
          user_id: obligation.user_id,
          entity_id: obligation.entity_id,
          title: obligation.title,
          description: obligation.description,
          type: obligation.type,
          amount: obligation.amount,
          currency: obligation.currency,
          due_date: advanceDate(obligation.due_date, obligation.recurrence),
          status: "open",
          priority: obligation.priority,
          source: "recurrence",
          vendor: obligation.vendor,
          recurrence: obligation.recurrence,
          auto_paid: obligation.auto_paid,
          paying_account: obligation.paying_account,
        });
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: obligationsQueryKey });
      toast.success(t("obligation.done"));
    },
    onError: (error) => toast.error(errorMessage(error, t("common.error"))),
  });
}

/** Snooze an obligation until a future date. */
export function useSnoozeObligation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      obligation,
      until,
    }: {
      obligation: Obligation;
      until: string;
    }): Promise<void> => {
      const { error } = await supabase
        .from("obligations")
        .update({ status: "snoozed", snoozed_until: until })
        .eq("id", obligation.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: obligationsQueryKey });
      toast.success(t("obligation.snooze"));
    },
    onError: (error) => toast.error(errorMessage(error, t("common.error"))),
  });
}

/** Dismiss an obligation (no recurrence). */
export function useDismissObligation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (obligation: Obligation): Promise<void> => {
      const { error } = await supabase
        .from("obligations")
        .update({
          status: "dismissed",
          resolved_at: new Date().toISOString(),
          resolved_method: "dismissed",
        })
        .eq("id", obligation.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: obligationsQueryKey });
      toast.success(t("obligation.dismiss"));
    },
    onError: (error) => toast.error(errorMessage(error, t("common.error"))),
  });
}
