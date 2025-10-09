import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Handle GET requests (redirect method)
export async function GET(request: NextRequest) {
  try {
    console.log('=== VERCEL ENVIRONMENT DEBUG ===');
    console.log('BOT_TOKEN exists:', !!BOT_TOKEN);
    console.log('BOT_TOKEN starts with:', BOT_TOKEN?.substring(0, 10) + '...');
    console.log('Expected to start with: 7803153298...');
    
    if (!BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN is not set');
      return NextResponse.redirect(new URL('/auth?error=config', request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const authData: TelegramAuthData = {
      id: parseInt(searchParams.get('id') || '0'),
      first_name: searchParams.get('first_name') || '',
      last_name: searchParams.get('last_name') || undefined,
      username: searchParams.get('username') || undefined,
      photo_url: searchParams.get('photo_url') || undefined,
      auth_date: parseInt(searchParams.get('auth_date') || '0'),
      hash: searchParams.get('hash') || ''
    };

    console.log('Telegram auth data received:', authData);
    
    // Verify Telegram authentication data
    const isValid = verifyTelegramAuthData(authData, BOT_TOKEN);
    
    if (isValid) {
      console.log('Telegram user authenticated:', {
        id: authData.id,
        name: `${authData.first_name} ${authData.last_name || ''}`.trim(),
        username: authData.username
      });

      // Create success URL with user data
      const successUrl = new URL('/auth', request.url);
      successUrl.searchParams.set('telegram_auth', 'success');
      successUrl.searchParams.set('user_data', JSON.stringify(authData));
      
      return NextResponse.redirect(successUrl);
    } else {
      console.error('Invalid Telegram auth data');
      return NextResponse.redirect(new URL('/auth?error=invalid', request.url));
    }
  } catch (error: unknown) {
    console.error('Telegram auth verification error:', error);
    return NextResponse.redirect(new URL('/auth?error=verification', request.url));
  }
}

// Handle POST requests (callback method - keeping for backward compatibility)
export async function POST(request: NextRequest) {
  try {
    console.log('=== VERCEL ENVIRONMENT DEBUG (POST) ===');
    console.log('BOT_TOKEN exists:', !!BOT_TOKEN);
    console.log('BOT_TOKEN starts with:', BOT_TOKEN?.substring(0, 10) + '...');
    console.log('Expected to start with: 7803153298...');
    
    if (!BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN is not set');
      return NextResponse.json({ 
        isValid: false, 
        error: 'Server configuration error' 
      }, { status: 500 });
    }

    const authData = await request.json() as TelegramAuthData;
    
    // Verify Telegram authentication data
    const isValid = verifyTelegramAuthData(authData, BOT_TOKEN);
    
    if (isValid) {
      // Optional: Store user data in your database here
      console.log('Telegram user authenticated:', {
        id: authData.id,
        name: `${authData.first_name} ${authData.last_name || ''}`.trim(),
        username: authData.username
      });
    }
    
    return NextResponse.json({ isValid });
  } catch (error: unknown) {
    console.error('Telegram auth verification error:', error);
    return NextResponse.json({ 
      isValid: false, 
      error: 'Verification failed' 
    }, { status: 400 });
  }
}

function verifyTelegramAuthData(authData: TelegramAuthData, botToken: string): boolean {
  try {
    const { hash, ...data } = authData;
    
    if (!hash) {
      return false;
    }

    // Create data check string
    const dataCheckString = Object.keys(data)
      .sort((a, b) => a.localeCompare(b))
      .map(key => `${key}=${data[key as keyof typeof data]}`)
      .join('\n');
    
    // Create secret key using SHA256
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Verify hash matches
    const isHashValid = calculatedHash === hash;
    
    // Check auth_date (should be within last 24 hours for security)
    const authDate = data.auth_date;
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = currentTime - authDate;
    const isTimeValid = timeDiff < 86400; // 24 hours in seconds
    
    return isHashValid && isTimeValid;
  } catch (error) {
    console.error('Error verifying Telegram auth data:', error);
    return false;
  }
}