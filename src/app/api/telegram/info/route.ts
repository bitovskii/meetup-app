import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      return NextResponse.json({
        error: 'TELEGRAM_BOT_TOKEN not configured'
      }, { status: 500 });
    }

    // Get webhook info
    const webhookResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const webhookData = await webhookResponse.json();

    // Get bot info
    const botResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const botData = await botResponse.json();

    return NextResponse.json({
      bot: botData.result,
      webhook: webhookData.result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get bot info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}