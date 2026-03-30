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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      process_attachments: {
        Row: {
          file_name: string
          file_url: string
          id: string
          process_id: string
          storage_path: string
          type: Database["public"]["Enums"]["attachment_type"]
          uploaded_at: string | null
          uploaded_by: string
          uploaded_by_name: string
        }
        Insert: {
          file_name: string
          file_url: string
          id?: string
          process_id: string
          storage_path: string
          type: Database["public"]["Enums"]["attachment_type"]
          uploaded_at?: string | null
          uploaded_by: string
          uploaded_by_name: string
        }
        Update: {
          file_name?: string
          file_url?: string
          id?: string
          process_id?: string
          storage_path?: string
          type?: Database["public"]["Enums"]["attachment_type"]
          uploaded_at?: string | null
          uploaded_by?: string
          uploaded_by_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_attachments_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      processes: {
        Row: {
          created_at: string | null
          created_by: string
          created_by_name: string
          current_status: Database["public"]["Enums"]["process_status"]
          destination: string
          id: string
          is_it: boolean
          item_name: string
          patrimonio_confirmed: boolean
          process_number: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          created_by_name: string
          current_status?: Database["public"]["Enums"]["process_status"]
          destination?: string
          id?: string
          is_it?: boolean
          item_name: string
          patrimonio_confirmed?: boolean
          process_number: string
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          created_by_name?: string
          current_status?: Database["public"]["Enums"]["process_status"]
          destination?: string
          id?: string
          is_it?: boolean
          item_name?: string
          patrimonio_confirmed?: boolean
          process_number?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      timeline_entries: {
        Row: {
          agreement: string | null
          attachment_file_name: string | null
          attachment_url: string | null
          created_at: string | null
          id: string
          notes: string | null
          process_id: string
          sector: string
          status: Database["public"]["Enums"]["process_status"]
          user_id: string
          user_name: string
        }
        Insert: {
          agreement?: string | null
          attachment_file_name?: string | null
          attachment_url?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          process_id: string
          sector: string
          status: Database["public"]["Enums"]["process_status"]
          user_id: string
          user_name: string
        }
        Update: {
          agreement?: string | null
          attachment_file_name?: string | null
          attachment_url?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          process_id?: string
          sector?: string
          status?: Database["public"]["Enums"]["process_status"]
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_entries_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "planejamento" | "almoxarifado" | "nti" | "patrimonio" | "admin"
      attachment_type: "processo" | "fct" | "termo_incorporacao"
      process_status:
        | "aguardando_recebimento"
        | "recebido_almoxarifado"
        | "conferencia_nti"
        | "conferencia_almoxarifado"
        | "de_acordo"
        | "em_desacordo"
        | "pendencia_fornecedor"
        | "patrimonio"
        | "entregue"
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
      app_role: ["planejamento", "almoxarifado", "nti", "patrimonio", "admin"],
      attachment_type: ["processo", "fct", "termo_incorporacao"],
      process_status: [
        "aguardando_recebimento",
        "recebido_almoxarifado",
        "conferencia_nti",
        "conferencia_almoxarifado",
        "de_acordo",
        "em_desacordo",
        "pendencia_fornecedor",
        "patrimonio",
        "entregue",
      ],
    },
  },
} as const
