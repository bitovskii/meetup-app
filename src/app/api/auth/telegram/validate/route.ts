import { NextRequest, NextResponse } from 'next/server';
import { authTokenStore } from '@/lib/auth-token-store';

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

    // Check token status in our store
    const tokenData = authTokenStore.get(token);

    if (!tokenData) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'expired'
        }
      });
    }

    if (tokenData.status === 'success' && tokenData.userData) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'success',
          user: tokenData.userData
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
