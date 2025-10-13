import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a simpler, untyped client for now to avoid TypeScript issues
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export types for our application use
export interface AuthToken {
  id?: number;
  token: string;
  status: 'pending' | 'success' | 'expired' | 'failed';
  user_data?: any;
  telegram_user_id?: number;
  created_at?: string;
  expires_at: string;
  updated_at?: string;
}

export interface UserSession {
  id?: number;
  telegram_user_id: number;
  user_data: any;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}