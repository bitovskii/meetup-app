import { NextRequest, NextResponse } from 'next/server';
import { authenticateTelegramUser } from '@/lib/auth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  try {
    // Mock Telegram user data for testing
    const testTelegramData = {
      id: 123456789,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      photo_url: 'https://example.com/avatar.jpg',
      auth_date: Math.floor(Date.now() / 1000)
    };

    console.log('Testing Telegram auth with mock data:', testTelegramData);

    try {
      // Test user creation and session
      const { user, sessionToken, expiresAt } = await authenticateTelegramUser(testTelegramData);
      
      console.log('Auth test successful:', { userId: user.id, sessionToken });

      return NextResponse.json({
        success: true,
        message: 'Telegram authentication test successful',
        user: {
          id: user.id,
          telegram_id: user.telegram_id,
          username: user.username,
          full_name: user.full_name,
          avatar_url: user.avatar_url
        },
        sessionToken,
        expiresAt: expiresAt.toISOString()
      });
    } catch (authError) {
      console.error('Auth test error:', authError);
      return NextResponse.json({
        success: false,
        error: `Authentication failed: ${authError instanceof Error ? authError.message : 'Unknown error'}`
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}