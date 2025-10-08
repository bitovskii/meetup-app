import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(request: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN is not set');
      return NextResponse.json({ 
        isValid: false, 
        error: 'Server configuration error' 
      }, { status: 500 });
    }

    const authData = await request.json();
    
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
  } catch (error) {
    console.error('Telegram auth verification error:', error);
    return NextResponse.json({ 
      isValid: false, 
      error: 'Verification failed' 
    }, { status: 400 });
  }
}

function verifyTelegramAuthData(authData: any, botToken: string): boolean {
  try {
    const { hash, ...data } = authData;
    
    if (!hash) {
      return false;
    }

    // Create data check string
    const dataCheckString = Object.keys(data)
      .sort((a, b) => a.localeCompare(b))
      .map(key => `${key}=${data[key]}`)
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
    const authDate = parseInt(data.auth_date);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = currentTime - authDate;
    const isTimeValid = timeDiff < 86400; // 24 hours in seconds
    
    return isHashValid && isTimeValid;
  } catch (error) {
    console.error('Error verifying Telegram auth data:', error);
    return false;
  }
}