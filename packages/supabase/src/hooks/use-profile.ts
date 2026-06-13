import { useQuery } from "@tanstack/react-query";
import { supabase } from "../client";
import type { Tables } from "../database.types";

export const profileQueryKey = ["profile"] as const;

/** Fetch the signed-in user's profile row, or null when signed out. */
export function useProfile() {
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: async (): Promise<Tables<"profiles"> | null> => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
