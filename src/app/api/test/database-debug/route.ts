import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    console.log('🧪 Testing database connection and user creation');
    
    // Test 1: Try to create a user
    console.log('📝 Test 1: Creating test user');
    
    const testUserData = {
      telegram_id: 999999999,
      username: 'test_db_user',
      full_name: 'Database Test User',
      activation_method: 'telegram'
    };
    
    let createResult = null;
    let createError = null;
    
    try {
      createResult = await db.createUser(testUserData);
      console.log('✅ User creation successful:', createResult);
    } catch (error) {
      console.error('❌ User creation failed:', error);
      createError = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown',
        cause: error instanceof Error ? error.cause : undefined
      };
    }
    
    // Test 2: Try to get a user by telegram ID (if creation succeeded)
    let getResult = null;
    let getError = null;
    
    if (createResult) {
      console.log('📖 Test 2: Getting user by telegram ID');
      try {
        const { data, error } = await db.getUserByTelegramId(999999999);
        if (error) {
          getError = error;
        } else {
          getResult = data;
          console.log('✅ User retrieval successful:', data);
        }
      } catch (error) {
        console.error('❌ User retrieval failed:', error);
        getError = {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      tests: {
        userCreation: {
          success: !!createResult,
          result: createResult,
          error: createError
        },
        userRetrieval: {
          success: !!getResult,
          result: getResult,
          error: getError
        }
      }
    });
    
  } catch (error) {
    console.error('🚨 Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      }
    }, { status: 500 });
  }
}