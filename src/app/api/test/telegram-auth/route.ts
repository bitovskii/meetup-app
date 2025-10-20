import { NextRequest, NextResponse } from 'next/server';
import { authTokenStore } from '@/lib/auth-token-store';
import { db } from '@/lib/database';

export async function GET() {
  try {
    console.log('🧪 Starting Telegram Auth Flow Test');
    
    // Step 1: Generate a test token
    const testToken = 'test_' + Math.random().toString(36).substring(7);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    console.log('📝 Step 1: Generating test token');
    authTokenStore.setPending(testToken, expiresAt);
    console.log('✅ Token generated:', testToken);
    
    // Step 2: Verify token exists
    console.log('🔍 Step 2: Verifying token exists');
    const tokenData = authTokenStore.get(testToken);
    if (!tokenData) {
      throw new Error('Token not found after creation');
    }
    console.log('✅ Token found:', {
      token: tokenData.token,
      status: tokenData.status,
      expiresAt: tokenData.expiresAt
    });
    
    // Step 3: Simulate user data from Telegram
    console.log('👤 Step 3: Simulating Telegram user data');
    const mockUserData = {
      id: 123456789,
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      auth_date: Math.floor(Date.now() / 1000)
    };
    
    // Step 4: Update token with success
    console.log('✨ Step 4: Marking token as successful');
    authTokenStore.setSuccess(testToken, mockUserData);
    
    // Step 5: Verify token update
    console.log('🔍 Step 5: Verifying token was updated');
    const updatedToken = authTokenStore.get(testToken);
    if (!updatedToken || updatedToken.status !== 'success') {
      throw new Error('Token was not updated to success');
    }
    console.log('✅ Token updated:', {
      status: updatedToken.status,
      userData: updatedToken.userData
    });
    
    // Step 6: Test user creation
    console.log('👥 Step 6: Testing user creation');
    let userCreated = false;
    let userError = null;
    try {
      const user = await db.createUser({
        telegram_id: mockUserData.id,
        username: mockUserData.username,
        full_name: `${mockUserData.first_name} ${mockUserData.last_name}`.trim(),
        activation_method: 'telegram'
      });
      console.log('✅ User created successfully:', user.id);
      userCreated = true;
    } catch (error) {
      console.error('❌ User creation failed:', error);
      userError = error instanceof Error ? error.message : String(error);
    }
    
    // Step 7: Get token store stats
    console.log('📊 Step 7: Getting token store stats');
    const stats = authTokenStore.getStats();
    console.log('📈 Token store stats:', stats);
    
    // Clean up test token
    authTokenStore.remove(testToken);
    console.log('🧹 Test token cleaned up');
    
    return NextResponse.json({
      success: true,
      message: 'Telegram auth flow test completed',
      results: {
        tokenGenerated: true,
        tokenFound: !!tokenData,
        tokenUpdated: updatedToken?.status === 'success',
        userCreated,
        userError,
        tokenStoreStats: stats,
        testToken,
        mockUserData
      }
    });
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
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
    const { token } = body;
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }
    
    console.log('🔍 Testing token lookup for:', token);
    
    // Test token lookup
    const tokenData = authTokenStore.get(token);
    
    if (!tokenData) {
      console.log('❌ Token not found in store');
      return NextResponse.json({
        found: false,
        message: 'Token not found',
        stats: authTokenStore.getStats()
      });
    }
    
    console.log('✅ Token found:', {
      status: tokenData.status,
      expiresAt: tokenData.expiresAt,
      userData: tokenData.userData
    });
    
    return NextResponse.json({
      found: true,
      tokenData: {
        status: tokenData.status,
        expiresAt: tokenData.expiresAt,
        userData: tokenData.userData,
        isExpired: new Date() > tokenData.expiresAt
      },
      stats: authTokenStore.getStats()
    });
    
  } catch (error) {
    console.error('🚨 Token lookup test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}