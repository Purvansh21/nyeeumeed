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
      admin_users: {
        Row: {
          contact_info: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login_at: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          last_login_at?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          created_at: string
          date: string
          id: number
          message: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: number
          message: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: number
          message?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      beneficiary_needs: {
        Row: {
          assigned_to: string | null
          beneficiary_id: string
          category: string
          created_at: string
          description: string
          id: string
          priority: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          beneficiary_id: string
          category: string
          created_at?: string
          description: string
          id?: string
          priority: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          beneficiary_id?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_needs_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_needs_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_users"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiary_users: {
        Row: {
          assistance_history: Json | null
          contact_info: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login_at: string | null
          needs: string | null
        }
        Insert: {
          assistance_history?: Json | null
          contact_info?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          last_login_at?: string | null
          needs?: string | null
        }
        Update: {
          assistance_history?: Json | null
          contact_info?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          needs?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          additional_info: Json | null
          contact_info: string | null
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          last_login_at: string | null
          role: string
        }
        Insert: {
          additional_info?: Json | null
          contact_info?: string | null
          created_at?: string
          full_name: string
          id: string
          is_active?: boolean
          last_login_at?: string | null
          role: string
        }
        Update: {
          additional_info?: Json | null
          contact_info?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          role?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          created_by: string
          data: Json | null
          description: string | null
          id: string
          parameters: Json | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          data?: Json | null
          description?: string | null
          id?: string
          parameters?: Json | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          data?: Json | null
          description?: string | null
          id?: string
          parameters?: Json | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      resource_allocations: {
        Row: {
          allocated_by: string
          allocated_date: string
          beneficiary_id: string
          id: string
          notes: string | null
          quantity: number
          resource_id: string
        }
        Insert: {
          allocated_by: string
          allocated_date?: string
          beneficiary_id: string
          id?: string
          notes?: string | null
          quantity: number
          resource_id: string
        }
        Update: {
          allocated_by?: string
          allocated_date?: string
          beneficiary_id?: string
          id?: string
          notes?: string | null
          quantity?: number
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_allocations_allocated_by_fkey"
            columns: ["allocated_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_allocations_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiary_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_allocations_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          allocated: number
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          quantity: number
          unit: string
          updated_at: string
        }
        Insert: {
          allocated?: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          quantity?: number
          unit: string
          updated_at?: string
        }
        Update: {
          allocated?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          quantity?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description: string
          due_date?: string | null
          id?: string
          priority: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_users: {
        Row: {
          contact_info: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login_at: string | null
          position: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean
          last_login_at?: string | null
          position?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          position?: string | null
        }
        Relationships: []
      }
      volunteer_opportunities: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          date: string
          description: string
          end_time: string
          id: string
          location: string
          spots_available: number
          spots_filled: number
          start_time: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          date: string
          description: string
          end_time: string
          id?: string
          location: string
          spots_available?: number
          spots_filled?: number
          start_time: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          end_time?: string
          id?: string
          location?: string
          spots_available?: number
          spots_filled?: number
          start_time?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      volunteer_registrations: {
        Row: {
          completed_at: string | null
          feedback: string | null
          hours_logged: number | null
          id: string
          opportunity_id: string
          registered_at: string
          status: string
          volunteer_id: string
        }
        Insert: {
          completed_at?: string | null
          feedback?: string | null
          hours_logged?: number | null
          id?: string
          opportunity_id: string
          registered_at?: string
          status?: string
          volunteer_id: string
        }
        Update: {
          completed_at?: string | null
          feedback?: string | null
          hours_logged?: number | null
          id?: string
          opportunity_id?: string
          registered_at?: string
          status?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_registrations_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "volunteer_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_shifts: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_time: string
          id: string
          location: string | null
          start_time: string
          status: string
          title: string
          updated_at: string
          volunteer_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          start_time: string
          status?: string
          title: string
          updated_at?: string
          volunteer_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          start_time?: string
          status?: string
          title?: string
          updated_at?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_shifts_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteer_users"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_training_materials: {
        Row: {
          category: string
          content_type: string
          created_at: string
          description: string
          file_path: string | null
          id: string
          is_required: boolean | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category: string
          content_type: string
          created_at?: string
          description: string
          file_path?: string | null
          id?: string
          is_required?: boolean | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string
          content_type?: string
          created_at?: string
          description?: string
          file_path?: string | null
          id?: string
          is_required?: boolean | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      volunteer_training_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          material_id: string
          score: number | null
          started_at: string | null
          status: string
          updated_at: string
          volunteer_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          material_id: string
          score?: number | null
          started_at?: string | null
          status: string
          updated_at?: string
          volunteer_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          material_id?: string
          score?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_training_progress_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "volunteer_training_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_training_progress_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteer_users"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_users: {
        Row: {
          availability: string | null
          contact_info: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login_at: string | null
          skills: string[] | null
        }
        Insert: {
          availability?: string | null
          contact_info?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          last_login_at?: string | null
          skills?: string[] | null
        }
        Update: {
          availability?: string | null
          contact_info?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          skills?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
