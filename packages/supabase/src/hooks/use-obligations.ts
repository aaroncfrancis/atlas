import { useQuery } from "@tanstack/react-query";
import type { Obligation } from "@atlas/core";
import { supabase } from "../client";

export const obligationsQueryKey = ["obligations"] as const;

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
