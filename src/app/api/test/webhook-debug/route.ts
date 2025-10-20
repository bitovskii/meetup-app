import { NextRequest, NextResponse } from 'next/server';
import { authTokenStore } from '@/lib/auth-token-store';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, skipTelegramAPI = true } = body;
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }
    
    console.log('🔍 Testing webhook logic for token:', token);
    
    // Step 1: Check if token exists in token store
    console.log('📝 Step 1: Looking up token in store');
    const tokenData = authTokenStore.get(token);
    
    if (!tokenData || tokenData.status !== 'pending') {
      console.log('❌ Token not found or not pending');
      return NextResponse.json({
        success: false,
        step: 'token_lookup',
        error: 'Token not found or not pending',
        tokenData: tokenData || null,
        stats: authTokenStore.getStats()
      });
    }
    
    console.log('✅ Token found and is pending');
    
    // Step 2: Create mock user data
    console.log('👤 Step 2: Creating mock user data');
    const mockUser = {
      id: 123456789,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser'
    };
    
    // Step 3: Test user creation in database
    console.log('🏗️ Step 3: Testing user creation');
    let userResult = null;
    let userError = null;
    
    try {
      const user = await db.createUser({
        telegram_id: mockUser.id,
        username: mockUser.username,
        full_name: `${mockUser.first_name} ${mockUser.last_name || ''}`.trim(),
        activation_method: 'telegram'
      });
      console.log('✅ User created successfully:', user);
      userResult = user;
    } catch (error) {
      console.error('❌ User creation failed:', error);
      userError = error instanceof Error ? error.message : String(error);
    }
    
    // Step 4: Update token with success (simulate authorization)
    if (userResult) {
      console.log('✨ Step 4: Marking token as successful');
      const userData = {
        id: mockUser.id,
        username: mockUser.username,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        auth_date: Math.floor(Date.now() / 1000)
      };
      
      authTokenStore.setSuccess(token, userData);
      console.log('✅ Token marked as successful');
    }
    
    // Step 5: Verify final token state
    const finalTokenData = authTokenStore.get(token);
    
    return NextResponse.json({
      success: true,
      steps: {
        tokenLookup: !!tokenData,
        userCreation: !!userResult,
        tokenUpdate: finalTokenData?.status === 'success'
      },
      data: {
        tokenData: finalTokenData,
        userResult,
        userError,
        stats: authTokenStore.getStats()
      }
    });
    
  } catch (error) {
    console.error('🚨 Webhook test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}