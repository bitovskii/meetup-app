import { NextRequest, NextResponse } from 'next/server';
import { authTokenService } from '@/lib/auth-token-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Get raw token data from service
    const tokenData = await authTokenService.get(token);

    return NextResponse.json({
      success: true,
      debug: {
        tokenExists: !!tokenData,
        tokenData: tokenData,
        status: tokenData?.status,
        hasUserData: !!tokenData?.user_data,
        userData: tokenData?.user_data,
        hasSessionToken: tokenData?.user_data ? 'sessionToken' in tokenData.user_data : false,
        sessionToken: tokenData?.user_data?.sessionToken || null,
        expiresAt: tokenData?.user_data?.expiresAt || null
      }
    });

  } catch (error) {
    console.error('Debug token error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}