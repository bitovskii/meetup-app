import { createClient } from '@supabase/supabase-js';

// Provide fallback values to prevent deployment errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Client for public operations (no RLS bypass)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
