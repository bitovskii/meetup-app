import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
    // Show first/last 4 chars of keys for verification (security)
    urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
    anonKeyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(-4),
    serviceKeyPreview: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...' + process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(-4),
    allSupabaseKeys: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
  });
}