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

    // Check token status in our service
    const tokenData = await authTokenService.get(token);

    if (!tokenData) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'expired'
        }
      });
    }

    if (tokenData.status === 'success' && tokenData.user_data) {
      console.log('🔍 VALIDATION: Returning user data:', {
        hasUserData: !!tokenData.user_data,
        hasSessionToken: !!(tokenData.user_data as any).sessionToken,
        userData: tokenData.user_data
      });
      
      return NextResponse.json({
        success: true,
        data: {
          status: 'success',
          user: tokenData.user_data
        }
      });
    }

    // Token exists but is still pending
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
