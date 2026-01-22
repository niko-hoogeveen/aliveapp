/**
 * Database types for Supabase.
 * 
 * TODO: Generate these types from your Supabase schema using:
 * npx supabase gen types typescript --project-id your-project-id > types/database.ts
 * 
 * For now, these are placeholder types based on the PRD schema.
 */

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
      profiles: {
        Row: {
          id: string;
          role: 'guardian' | 'dependent' | null;
          display_name: string | null;
          avatar_url: string | null;
          push_token: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: 'guardian' | 'dependent' | null;
          display_name?: string | null;
          avatar_url?: string | null;
          push_token?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: 'guardian' | 'dependent' | null;
          display_name?: string | null;
          avatar_url?: string | null;
          push_token?: string | null;
          phone?: string | null;
          created_at?: string;
        };
      };
      relationships: {
        Row: {
          id: string;
          guardian_id: string;
          dependent_id: string | null;
          invite_code: string | null;
          status: 'pending' | 'active' | 'removed';
          created_at: string;
        };
        Insert: {
          id?: string;
          guardian_id: string;
          dependent_id?: string | null;
          invite_code?: string | null;
          status?: 'pending' | 'active' | 'removed';
          created_at?: string;
        };
        Update: {
          id?: string;
          guardian_id?: string;
          dependent_id?: string | null;
          invite_code?: string | null;
          status?: 'pending' | 'active' | 'removed';
          created_at?: string;
        };
      };
      schedules: {
        Row: {
          id: string;
          relationship_id: string;
          start_time: string;
          end_time: string;
          days_of_week: number[];
          reminder_minutes: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          relationship_id: string;
          start_time: string;
          end_time: string;
          days_of_week: number[];
          reminder_minutes?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          relationship_id?: string;
          start_time?: string;
          end_time?: string;
          days_of_week?: number[];
          reminder_minutes?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      checkins: {
        Row: {
          id: string;
          dependent_id: string;
          schedule_id: string | null;
          checked_in_at: string;
          status: 'completed' | 'missed' | 'help_requested';
        };
        Insert: {
          id?: string;
          dependent_id: string;
          schedule_id?: string | null;
          checked_in_at?: string;
          status?: 'completed' | 'missed' | 'help_requested';
        };
        Update: {
          id?: string;
          dependent_id?: string;
          schedule_id?: string | null;
          checked_in_at?: string;
          status?: 'completed' | 'missed' | 'help_requested';
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier: 'free' | 'premium' | 'family';
          revenuecat_customer_id: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier?: 'free' | 'premium' | 'family';
          revenuecat_customer_id?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tier?: 'free' | 'premium' | 'family';
          revenuecat_customer_id?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Relationship = Database['public']['Tables']['relationships']['Row'];
export type Schedule = Database['public']['Tables']['schedules']['Row'];
export type CheckIn = Database['public']['Tables']['checkins']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export type UserRole = 'guardian' | 'dependent';
export type CheckInStatus = 'completed' | 'missed' | 'help_requested';
export type SubscriptionTier = 'free' | 'premium' | 'family';
export type RelationshipStatus = 'pending' | 'active' | 'removed';
