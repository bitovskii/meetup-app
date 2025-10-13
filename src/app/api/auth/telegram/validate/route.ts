import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isValidTokenFormat } from '@/lib/auth-utils';
import type { AuthValidationResponse } from '@/types';

// GET request for polling token status
export async function GET(request: NextRequest): Promise<NextResponse<AuthValidationResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || !isValidTokenFormat(token)) {
      return NextResponse.json(
        { success: false, error: 'Invalid token format' },
        { status: 400 }
      );
    }

    // Find token in database
    const { data: tokenData, error: tokenError } = await supabase
      .from('auth_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { success: false, error: 'Token not found' },
        { status: 404 }
      );
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      // Mark token as expired
      await supabase
        .from('auth_tokens')
        .update({ status: 'expired' })
        .eq('token', token);

      return NextResponse.json(
        { success: false, error: 'Token has expired' },
        { status: 401 }
      );
    }

    // Check token status
    if (tokenData.status === 'success' && tokenData.user_data) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'success',
          user: tokenData.user_data
        }
      });
    }

    if (tokenData.status === 'failed') {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Token is still pending
    return NextResponse.json({
      success: true,
      data: {
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST request for webhook to update token with user data
export async function POST(request: NextRequest): Promise<NextResponse<AuthValidationResponse>> {
  try {
    const body = await request.json();
    const { token, user_data } = body;

    // Validate input
    if (!token || !isValidTokenFormat(token)) {
      return NextResponse.json(
        { success: false, error: 'Invalid token format' },
        { status: 400 }
      );
    }

    if (!user_data?.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid user data' },
        { status: 400 }
      );
    }

    // Find and update token
    const { data: tokenData, error: tokenError } = await supabase
      .from('auth_tokens')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { success: false, error: 'Invalid or already used token' },
        { status: 404 }
      );
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Token has expired' },
        { status: 401 }
      );
    }

    // Update token with user data
    const { error: updateError } = await supabase
      .from('auth_tokens')
      .update({
        status: 'success',
        user_data: user_data,
        telegram_user_id: user_data.id
      })
      .eq('token', token);

    if (updateError) {
      console.error('Token update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to process authentication' },
        { status: 500 }
      );
    }

    // Optionally store/update user session
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .upsert({
        telegram_user_id: user_data.id,
        user_data: user_data
      }, {
        onConflict: 'telegram_user_id'
      });

    if (sessionError) {
      console.warn('Session update error:', sessionError);
      // Don't fail the request if session update fails
    }

    return NextResponse.json({
      success: true,
      data: {
        status: 'success',
        user: user_data
      }
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}