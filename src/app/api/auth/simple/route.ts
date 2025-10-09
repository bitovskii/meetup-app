import { NextRequest, NextResponse } from 'next/server';

// Simple external storage simulation using a Set to track authorized tokens
const authorizedTokens = new Set<string>();
const userDataStore = new Map<string, {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, userData } = body;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }
    
    // Mark token as authorized
    authorizedTokens.add(token);
    if (userData) {
      userDataStore.set(token, userData);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error authorizing token:', error);
    return NextResponse.json(
      { error: 'Failed to authorize token' },
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
    
    const isAuthorized = authorizedTokens.has(token);
    const userData = userDataStore.get(token);
    
    return NextResponse.json({
      status: isAuthorized ? 'authorized' : 'pending',
      userData: userData || null
    });
  } catch (error) {
    console.error('Error checking authorization:', error);
    return NextResponse.json(
      { error: 'Failed to check authorization' },
      { status: 500 }
    );
  }
}