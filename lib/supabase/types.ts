export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          thumbnail_url: string | null;
          canvas_data: Json;
          width: number;
          height: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          thumbnail_url?: string | null;
          canvas_data?: Json;
          width?: number;
          height?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          thumbnail_url?: string | null;
          canvas_data?: Json;
          width?: number;
          height?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          subscription: "free" | "pro";
          ai_quota_used: number;
          ai_quota_limit: number;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          subscription?: "free" | "pro";
          ai_quota_used?: number;
          ai_quota_limit?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          subscription?: "free" | "pro";
          ai_quota_used?: number;
          ai_quota_limit?: number;
          created_at?: string;
        };
      };
      usage_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          metadata: Json | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          metadata?: Json | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          metadata?: Json | null;
          timestamp?: string;
        };
      };
      preset_filters: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          thumbnail_url: string | null;
          filters_config: Json;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          thumbnail_url?: string | null;
          filters_config: Json;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          thumbnail_url?: string | null;
          filters_config?: Json;
          is_public?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
