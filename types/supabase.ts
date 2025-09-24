export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      branches: {
        Row: {
          address: Json;
          code: string;
          contact: Json;
          created_at: string | null;
          editable: boolean | null;
          established_date: string | null;
          id: string;
          is_active: boolean | null;
          manager: Json | null;
          name: string;
          operating_hours: Json | null;
          parent_branch_id: string | null;
          performance: Json | null;
          region: string | null;
          services: string[] | null;
          target_metrics: Json | null;
          type: Database["public"]["Enums"]["branch_type"];
          updated_at: string | null;
          zone: string | null;
        };
        Insert: {
          address: Json;
          code: string;
          contact: Json;
          created_at?: string | null;
          editable?: boolean | null;
          established_date?: string | null;
          id?: string;
          is_active?: boolean | null;
          manager?: Json | null;
          name: string;
          operating_hours?: Json | null;
          parent_branch_id?: string | null;
          performance?: Json | null;
          region?: string | null;
          services?: string[] | null;
          target_metrics?: Json | null;
          type: Database["public"]["Enums"]["branch_type"];
          updated_at?: string | null;
          zone?: string | null;
        };
        Update: {
          address?: Json;
          code?: string;
          contact?: Json;
          created_at?: string | null;
          editable?: boolean | null;
          established_date?: string | null;
          id?: string;
          is_active?: boolean | null;
          manager?: Json | null;
          name?: string;
          operating_hours?: Json | null;
          parent_branch_id?: string | null;
          performance?: Json | null;
          region?: string | null;
          services?: string[] | null;
          target_metrics?: Json | null;
          type?: Database["public"]["Enums"]["branch_type"];
          updated_at?: string | null;
          zone?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "branches_parent_branch_id_fkey";
            columns: ["parent_branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          }
        ];
      };
      document_files: {
        Row: {
          created_at: string | null;
          document_id: string | null;
          id: string;
          is_additional: boolean | null;
          name: string | null;
          size: number | null;
          url: string;
        };
        Insert: {
          created_at?: string | null;
          document_id?: string | null;
          id?: string;
          is_additional?: boolean | null;
          name?: string | null;
          size?: number | null;
          url: string;
        };
        Update: {
          created_at?: string | null;
          document_id?: string | null;
          id?: string;
          is_additional?: boolean | null;
          name?: string | null;
          size?: number | null;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_files_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          }
        ];
      };
      documents: {
        Row: {
          id: string;
          lead_id: string | null;
          notes: string | null;
          requirement_id: string;
          status: Database["public"]["Enums"]["document_status"] | null;
          uploaded_at: string | null;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          id?: string;
          lead_id?: string | null;
          notes?: string | null;
          requirement_id: string;
          status?: Database["public"]["Enums"]["document_status"] | null;
          uploaded_at?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          id?: string;
          lead_id?: string | null;
          notes?: string | null;
          requirement_id?: string;
          status?: Database["public"]["Enums"]["document_status"] | null;
          uploaded_at?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "documents_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      leads: {
        Row: {
          additional_info: string | null;
          address: string | null;
          annual_income: string | null;
          application_status: Database["public"]["Enums"]["application_status"];
          assigned_agent: string | null;
          assigned_at: string | null;
          assigned_branch: string | null;
          assigned_staff: string | null;
          assignment_status: string | null;
          bank_assigned_at: string | null;
          bank_branch: string | null;
          bank_documents: Json | null;
          bank_staff: string | null;
          branch_id: string | null;
          cibil_score: number | null;
          client_name: string;
          contact_number: string;
          cost: number | null;
          created_at: string | null;
          created_by: string | null;
          created_by_staff: boolean | null;
          date_of_birth: string | null;
          document_completion_status:
            | Database["public"]["Enums"]["document_completion_status"]
            | null;
          documents_submitted_at: string | null;
          edit_history: Json | null;
          email: string | null;
          id: string;
          is_visible_to_staff: boolean | null;
          lead_name: string | null;
          lead_source: string;
          lead_type: string;
          loan_amount: string | null;
          notes: string | null;
          owner_manager_assignment: string | null;
          purpose: string | null;
          remarks: string | null;
          selected_bank: string | null;
          status: string | null;
          status_updated_at: string | null;
          timeline: Json | null;
          updated_at: string | null;
        };
        Insert: {
          additional_info?: string | null;
          address?: string | null;
          annual_income?: string | null;
          application_status: Database["public"]["Enums"]["application_status"];
          assigned_agent?: string | null;
          assigned_at?: string | null;
          assigned_branch?: string | null;
          assigned_staff?: string | null;
          assignment_status?: string | null;
          bank_assigned_at?: string | null;
          bank_branch?: string | null;
          bank_documents?: Json | null;
          bank_staff?: string | null;
          branch_id?: string | null;
          cibil_score?: number | null;
          client_name: string;
          contact_number: string;
          cost?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          created_by_staff?: boolean | null;
          date_of_birth?: string | null;
          document_completion_status?:
            | Database["public"]["Enums"]["document_completion_status"]
            | null;
          documents_submitted_at?: string | null;
          edit_history?: Json | null;
          email?: string | null;
          id?: string;
          is_visible_to_staff?: boolean | null;
          lead_name?: string | null;
          lead_source: string;
          lead_type: string;
          loan_amount?: string | null;
          notes?: string | null;
          owner_manager_assignment?: string | null;
          purpose?: string | null;
          remarks?: string | null;
          selected_bank?: string | null;
          status?: string | null;
          status_updated_at?: string | null;
          timeline?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          additional_info?: string | null;
          address?: string | null;
          annual_income?: string | null;
          application_status?: Database["public"]["Enums"]["application_status"];
          assigned_agent?: string | null;
          assigned_at?: string | null;
          assigned_branch?: string | null;
          assigned_staff?: string | null;
          assignment_status?: string | null;
          bank_assigned_at?: string | null;
          bank_branch?: string | null;
          bank_documents?: Json | null;
          bank_staff?: string | null;
          branch_id?: string | null;
          cibil_score?: number | null;
          client_name?: string;
          contact_number?: string;
          cost?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          created_by_staff?: boolean | null;
          date_of_birth?: string | null;
          document_completion_status?:
            | Database["public"]["Enums"]["document_completion_status"]
            | null;
          documents_submitted_at?: string | null;
          edit_history?: Json | null;
          email?: string | null;
          id?: string;
          is_visible_to_staff?: boolean | null;
          lead_name?: string | null;
          lead_source?: string;
          lead_type?: string;
          loan_amount?: string | null;
          notes?: string | null;
          owner_manager_assignment?: string | null;
          purpose?: string | null;
          remarks?: string | null;
          selected_bank?: string | null;
          status?: string | null;
          status_updated_at?: string | null;
          timeline?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "leads_assigned_branch_fkey";
            columns: ["assigned_branch"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_assigned_staff_fkey";
            columns: ["assigned_staff"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      permissions: {
        Row: {
          category: string | null;
          description: string | null;
          id: string;
          name: string;
        };
        Insert: {
          category?: string | null;
          description?: string | null;
          id: string;
          name: string;
        };
        Update: {
          category?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          id: string;
          permission_id: string | null;
          role: Database["public"]["Enums"]["user_role"];
        };
        Insert: {
          id?: string;
          permission_id?: string | null;
          role: Database["public"]["Enums"]["user_role"];
        };
        Update: {
          id?: string;
          permission_id?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          branch_id: string | null;
          can_access_employer_login: boolean | null;
          created_at: string | null;
          designation: string | null;
          email: string | null;
          id: string;
          is_active: boolean | null;
          last_login: string | null;
          name: string | null;
          password: string | null;
          permissions: Json | null;
          phone: string | null;
          photo: string | null;
          role: Database["public"]["Enums"]["user_role"];
          type: Database["public"]["Enums"]["user_type"];
          username: string;
        };
        Insert: {
          branch_id?: string | null;
          can_access_employer_login?: boolean | null;
          created_at?: string | null;
          designation?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_login?: string | null;
          name?: string | null;
          password?: string | null;
          permissions?: Json | null;
          phone?: string | null;
          photo?: string | null;
          role: Database["public"]["Enums"]["user_role"];
          type: Database["public"]["Enums"]["user_type"];
          username: string;
        };
        Update: {
          branch_id?: string | null;
          can_access_employer_login?: boolean | null;
          created_at?: string | null;
          designation?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_login?: string | null;
          name?: string | null;
          password?: string | null;
          permissions?: Json | null;
          phone?: string | null;
          photo?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          type?: Database["public"]["Enums"]["user_type"];
          username?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      application_status: "login" | "pending" | "sanctioned" | "rejected";
      branch_type: "main" | "sub" | "service";
      document_completion_status: "pending" | "partial" | "complete";
      document_status: "pending" | "provided" | "verified";
      user_role: "owner" | "branch_head" | "manager" | "admin" | "staff";
      user_type: "official" | "employee";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      application_status: ["login", "pending", "sanctioned", "rejected"],
      branch_type: ["main", "sub", "service"],
      document_completion_status: ["pending", "partial", "complete"],
      document_status: ["pending", "provided", "verified"],
      user_role: ["owner", "branch_head", "manager", "admin", "staff"],
      user_type: ["official", "employee"],
    },
  },
} as const;
