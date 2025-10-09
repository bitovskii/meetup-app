import { NextRequest, NextResponse } from 'next/server';
import { updateAuthSession } from '@/utils/authSessions';

export async function POST(request: NextRequest) {
  try {
    const { action, token, userData } = await request.json();
    
    console.log('Local test simulation:', { action, token, userData });
    
    if (action === 'authorize' && token && userData) {
      const success = updateAuthSession(token, {
        status: 'authorized',
        userId: userData.id,
        userData: userData,
      });
      
      return NextResponse.json({ 
        success, 
        message: success ? 'Authorization simulated successfully' : 'Failed to authorize'
      });
    }
    
    if (action === 'cancel' && token) {
      updateAuthSession(token, { status: 'cancelled' });
      return NextResponse.json({ success: true, message: 'Authorization cancelled' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}