import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateAuthToken, generateTelegramDeepLink, getTokenExpiration } from '@/lib/auth-utils';
import type { AuthTokenResponse } from '@/types';

export async function POST(): Promise<NextResponse<AuthTokenResponse>> {
  try {
    // Generate secure token
    const token = generateAuthToken();
    const expiresAt = getTokenExpiration();

    // Store token in database
    const { data, error } = await supabase
      .from('auth_tokens')
      .insert({
        token,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        user_data: null,
        telegram_user_id: null
      })
      .select('token, expires_at')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to generate auth token' },
        { status: 500 }
      );
    }

    // Generate deep link
    const deepLink = generateTelegramDeepLink(token);

    return NextResponse.json({
      success: true,
      data: {
        token: data.token,
        deepLink: deepLink,
        expiresAt: data.expires_at
      }
    });

  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}