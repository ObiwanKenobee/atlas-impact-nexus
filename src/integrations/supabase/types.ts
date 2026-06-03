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
      communities: {
        Row: {
          created_at: string
          economy: Json
          environment: Json
          id: string
          name: string
          needs: string | null
          overview: string | null
          population: number
          region: string
          reports: Json
          score: number
          slug: string
        }
        Insert: {
          created_at?: string
          economy?: Json
          environment?: Json
          id: string
          name: string
          needs?: string | null
          overview?: string | null
          population?: number
          region: string
          reports?: Json
          score?: number
          slug: string
        }
        Update: {
          created_at?: string
          economy?: Json
          environment?: Json
          id?: string
          name?: string
          needs?: string | null
          overview?: string | null
          population?: number
          region?: string
          reports?: Json
          score?: number
          slug?: string
        }
        Relationships: []
      }
      evidence: {
        Row: {
          captured_at: string
          created_at: string
          id: string
          iot_payload: Json | null
          kind: Database["public"]["Enums"]["evidence_kind"]
          lat: number | null
          lng: number | null
          media_url: string | null
          meta: string | null
          project_id: string
          report_text: string | null
          title: string
          uploader_id: string | null
        }
        Insert: {
          captured_at?: string
          created_at?: string
          id?: string
          iot_payload?: Json | null
          kind: Database["public"]["Enums"]["evidence_kind"]
          lat?: number | null
          lng?: number | null
          media_url?: string | null
          meta?: string | null
          project_id: string
          report_text?: string | null
          title: string
          uploader_id?: string | null
        }
        Update: {
          captured_at?: string
          created_at?: string
          id?: string
          iot_payload?: Json | null
          kind?: Database["public"]["Enums"]["evidence_kind"]
          lat?: number | null
          lng?: number | null
          media_url?: string | null
          meta?: string | null
          project_id?: string
          report_text?: string | null
          title?: string
          uploader_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_trust_breakdown"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "evidence_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      projects: {
        Row: {
          beneficiaries: number
          category: string
          community_id: string
          created_at: string
          description: string
          donors: number
          goal_cents: number
          id: string
          image_key: string | null
          location: string
          long_description: string | null
          raised_cents: number
          slug: string
          started_at: string | null
          title: string
          verified_score: number
        }
        Insert: {
          beneficiaries?: number
          category: string
          community_id: string
          created_at?: string
          description: string
          donors?: number
          goal_cents?: number
          id: string
          image_key?: string | null
          location: string
          long_description?: string | null
          raised_cents?: number
          slug: string
          started_at?: string | null
          title: string
          verified_score?: number
        }
        Update: {
          beneficiaries?: number
          category?: string
          community_id?: string
          created_at?: string
          description?: string
          donors?: number
          goal_cents?: number
          id?: string
          image_key?: string | null
          location?: string
          long_description?: string | null
          raised_cents?: number
          slug?: string
          started_at?: string | null
          title?: string
          verified_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "projects_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_cents: number
          created_at: string
          donor_id: string | null
          donor_name: string | null
          id: string
          project_id: string
          receipt_number: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          donor_id?: string | null
          donor_name?: string | null
          id?: string
          project_id: string
          receipt_number?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          donor_id?: string | null
          donor_name?: string | null
          id?: string
          project_id?: string
          receipt_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_trust_breakdown"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      project_trust_breakdown: {
        Row: {
          beneficiary_count: number | null
          beneficiary_points: number | null
          gps_count: number | null
          gps_points: number | null
          media_count: number | null
          media_points: number | null
          project_id: string | null
          report_count: number | null
          report_points: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      fund_project: {
        Args: {
          _amount_cents: number
          _donor_name?: string
          _project_id: string
        }
        Returns: {
          amount_cents: number
          created_at: string
          donor_id: string | null
          donor_name: string | null
          id: string
          project_id: string
          receipt_number: string
        }
        SetofOptions: {
          from: "*"
          to: "transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "donor" | "field_worker" | "community_leader" | "admin"
      evidence_kind:
        | "GPS"
        | "IoT"
        | "PHOTO"
        | "VIDEO"
        | "REPORT"
        | "BENEFICIARY"
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
    Enums: {
      app_role: ["donor", "field_worker", "community_leader", "admin"],
      evidence_kind: ["GPS", "IoT", "PHOTO", "VIDEO", "REPORT", "BENEFICIARY"],
    },
  },
} as const
