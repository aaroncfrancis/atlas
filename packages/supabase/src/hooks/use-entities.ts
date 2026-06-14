import { useQuery } from "@tanstack/react-query";
import type { Entity } from "@atlas/core";
import { supabase } from "../client";
import type { Tables } from "../database.types";

export const entitiesQueryKey = ["entities"] as const;
export const entityDocumentsKey = (entityId: string) =>
  ["entity_documents", entityId] as const;

/** Fetch the signed-in user's entities (RLS scopes them to the owner). */
export function useEntities() {
  return useQuery({
    queryKey: entitiesQueryKey,
    queryFn: async (): Promise<Entity[]> => {
      const { data, error } = await supabase
        .from("entities")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      // Boundary cast: TEXT+CHECK columns + JSONB metadata are typed loosely by
      // the generated types but conform to the @atlas/core Entity shape.
      return (data ?? []) as Entity[];
    },
  });
}

/** Documents attached to one entity (CLAUDE.md §6 `documents`). */
export function useEntityDocuments(entityId: string | undefined) {
  return useQuery({
    queryKey: entityDocumentsKey(entityId ?? ""),
    enabled: Boolean(entityId),
    queryFn: async (): Promise<Tables<"documents">[]> => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("entity_id", entityId ?? "");
      if (error) throw error;
      return data ?? [];
    },
  });
}
