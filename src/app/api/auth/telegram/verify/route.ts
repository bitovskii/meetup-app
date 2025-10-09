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

// ENVIRONMENT DEBUG - Log all environment variables
console.log('=== VERCEL ENVIRONMENT DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('TELEGRAM_BOT_TOKEN exists:', !!process.env.TELEGRAM_BOT_TOKEN);
console.log('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME:', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME);
console.log('NEXT_PUBLIC_APP_DOMAIN:', process.env.NEXT_PUBLIC_APP_DOMAIN);
console.log('Expected domain: https://meetup-app-theta-steel.vercel.app');
console.log('Domain match:', process.env.NEXT_PUBLIC_APP_DOMAIN === 'https://meetup-app-theta-steel.vercel.app');
console.log('=== END ENVIRONMENT DEBUG ===');

// Add CORS headers for debugging
function addCORSHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// Handle GET requests (redirect method)
export async function GET(request: NextRequest) {
  try {
    console.log('Incoming GET request:', {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      query: Object.fromEntries(request.nextUrl.searchParams.entries()),
    });

    if (!BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN is not set');
      return addCORSHeaders(
        NextResponse.redirect(new URL('/auth?error=config', request.url))
      );
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
    console.log('Auth data validity:', isValid);

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
      
      return addCORSHeaders(NextResponse.redirect(successUrl));
    } else {
      console.error('Invalid Telegram auth data');
      return addCORSHeaders(
        NextResponse.redirect(new URL('/auth?error=invalid', request.url))
      );
    }
  } catch (error: unknown) {
    console.error('Telegram auth verification error:', error);
    return addCORSHeaders(
      NextResponse.redirect(new URL('/auth?error=verification', request.url))
    );
  }
}

// Handle POST requests (callback method - keeping for backward compatibility)
export async function POST(request: NextRequest) {
  try {
    console.log('Incoming POST request:', {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    });

    if (!BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN is not set');
      return addCORSHeaders(
        NextResponse.json({ isValid: false, error: 'Server configuration error' }, { status: 500 })
      );
    }

    const authData = await request.json() as TelegramAuthData;
    console.log('Telegram auth data received (POST):', authData);

    const isValid = verifyTelegramAuthData(authData, BOT_TOKEN);
    console.log('Auth data validity (POST):', isValid);

    if (isValid) {
      console.log('Telegram user authenticated (POST):', {
        id: authData.id,
        name: `${authData.first_name} ${authData.last_name || ''}`.trim(),
        username: authData.username
      });
    }

    return addCORSHeaders(NextResponse.json({ isValid }));
  } catch (error: unknown) {
    console.error('Telegram auth verification error (POST):', error);
    return addCORSHeaders(
      NextResponse.json({ isValid: false, error: 'Verification failed' }, { status: 400 })
    );
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