import { useQuery } from "@tanstack/react-query";
import type { Obligation } from "@atlas/core";
import { supabase } from "../client";
import type { Tables } from "../database.types";

export const obligationsQueryKey = ["obligations"] as const;
export const budgetsQueryKey = ["budgets"] as const;
export const obligationEventsKey = (obligationId: string) =>
  ["obligation_events", obligationId] as const;
export const documentsKey = (obligationId: string) => ["documents", obligationId] as const;

/** Fetch the signed-in user's obligations (RLS scopes them to the owner). */
export function useObligations() {
  return useQuery({
    queryKey: obligationsQueryKey,
    queryFn: async (): Promise<Obligation[]> => {
      const { data, error } = await supabase
        .from("obligations")
        .select("*")
        .order("due_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      // DB enum columns are TEXT+CHECK, so generated rows type them as `string`.
      // The CHECK constraints guarantee values fall within the @atlas/core unions,
      // making this boundary cast safe.
      return (data ?? []) as Obligation[];
    },
  });
}

export type ObligationEventRow = Tables<"obligation_events">;

/** Activity-timeline events for one obligation (oldest first). */
export function useObligationEvents(obligationId: string | undefined) {
  return useQuery({
    queryKey: obligationEventsKey(obligationId ?? ""),
    enabled: Boolean(obligationId),
    queryFn: async (): Promise<ObligationEventRow[]> => {
      const { data, error } = await supabase
        .from("obligation_events")
        .select("*")
        .eq("obligation_id", obligationId ?? "")
        .order("occurred_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type DocumentRow = Tables<"documents">;
/** A document plus a freshly-signed URL for the `scans` bucket object (if any). */
export type DocumentWithUrl = DocumentRow & { signedUrl: string | null };

/** Documents/receipts attached to an obligation, with signed storage URLs. */
export function useDocuments(obligationId: string | undefined) {
  return useQuery({
    queryKey: documentsKey(obligationId ?? ""),
    enabled: Boolean(obligationId),
    queryFn: async (): Promise<DocumentWithUrl[]> => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("obligation_id", obligationId ?? "");
      if (error) throw error;
      const rows = data ?? [];
      return Promise.all(
        rows.map(async (row): Promise<DocumentWithUrl> => {
          if (row.storage_path === null) return { ...row, signedUrl: row.file_url };
          const { data: signed } = await supabase.storage
            .from("scans")
            .createSignedUrl(row.storage_path, 60 * 60);
          return { ...row, signedUrl: signed?.signedUrl ?? row.file_url };
        }),
      );
    },
  });
}

export type BudgetRow = Tables<"budgets">;

/** Budget target rows (CLAUDE.md §6; the UI computes spend from obligations). */
export function useBudgets() {
  return useQuery({
    queryKey: budgetsQueryKey,
    queryFn: async (): Promise<BudgetRow[]> => {
      const { data, error } = await supabase.from("budgets").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });
}
