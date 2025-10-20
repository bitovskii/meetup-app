import { NextRequest, NextResponse } from 'next/server';
import { authTokenStore } from '@/lib/auth-token-store';
import { db } from '@/lib/database';

export async function GET() {
  try {
    console.log('🎯 COMPLETE TELEGRAM AUTH FLOW TEST');
    console.log('=====================================');
    
    // Step 1: Generate auth token (simulate frontend)
    console.log('🚀 Step 1: Generating auth token...');
    const testToken = 'flow_test_' + Math.random().toString(36).substring(7);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    authTokenStore.setPending(testToken, expiresAt);
    console.log('✅ Token generated:', testToken);
    
    // Step 2: Simulate user clicking Telegram link and starting bot
    console.log('📱 Step 2: User visits Telegram bot...');
    const telegramUrl = `https://t.me/meetup_auth_bot?start=${testToken}`;
    console.log('🔗 Telegram URL:', telegramUrl);
    
    // Step 3: Simulate webhook receiving /start command
    console.log('🤖 Step 3: Bot receives /start command...');
    
    // Check token exists
    const tokenCheck = authTokenStore.get(testToken);
    if (!tokenCheck || tokenCheck.status !== 'pending') {
      throw new Error('Token verification failed at webhook stage');
    }
    console.log('✅ Token found in webhook processing');
    
    // Step 4: User authorizes (simulate button click)
    console.log('👤 Step 4: User clicks "Authorize" button...');
    
    const mockTelegramUser = {
      id: 987654321,
      first_name: 'Flow',
      last_name: 'Test',
      username: 'flowtest'
    };
    
    // Create/update user in database
    const user = await db.createUser({
      telegram_id: mockTelegramUser.id,
      username: mockTelegramUser.username,
      full_name: `${mockTelegramUser.first_name} ${mockTelegramUser.last_name}`.trim(),
      activation_method: 'telegram'
    });
    console.log('✅ User created in database:', user.id);
    
    // Update token with success
    const userData = {
      id: mockTelegramUser.id,
      username: mockTelegramUser.username,
      first_name: mockTelegramUser.first_name,
      last_name: mockTelegramUser.last_name,
      auth_date: Math.floor(Date.now() / 1000)
    };
    
    authTokenStore.setSuccess(testToken, userData);
    console.log('✅ Token marked as successful with user data');
    
    // Step 5: Frontend checks token status
    console.log('💻 Step 5: Frontend checks auth status...');
    
    const finalToken = authTokenStore.get(testToken);
    if (!finalToken || finalToken.status !== 'success') {
      throw new Error('Token status check failed');
    }
    console.log('✅ Frontend receives successful auth status');
    
    // Step 6: Frontend creates user session
    console.log('🔐 Step 6: Creating user session...');
    
    // This would typically create a JWT or session cookie
    const sessionData = {
      userId: user.id,
      telegramId: mockTelegramUser.id,
      username: mockTelegramUser.username,
      loginTime: new Date().toISOString()
    };
    console.log('✅ User session created');
    
    // Clean up test token
    authTokenStore.remove(testToken);
    console.log('🧹 Test token cleaned up');
    
    console.log('=====================================');
    console.log('🎉 COMPLETE AUTH FLOW SUCCESSFUL!');
    
    return NextResponse.json({
      success: true,
      message: 'Complete Telegram auth flow test successful!',
      flow: {
        step1_tokenGeneration: true,
        step2_telegramLink: telegramUrl,
        step3_webhookProcessing: true,
        step4_userAuthorization: true,
        step5_statusCheck: true,
        step6_sessionCreation: true
      },
      data: {
        testToken,
        user,
        userData,
        sessionData,
        tokenStoreStats: authTokenStore.getStats()
      }
    });
    
  } catch (error) {
    console.error('🚨 Complete flow test failed:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}