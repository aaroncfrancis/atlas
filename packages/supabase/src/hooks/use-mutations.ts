import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { advanceDate, isAutoPaid, type Obligation } from "@atlas/core";
import { useTranslation } from "@atlas/i18n";
import { supabase } from "../client";
import { toast } from "../toast";
import type { TablesInsert, TablesUpdate } from "../database.types";
import { obligationsQueryKey } from "./use-obligations";

// Raw, toast-free mutations (CLAUDE.md §8/§12). Recurrence advancement + event
// logging run app-side here, mirroring the reference build; the pure helpers live
// in @atlas/core so this could later be promoted to DB triggers. Success toasts
// (with Undo) are added by the `useObligationActions` layer in use-actions.ts;
// these only surface errors so undo/optimistic flows stay quiet.

const eventsKey = ["obligation_events"] as const;

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

type EventAction = "created" | "resolved" | "snoozed" | "automated" | "dismissed";

async function logEvent(
  obligation: Pick<Obligation, "id" | "user_id" | "amount">,
  action: EventAction,
  occurredAt: string,
  note?: string,
): Promise<void> {
  await supabase.from("obligation_events").insert({
    user_id: obligation.user_id,
    obligation_id: obligation.id,
    action,
    amount: obligation.amount,
    occurred_at: occurredAt,
    note: note ?? null,
  });
}

/** Insert a recurrence copy of an obligation at an explicit due date. */
async function insertOccurrence(obligation: Obligation, dueDate: string): Promise<void> {
  await supabase.from("obligations").insert({
    user_id: obligation.user_id,
    entity_id: obligation.entity_id,
    title: obligation.title,
    description: obligation.description,
    type: obligation.type,
    amount: obligation.amount,
    currency: obligation.currency,
    due_date: dueDate,
    status: "open",
    priority: obligation.priority,
    source: "recurrence",
    vendor: obligation.vendor,
    recurrence: obligation.recurrence,
    auto_paid: obligation.auto_paid,
    paying_account: obligation.paying_account,
  });
}

/** Build the next occurrence of a recurring obligation (source: recurrence). */
async function spawnNextOccurrence(obligation: Obligation): Promise<void> {
  if (obligation.recurrence === "none" || obligation.due_date === null) return;
  await insertOccurrence(obligation, advanceDate(obligation.due_date, obligation.recurrence));
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: obligationsQueryKey });
    void queryClient.invalidateQueries({ queryKey: eventsKey });
  };
}

/** Patch an obligation by id. Used by the form (edit) and undo. */
export function useUpdateObligation() {
  const invalidate = useInvalidate();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: TablesUpdate<"obligations">;
    }): Promise<void> => {
      const { error } = await supabase.from("obligations").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (error) => toast.error(errorMessage(error, t("common.error"))),
  });
}

/** Mark an obligation done; spawn the next occurrence if it recurs. */
export function useResolveObligation() {
  const invalidate = useInvalidate();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (obligation: Obligation): Promise<void> => {
      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from("obligations")
        .update({ status: "done", resolved_at: nowIso, resolved_method: "paid" })
        .eq("id", obligation.id);
      if (error) throw error;
      await logEvent(obligation, "resolved", nowIso);
      await spawnNextOccurrence(obligation);
    },
    onSuccess: invalidate,
    onError: (error) => toast.error(errorMessage(error, t("common.error"))),
  });
}

/** Snooze an obligation until a future date. */
export function useSnoozeObligation() {
  const invalidate = useInvalidate();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async ({
      obligation,
      until,
    }: {
      obligation: Obligation;
      until: string;
    }): Promise<void> => {
      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from("obligations")
        .update({ status: "snoozed", snoozed_until: until })
        .eq("id", obligation.id);
      if (error) throw error;
      await logEvent(obligation, "snoozed", nowIso);
    },
    onSuccess: invalidate,
    onError: (error) => toast.error(errorMessage(error, t("common.error"))),
  });
}

/** Dismiss an obligation (no recurrence). */
export function useDismissObligation() {
  const invalidate = useInvalidate();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (obligation: Obligation): Promise<void> => {
      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from("obligations")
        .update({ status: "dismissed", resolved_at: nowIso, resolved_method: "dismissed" })
        .eq("id", obligation.id);
      if (error) throw error;
      await logEvent(obligation, "dismissed", nowIso);
    },
    onSuccess: invalidate,
    onError: (error) => toast.error(errorMessage(error, t("common.error"))),
  });
}

/** Automate an obligation: record an automation and mark it handled. */
export function useAutomate() {
  const invalidate = useInvalidate();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (obligation: Obligation): Promise<void> => {
      const nowIso = new Date().toISOString();
      const { error: insertError } = await supabase.from("automations").insert({
        user_id: obligation.user_id,
        obligation_id: obligation.id,
        entity_id: obligation.entity_id,
        kind: obligation.type === "bill" ? "autopay" : "auto_renew",
        status: "active",
      });
      if (insertError) throw insertError;
      const { error } = await supabase
        .from("obligations")
        .update({ status: "automated", resolved_at: nowIso, resolved_method: "automated" })
        .eq("id", obligation.id);
      if (error) throw error;
      await logEvent(obligation, "automated", nowIso);
    },
    onSuccess: invalidate,
    onError: (error) => toast.error(errorMessage(error, t("common.error"))),
  });
}

/** Cancel a subscription: dismiss it and stop the recurrence (CLAUDE.md §8). */
export function useCancelSubscription() {
  const invalidate = useInvalidate();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (obligation: Obligation): Promise<void> => {
      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from("obligations")
        .update({
          status: "dismissed",
          recurrence: "none",
          auto_paid: false,
          resolved_at: nowIso,
          resolved_method: "dismissed",
          resolution_note: "subscription cancelled",
        })
        .eq("id", obligation.id);
      if (error) throw error;
      await logEvent(obligation, "dismissed", nowIso, "subscription cancelled");
    },
    onSuccess: invalidate,
    onError: (error) => toast.error(errorMessage(error, t("common.error"))),
  });
}

/** Create an obligation (manual add / edit-sheet create). Logs a created event. */
export function useCreateObligation() {
  const invalidate = useInvalidate();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (
      input: Omit<TablesInsert<"obligations">, "user_id">,
    ): Promise<Obligation> => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("obligations")
        .insert({ ...input, user_id: userId })
        .select("*")
        .single();
      if (error) throw error;
      const created = data as Obligation;
      await logEvent(created, "created", new Date().toISOString());
      return created;
    },
    onSuccess: invalidate,
    onError: (error) => toast.error(errorMessage(error, t("common.error"))),
  });
}

/**
 * Auto-paid rollover (CLAUDE.md §8): on data change, advance any past-due
 * auto-paid obligation to its next future occurrence — mark the current one
 * `automated` and create the next, skipping intermediate dates. Mounted once in
 * the app shell. A ref guards against re-entrancy while a pass is in flight.
 */
export function useAutoPaidRollover(obligations: Obligation[]): void {
  const queryClient = useQueryClient();
  const running = useRef(false);

  useEffect(() => {
    if (running.current) return;
    const now = Date.now();
    const stale = obligations.filter(
      (o) =>
        isAutoPaid(o) &&
        o.status === "open" &&
        o.due_date !== null &&
        new Date(o.due_date).getTime() < now,
    );
    if (stale.length === 0) return;

    running.current = true;
    void (async () => {
      try {
        for (const o of stale) {
          const due = o.due_date;
          if (due === null) continue;
          const nowIso = new Date().toISOString();
          await supabase
            .from("obligations")
            .update({ status: "automated", resolved_at: nowIso, resolved_method: "automated" })
            .eq("id", o.id);
          await logEvent(o, "automated", nowIso);

          // Advance to the next strictly-future occurrence, skipping any dates
          // that are already in the past.
          let nextDue = advanceDate(due, o.recurrence);
          while (new Date(nextDue).getTime() < now) {
            nextDue = advanceDate(nextDue, o.recurrence);
          }
          await insertOccurrence(o, nextDue);
        }
        void queryClient.invalidateQueries({ queryKey: obligationsQueryKey });
        void queryClient.invalidateQueries({ queryKey: eventsKey });
      } finally {
        running.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obligations]);
}
