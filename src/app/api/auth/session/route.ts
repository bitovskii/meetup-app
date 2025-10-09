import { NextRequest, NextResponse } from 'next/server';
import { createAuthSession } from '@/utils/authSessions';

export async function POST() {
  try {
    const session = createAuthSession();
    
    return NextResponse.json({
      token: session.token,
      status: session.status,
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating auth session:', error);
    return NextResponse.json(
      { error: 'Failed to create auth session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const { getAuthSession, createOrUpdateAuthSession } = await import('@/utils/authSessions');
    let session = getAuthSession(token);
    
    // If session doesn't exist, check if this is a valid token format and create a pending session
    if (!session && token.length === 64) {
      // Create a temporary pending session for valid tokens
      const tempSession = {
        token,
        status: 'pending' as const,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };
      
      createOrUpdateAuthSession(token, tempSession);
      session = tempSession;
    }
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: session.status,
      userData: session.userData,
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error getting auth session:', error);
    return NextResponse.json(
      { error: 'Failed to get auth session' },
      { status: 500 }
    );
  }
}