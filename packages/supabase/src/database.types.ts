// ───────────────────────────────────────────────────────────────────────────
//  PLACEHOLDER — replace with generated types once the project is linked:
//    supabase gen types typescript --project-id <ref> > database.types.ts
//
//  Until then this hand-written subset (built from @atlas/core row types) keeps
//  the typed client honest for the tables the skeleton touches. The live schema
//  is the source of truth (CLAUDE.md §6, §11.2); treat the generated file as
//  authoritative the moment it exists.
// ───────────────────────────────────────────────────────────────────────────
import type { Entity, Obligation } from "@atlas/core";

export type ProfileRow = {
  id: string;
  display_name: string | null;
  language: string;
  currency: string;
  week_start: string;
  reminder_lead_days: number;
  push_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  avatar_initials: string | null;
  created_at: string;
}

export type ObligationEventRow = {
  id: string;
  user_id: string;
  obligation_id: string;
  action: string;
  amount: number | null;
  occurred_at: string;
  note: string | null;
}

type Empty = Record<string, never>;

export interface Database {
  public: {
    Tables: {
      obligations: {
        Row: Obligation;
        Insert: Partial<Obligation> & Pick<Obligation, "user_id" | "title">;
        Update: Partial<Obligation>;
        Relationships: [];
      };
      entities: {
        Row: Entity;
        Insert: Partial<Entity> & Pick<Entity, "user_id" | "type" | "name">;
        Update: Partial<Entity>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, "id">;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      obligation_events: {
        Row: ObligationEventRow;
        Insert: Partial<ObligationEventRow> &
          Pick<ObligationEventRow, "user_id" | "obligation_id" | "action">;
        Update: Partial<ObligationEventRow>;
        Relationships: [];
      };
    };
    Views: Empty;
    Functions: Empty;
    Enums: Empty;
    CompositeTypes: Empty;
  };
}
