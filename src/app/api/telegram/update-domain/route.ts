/**
 * API route to automatically update Telegram bot domain
 * Call this after deployment to sync domain with BotFather
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }
    
    // Use Telegram Bot API to set webhook domain
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: `https://${domain}/api/telegram/webhook`,
        allowed_updates: ['message']
      })
    });
    
    const result = await response.json();
    
    if (result.ok) {
      return NextResponse.json({ 
        success: true, 
        message: `Bot domain updated to ${domain}`,
        domain 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to update bot domain',
        details: result 
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error 
    }, { status: 500 });
  }
}