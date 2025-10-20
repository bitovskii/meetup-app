import { NextRequest, NextResponse } from 'next/server';
import { authTokenService } from '@/lib/auth-token-service';

export async function GET() {
  try {
    console.log('🔍 PRODUCTION DEBUG: Testing live auth flow');
    
    // Test 1: Check environment variables
    const envCheck = {
      TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
      NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
      NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN,
      NODE_ENV: process.env.NODE_ENV
    };
    
    // Test 2: Check token service functionality
    const testToken = 'prod_test_' + Date.now();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    await authTokenService.setPending(testToken, expiresAt);
    const tokenCheck = await authTokenService.get(testToken);
    const tokenServiceWorking = !!tokenCheck && tokenCheck.status === 'pending';
    
    // Test 3: Check token service stats
    const stats = await authTokenService.getStats();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      tokenService: {
        working: tokenServiceWorking,
        stats: stats
      },
      debug: {
        testToken,
        tokenFound: !!tokenCheck,
        tokenStatus: tokenCheck?.status
      }
    });
    
  } catch (error) {
    console.error('🚨 Production debug failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, token } = body;
    
    if (action === 'check_token' && token) {
      console.log('🔍 Checking token in production:', token);
      
      const tokenData = await authTokenService.get(token);
      
      return NextResponse.json({
        success: true,
        token,
        found: !!tokenData,
        data: tokenData ? {
          status: tokenData.status,
          expiresAt: tokenData.expires_at,
          isExpired: new Date() > new Date(tokenData.expires_at),
          userData: tokenData.user_data
        } : null,
        stats: await authTokenService.getStats()
      });
    }
    
    if (action === 'generate_test_token') {
      console.log('🎯 Generating test token in production');
      
      const testToken = 'live_test_' + Math.random().toString(36).substring(7);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      await authTokenService.setPending(testToken, expiresAt);
      
      return NextResponse.json({
        success: true,
        testToken,
        telegramUrl: `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?start=${testToken}`,
        expiresAt
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('🚨 Production debug POST failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}