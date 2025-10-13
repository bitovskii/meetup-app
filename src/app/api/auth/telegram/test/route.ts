import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface TestResult {
  name: string;
  status: string;
  error?: Error | string;
  data?: Record<string, unknown>;
}

export async function GET(): Promise<NextResponse> {
  try {
    // Test database connection and table creation
    const tests: TestResult[] = [];

    // Test 1: Database connection
    tests.push({
      name: 'Database Connection',
      status: 'testing...'
    });

    const { error: connectionError } = await supabase
      .from('auth_tokens')
      .select('id')
      .limit(1);

    if (connectionError) {
      tests[0].status = `❌ Failed: ${connectionError.message}`;
      tests[0].error = connectionError;
    } else {
      tests[0].status = '✅ Connected successfully';
    }

    // Test 2: Create a test token
    tests.push({
      name: 'Token Creation',
      status: 'testing...'
    });

    const testToken = 'test_' + Math.random().toString(36).substring(7);
    const { data: insertData, error: insertError } = await supabase
      .from('auth_tokens')
      .insert({
        token: testToken,
        status: 'pending',
        expires_at: new Date(Date.now() + 60000).toISOString(), // 1 minute
        user_data: null,
        telegram_user_id: null
      })
      .select()
      .single();

    if (insertError) {
      tests[1].status = `❌ Failed: ${insertError.message}`;
      tests[1].error = insertError;
    } else {
      tests[1].status = '✅ Token created successfully';
      tests[1].data = insertData;
    }

    // Test 3: Read the token back
    tests.push({
      name: 'Token Retrieval',
      status: 'testing...'
    });

    if (!insertError) {
      const { data: selectData, error: selectError } = await supabase
        .from('auth_tokens')
        .select('*')
        .eq('token', testToken)
        .single();

      if (selectError) {
        tests[2].status = `❌ Failed: ${selectError.message}`;
        tests[2].error = selectError;
      } else {
        tests[2].status = '✅ Token retrieved successfully';
        tests[2].data = selectData;
      }

      // Clean up test token
      await supabase
        .from('auth_tokens')
        .delete()
        .eq('token', testToken);
    } else {
      tests[2].status = '⏭️ Skipped due to creation failure';
    }

    // Test 4: Environment variables
    tests.push({
      name: 'Environment Variables',
      status: process.env.NEXT_PUBLIC_SUPABASE_URL && 
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
              process.env.TELEGRAM_BOT_TOKEN &&
              process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
        ? '✅ All required variables present'
        : '❌ Missing required environment variables',
      data: {
        supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        telegram_token: !!process.env.TELEGRAM_BOT_TOKEN,
        telegram_username: !!process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
      }
    });

    const allPassed = tests.every(test => test.status.includes('✅'));

    return NextResponse.json({
      success: allPassed,
      message: allPassed ? 'All tests passed! 🎉' : 'Some tests failed ❌',
      tests,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}