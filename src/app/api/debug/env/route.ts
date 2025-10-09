import { NextResponse } from 'next/server';

export async function GET() {
  console.log('=== DEBUG ENDPOINT - ENVIRONMENT VARIABLES ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN);
  console.log('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME:', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME);
  console.log('NEXT_PUBLIC_APP_DOMAIN:', process.env.NEXT_PUBLIC_APP_DOMAIN);
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  // Show all environment variable keys for debugging
  const allKeys = Object.keys(process.env).sort();
  console.log('All environment variable keys:', allKeys);
  
  // Filter relevant keys
  const telegramKeys = allKeys.filter(key => key.toLowerCase().includes('telegram'));
  const botKeys = allKeys.filter(key => key.toLowerCase().includes('bot'));
  const nextPublicKeys = allKeys.filter(key => key.startsWith('NEXT_PUBLIC_'));
  
  console.log('Telegram-related keys:', telegramKeys);
  console.log('Bot-related keys:', botKeys);
  console.log('NEXT_PUBLIC keys:', nextPublicKeys);
  console.log('=== END DEBUG ENDPOINT ===');
  
  return NextResponse.json({
    message: 'Environment debug logged to console',
    nodeEnv: process.env.NODE_ENV,
    hasTelegramToken: !!process.env.TELEGRAM_BOT_TOKEN,
    hasBotUsername: !!process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
    hasAppDomain: !!process.env.NEXT_PUBLIC_APP_DOMAIN,
    telegramKeys,
    botKeys,
    nextPublicKeys
  });
}