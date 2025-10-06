import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a safe client that works even without environment variables during build
const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

export { supabase }

// Types for our database tables
export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  place: string
  members: number
  image: string
  created_at: string
  updated_at: string
}

export interface Group {
  id: string
  name: string
  description: string
  category: string
  location: string
  members: number
  image: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar_url?: string
  bio?: string
  interests?: string[]
  visited_events?: string[]
  joined_groups?: string[]
  created_at: string
  updated_at: string
}