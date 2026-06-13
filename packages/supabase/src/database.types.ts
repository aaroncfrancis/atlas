export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      automations: {
        Row: {
          config: Json | null
          entity_id: string | null
          id: string
          kind: string
          obligation_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          config?: Json | null
          entity_id?: string | null
          id?: string
          kind?: string
          obligation_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          config?: Json | null
          entity_id?: string | null
          id?: string
          kind?: string
          obligation_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automations_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automations_obligation_id_fkey"
            columns: ["obligation_id"]
            isOneToOne: false
            referencedRelation: "obligations"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          entity_id: string | null
          id: string
          limit_amount: number
          period: string
          user_id: string
        }
        Insert: {
          entity_id?: string | null
          id?: string
          limit_amount: number
          period?: string
          user_id: string
        }
        Update: {
          entity_id?: string | null
          id?: string
          limit_amount?: number
          period?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          granted_at: string
          id: string
          policy_version: string | null
          purpose: string
          user_id: string
          withdrawn_at: string | null
        }
        Insert: {
          granted_at?: string
          id?: string
          policy_version?: string | null
          purpose: string
          user_id: string
          withdrawn_at?: string | null
        }
        Update: {
          granted_at?: string
          id?: string
          policy_version?: string | null
          purpose?: string
          user_id?: string
          withdrawn_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          entity_id: string | null
          file_url: string | null
          id: string
          kind: string
          name: string
          obligation_id: string | null
          storage_path: string | null
          user_id: string
        }
        Insert: {
          entity_id?: string | null
          file_url?: string | null
          id?: string
          kind?: string
          name: string
          obligation_id?: string | null
          storage_path?: string | null
          user_id: string
        }
        Update: {
          entity_id?: string | null
          file_url?: string | null
          id?: string
          kind?: string
          name?: string
          obligation_id?: string | null
          storage_path?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_obligation_id_fkey"
            columns: ["obligation_id"]
            isOneToOne: false
            referencedRelation: "obligations"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          metadata: Json | null
          name: string
          type: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          name: string
          type: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      obligation_events: {
        Row: {
          action: string
          amount: number | null
          id: string
          note: string | null
          obligation_id: string | null
          occurred_at: string
          user_id: string
        }
        Insert: {
          action: string
          amount?: number | null
          id?: string
          note?: string | null
          obligation_id?: string | null
          occurred_at?: string
          user_id: string
        }
        Update: {
          action?: string
          amount?: number | null
          id?: string
          note?: string | null
          obligation_id?: string | null
          occurred_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "obligation_events_obligation_id_fkey"
            columns: ["obligation_id"]
            isOneToOne: false
            referencedRelation: "obligations"
            referencedColumns: ["id"]
          },
        ]
      }
      obligations: {
        Row: {
          amount: number | null
          auto_paid: boolean
          created_at: string
          currency: string
          description: string | null
          due_date: string | null
          entity_id: string | null
          id: string
          paying_account: string | null
          priority: string
          recurrence: string
          resolution_note: string | null
          resolved_at: string | null
          resolved_method: string | null
          snoozed_until: string | null
          source: string
          status: string
          title: string
          type: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          amount?: number | null
          auto_paid?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string | null
          entity_id?: string | null
          id?: string
          paying_account?: string | null
          priority?: string
          recurrence?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_method?: string | null
          snoozed_until?: string | null
          source?: string
          status?: string
          title: string
          type?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          amount?: number | null
          auto_paid?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string | null
          entity_id?: string | null
          id?: string
          paying_account?: string | null
          priority?: string
          recurrence?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_method?: string | null
          snoozed_until?: string | null
          source?: string
          status?: string
          title?: string
          type?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "obligations_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_initials: string | null
          created_at: string
          currency: string
          display_name: string | null
          id: string
          language: string
          push_enabled: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          reminder_lead_days: number
          week_start: string
        }
        Insert: {
          avatar_initials?: string | null
          created_at?: string
          currency?: string
          display_name?: string | null
          id: string
          language?: string
          push_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_lead_days?: number
          week_start?: string
        }
        Update: {
          avatar_initials?: string | null
          created_at?: string
          currency?: string
          display_name?: string | null
          id?: string
          language?: string
          push_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_lead_days?: number
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_my_account_data: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
