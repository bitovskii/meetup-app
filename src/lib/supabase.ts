import { createClient } from '@supabase/supabase-js';
import type { DatabaseEvent, DatabaseGroup } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database type aliases
export type EventInsert = Omit<DatabaseEvent, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type EventUpdate = Partial<Omit<DatabaseEvent, 'id' | 'created_at' | 'updated_at'>>;

export type GroupInsert = Omit<DatabaseGroup, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type GroupUpdate = Partial<Omit<DatabaseGroup, 'id' | 'created_at' | 'updated_at'>>;

// Database type definitions
export interface Database {
  public: {
    Tables: {
      events: {
        Row: DatabaseEvent;
        Insert: EventInsert;
        Update: EventUpdate;
      };
      groups: {
        Row: DatabaseGroup;
        Insert: GroupInsert;
        Update: GroupUpdate;
      };
    };
  };
}

// Export types for our application use
export interface AuthToken {
  id?: number;
  token: string;
  status: 'pending' | 'success' | 'expired' | 'failed';
  user_data?: Record<string, unknown>;
  telegram_user_id?: number;
  created_at?: string;
  expires_at: string;
  updated_at?: string;
}

export interface UserSession {
  id?: number;
  telegram_user_id: number;
  user_data: Record<string, unknown>;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}