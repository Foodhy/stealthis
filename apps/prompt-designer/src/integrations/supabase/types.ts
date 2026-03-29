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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      authors: {
        Row: {
          created_at: string | null
          email: string | null
          id: number
          name: string
          team: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: never
          name: string
          team?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: never
          name?: string
          team?: string | null
        }
        Relationships: []
      }
      prompt_components: {
        Row: {
          component_key: string
          component_label: string
          content: string
          created_at: string | null
          id: number
          is_enabled: boolean | null
          order_index: number
          prompt_id: number
          updated_at: string | null
        }
        Insert: {
          component_key: string
          component_label: string
          content: string
          created_at?: string | null
          id?: never
          is_enabled?: boolean | null
          order_index: number
          prompt_id: number
          updated_at?: string | null
        }
        Update: {
          component_key?: string
          component_label?: string
          content?: string
          created_at?: string | null
          id?: never
          is_enabled?: boolean | null
          order_index?: number
          prompt_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_components_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "latest_prompts_consolidated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_components_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_components_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts_with_components"
            referencedColumns: ["prompt_id"]
          },
        ]
      }
      prompt_history: {
        Row: {
          change_message: string | null
          change_type: string
          changed_by_id: number | null
          component_diffs: Json | null
          created_at: string | null
          id: number
          previous_version_id: number | null
          prompt_id: number
          tags_added: string[] | null
          tags_removed: string[] | null
          tools_added: string[] | null
          tools_removed: string[] | null
          variables_added: Json | null
          variables_modified: Json | null
          variables_removed: Json | null
        }
        Insert: {
          change_message?: string | null
          change_type: string
          changed_by_id?: number | null
          component_diffs?: Json | null
          created_at?: string | null
          id?: never
          previous_version_id?: number | null
          prompt_id: number
          tags_added?: string[] | null
          tags_removed?: string[] | null
          tools_added?: string[] | null
          tools_removed?: string[] | null
          variables_added?: Json | null
          variables_modified?: Json | null
          variables_removed?: Json | null
        }
        Update: {
          change_message?: string | null
          change_type?: string
          changed_by_id?: number | null
          component_diffs?: Json | null
          created_at?: string | null
          id?: never
          previous_version_id?: number | null
          prompt_id?: number
          tags_added?: string[] | null
          tags_removed?: string[] | null
          tools_added?: string[] | null
          tools_removed?: string[] | null
          variables_added?: Json | null
          variables_modified?: Json | null
          variables_removed?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_history_changed_by_id_fkey"
            columns: ["changed_by_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_history_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "latest_prompts_consolidated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_history_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_history_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "prompts_with_components"
            referencedColumns: ["prompt_id"]
          },
          {
            foreignKeyName: "prompt_history_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "latest_prompts_consolidated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_history_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_history_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts_with_components"
            referencedColumns: ["prompt_id"]
          },
        ]
      }
      prompt_tags: {
        Row: {
          prompt_id: number
          tag_id: number
        }
        Insert: {
          prompt_id: number
          tag_id: number
        }
        Update: {
          prompt_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_tags_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "latest_prompts_consolidated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_tags_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_tags_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts_with_components"
            referencedColumns: ["prompt_id"]
          },
          {
            foreignKeyName: "prompt_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_tools: {
        Row: {
          configuration: Json | null
          is_enabled: boolean | null
          prompt_id: number
          tool_id: number
        }
        Insert: {
          configuration?: Json | null
          is_enabled?: boolean | null
          prompt_id: number
          tool_id: number
        }
        Update: {
          configuration?: Json | null
          is_enabled?: boolean | null
          prompt_id?: number
          tool_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_tools_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "latest_prompts_consolidated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_tools_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_tools_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts_with_components"
            referencedColumns: ["prompt_id"]
          },
          {
            foreignKeyName: "prompt_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_variables: {
        Row: {
          created_at: string | null
          default_value: string | null
          description: string | null
          id: number
          is_required: boolean | null
          prompt_id: number
          variable_name: string
          variable_type: string
        }
        Insert: {
          created_at?: string | null
          default_value?: string | null
          description?: string | null
          id?: never
          is_required?: boolean | null
          prompt_id: number
          variable_name: string
          variable_type: string
        }
        Update: {
          created_at?: string | null
          default_value?: string | null
          description?: string | null
          id?: never
          is_required?: boolean | null
          prompt_id?: number
          variable_name?: string
          variable_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_variables_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "latest_prompts_consolidated"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_variables_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_variables_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts_with_components"
            referencedColumns: ["prompt_id"]
          },
        ]
      }
      prompts: {
        Row: {
          author_id: number
          created_at: string | null
          description: string | null
          id: number
          is_active: boolean | null
          title: string
          updated_at: string | null
          version: string
        }
        Insert: {
          author_id: number
          created_at?: string | null
          description?: string | null
          id?: never
          is_active?: boolean | null
          title: string
          updated_at?: string | null
          version: string
        }
        Update: {
          author_id?: number
          created_at?: string | null
          description?: string | null
          id?: never
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          name: string
        }
        Update: {
          created_at?: string | null
          id?: never
          name?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          configuration: Json | null
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: never
          name: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: never
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      latest_prompts_consolidated: {
        Row: {
          author_name: string | null
          author_team: string | null
          consolidated_prompt: string | null
          created_at: string | null
          description: string | null
          id: number | null
          tags: string[] | null
          title: string | null
          tools: string[] | null
          updated_at: string | null
          variable_count: number | null
          version: string | null
        }
        Relationships: []
      }
      prompts_with_components: {
        Row: {
          author_name: string | null
          author_team: string | null
          components: Json | null
          created_at: string | null
          description: string | null
          prompt_id: number | null
          title: string | null
          updated_at: string | null
          version: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_prompt_diff: {
        Args: { new_prompt_id: number; old_prompt_id: number }
        Returns: Json
      }
      compose_prompt: { Args: { p_prompt_id: number }; Returns: string }
      get_or_create_author: {
        Args: {
          author_email?: string
          author_name: string
          author_team?: string
        }
        Returns: number
      }
      get_or_create_tag: { Args: { tag_name: string }; Returns: number }
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
