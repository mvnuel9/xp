export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      billing_settings: {
        Row: {
          created_at: string
          franchise_fee_type: string
          franchise_fee_value: number
          id: string
          inspection_base_price: number
          tax_rate: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          franchise_fee_type?: string
          franchise_fee_value?: number
          id?: string
          inspection_base_price?: number
          tax_rate?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          franchise_fee_type?: string
          franchise_fee_value?: number
          id?: string
          inspection_base_price?: number
          tax_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      client_credit_note_requests: {
        Row: {
          approved_by: string | null
          comment: string | null
          created_at: string
          id: string
          invoice_id: string
          reason: string
          requested_by: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          invoice_id: string
          reason: string
          requested_by: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          invoice_id?: string
          reason?: string
          requested_by?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_credit_note_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_credit_note_requests_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_credit_note_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_payment_types: {
        Row: {
          client_id: string
          created_at: string
          id: string
          payment_type: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          payment_type?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          payment_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_payment_types_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          franchise_id: string | null
          id: string
          name: string
          phone: string | null
          tax_exempt: boolean | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          franchise_id?: string | null
          id?: string
          name: string
          phone?: string | null
          tax_exempt?: boolean | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          franchise_id?: string | null
          id?: string
          name?: string
          phone?: string | null
          tax_exempt?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_invoices: {
        Row: {
          amount: number
          created_at: string
          credit_note_reason: string | null
          due_date: string | null
          fee_type: string
          fee_value: number
          franchise_id: string | null
          generated_automatically: boolean | null
          id: string
          invoice_date: string
          invoice_number: string
          is_credit_note: boolean | null
          paid_at: string | null
          parent_invoice_id: string | null
          period_end: string | null
          period_start: string | null
          status: string | null
          tax_amount: number
          tax_rate: number | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          credit_note_reason?: string | null
          due_date?: string | null
          fee_type: string
          fee_value: number
          franchise_id?: string | null
          generated_automatically?: boolean | null
          id?: string
          invoice_date?: string
          invoice_number: string
          is_credit_note?: boolean | null
          paid_at?: string | null
          parent_invoice_id?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          tax_amount: number
          tax_rate?: number | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          credit_note_reason?: string | null
          due_date?: string | null
          fee_type?: string
          fee_value?: number
          franchise_id?: string | null
          generated_automatically?: boolean | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          is_credit_note?: boolean | null
          paid_at?: string | null
          parent_invoice_id?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          tax_amount?: number
          tax_rate?: number | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "franchise_invoices_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchise_invoices_parent_invoice_id_fkey"
            columns: ["parent_invoice_id"]
            isOneToOne: false
            referencedRelation: "franchise_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      franchises: {
        Row: {
          created_at: string
          id: string
          is_blocked: boolean | null
          location: string
          name: string
          temporary_unblock_at: string | null
          temporary_unblock_by: string | null
          temporary_unblock_reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_blocked?: boolean | null
          location: string
          name: string
          temporary_unblock_at?: string | null
          temporary_unblock_by?: string | null
          temporary_unblock_reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_blocked?: boolean | null
          location?: string
          name?: string
          temporary_unblock_at?: string | null
          temporary_unblock_by?: string | null
          temporary_unblock_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inspection_details: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          inspection_id: string
          item: string
          photo_url: string | null
          section: string
          status: string | null
          subsection: string | null
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          inspection_id: string
          item: string
          photo_url?: string | null
          section: string
          status?: string | null
          subsection?: string | null
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          inspection_id?: string
          item?: string
          photo_url?: string | null
          section?: string
          status?: string | null
          subsection?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_details_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_status_history: {
        Row: {
          changed_by: string
          comment: string | null
          created_at: string
          id: string
          inspection_id: string
          location: Json | null
          new_status: string
          old_status: string | null
        }
        Insert: {
          changed_by: string
          comment?: string | null
          created_at?: string
          id?: string
          inspection_id: string
          location?: Json | null
          new_status: string
          old_status?: string | null
        }
        Update: {
          changed_by?: string
          comment?: string | null
          created_at?: string
          id?: string
          inspection_id?: string
          location?: Json | null
          new_status?: string
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_status_history_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          completed_at: string | null
          created_at: string
          franchise_id: string | null
          id: string
          inspector_id: string | null
          report_url: string | null
          status: Database["public"]["Enums"]["inspection_status"]
          supervisor_id: string | null
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          franchise_id?: string | null
          id?: string
          inspector_id?: string | null
          report_url?: string | null
          status?: Database["public"]["Enums"]["inspection_status"]
          supervisor_id?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          franchise_id?: string | null
          id?: string
          inspector_id?: string | null
          report_url?: string | null
          status?: Database["public"]["Enums"]["inspection_status"]
          supervisor_id?: string | null
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspections_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          credit_note_reason: string | null
          due_date: string | null
          franchise_id: string | null
          generated_automatically: boolean | null
          id: string
          inspection_id: string | null
          invoice_date: string
          invoice_number: string
          is_credit_note: boolean | null
          paid_at: string | null
          parent_invoice_id: string | null
          payment_term: string | null
          status: string | null
          tax_amount: number
          tax_rate: number | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          credit_note_reason?: string | null
          due_date?: string | null
          franchise_id?: string | null
          generated_automatically?: boolean | null
          id?: string
          inspection_id?: string | null
          invoice_date?: string
          invoice_number: string
          is_credit_note?: boolean | null
          paid_at?: string | null
          parent_invoice_id?: string | null
          payment_term?: string | null
          status?: string | null
          tax_amount: number
          tax_rate?: number | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          credit_note_reason?: string | null
          due_date?: string | null
          franchise_id?: string | null
          generated_automatically?: boolean | null
          id?: string
          inspection_id?: string | null
          invoice_date?: string
          invoice_number?: string
          is_credit_note?: boolean | null
          paid_at?: string | null
          parent_invoice_id?: string | null
          payment_term?: string | null
          status?: string | null
          tax_amount?: number
          tax_rate?: number | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_parent_invoice_id_fkey"
            columns: ["parent_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          franchise_id: string | null
          id: string
          is_read: boolean
          target_user_id: string | null
          target_user_role: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          franchise_id?: string | null
          id?: string
          is_read?: boolean
          target_user_id?: string | null
          target_user_role?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          franchise_id?: string | null
          id?: string
          is_read?: boolean
          target_user_id?: string | null
          target_user_role?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          profile_url: string | null
          role: Database["public"]["Enums"]["role_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          profile_url?: string | null
          role: Database["public"]["Enums"]["role_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          profile_url?: string | null
          role?: Database["public"]["Enums"]["role_type"]
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      storage_schema: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          name: string
          owner_id: string | null
          path: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          name: string
          owner_id?: string | null
          path: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          name?: string
          owner_id?: string | null
          path?: string
          updated_at?: string
        }
        Relationships: []
      }
      supervisor_availability: {
        Row: {
          available: boolean
          created_at: string
          id: string
          supervisor_id: string
          updated_at: string
        }
        Insert: {
          available?: boolean
          created_at?: string
          id?: string
          supervisor_id: string
          updated_at?: string
        }
        Update: {
          available?: boolean
          created_at?: string
          id?: string
          supervisor_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      supervisor_validations: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          inspection_id: string
          notes: string | null
          status: string
          supervisor_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          inspection_id: string
          notes?: string | null
          status?: string
          supervisor_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          inspection_id?: string
          notes?: string | null
          status?: string
          supervisor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supervisor_validations_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_franchises: {
        Row: {
          created_at: string
          franchise_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          franchise_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          franchise_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_franchises_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_franchises_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_items: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          inspection_detail_id: string
          status: string
          updated_at: string
          validation_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          inspection_detail_id: string
          status?: string
          updated_at?: string
          validation_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          inspection_detail_id?: string
          status?: string
          updated_at?: string
          validation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "validation_items_inspection_detail_id_fkey"
            columns: ["inspection_detail_id"]
            isOneToOne: false
            referencedRelation: "inspection_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "validation_items_validation_id_fkey"
            columns: ["validation_id"]
            isOneToOne: false
            referencedRelation: "supervisor_validations"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string
          chassis_number: string | null
          client_id: string | null
          created_at: string
          equipment: string | null
          fuel_type: string | null
          id: string
          license_plate: string | null
          model: string
          odometer: number | null
          purchase_price: number | null
          registration_date: string | null
          transmission: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          brand: string
          chassis_number?: string | null
          client_id?: string | null
          created_at?: string
          equipment?: string | null
          fuel_type?: string | null
          id?: string
          license_plate?: string | null
          model: string
          odometer?: number | null
          purchase_price?: number | null
          registration_date?: string | null
          transmission?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          brand?: string
          chassis_number?: string | null
          client_id?: string | null
          created_at?: string
          equipment?: string | null
          fuel_type?: string | null
          id?: string
          license_plate?: string | null
          model?: string
          odometer?: number | null
          purchase_price?: number | null
          registration_date?: string | null
          transmission?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_random_supervisor: {
        Args: { inspection_id: string }
        Returns: string
      }
      check_franchise_overdue_invoices: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_available_supervisors: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["role_type"]
      }
      user_belongs_to_franchise: {
        Args: { user_id: string; franchise_id: string }
        Returns: boolean
      }
    }
    Enums: {
      credit_note_status: "pending" | "approved" | "rejected"
      inspection_status:
        | "draft"
        | "submitted"
        | "awaiting_validation"
        | "validated"
        | "rejected"
        | "completed"
      role_type:
        | "admin"
        | "commercial"
        | "franchise_manager"
        | "supervisor"
        | "inspector"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      credit_note_status: ["pending", "approved", "rejected"],
      inspection_status: [
        "draft",
        "submitted",
        "awaiting_validation",
        "validated",
        "rejected",
        "completed",
      ],
      role_type: [
        "admin",
        "commercial",
        "franchise_manager",
        "supervisor",
        "inspector",
      ],
    },
  },
} as const
