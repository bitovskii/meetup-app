import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN;

export async function GET() {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    console.log('🔍 Checking current webhook configuration...');
    
    // Get current webhook info
    const webhookInfoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const webhookInfo = await webhookInfoResponse.json();
    
    console.log('📋 Current webhook info:', webhookInfo);
    
    const expectedWebhookUrl = `${APP_DOMAIN}/api/telegram/webhook`;
    const currentWebhookUrl = webhookInfo.result?.url || 'Not set';
    
    return NextResponse.json({
      success: true,
      botToken: BOT_TOKEN ? 'Set' : 'Not set',
      appDomain: APP_DOMAIN,
      webhook: {
        current: currentWebhookUrl,
        expected: expectedWebhookUrl,
        isCorrect: currentWebhookUrl === expectedWebhookUrl,
        info: webhookInfo.result
      }
    });
    
  } catch (error) {
    console.error('🚨 Webhook check failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { action } = body;
    
    if (action === 'update') {
      console.log('🔄 Updating webhook URL...');
      
      const webhookUrl = `${APP_DOMAIN}/api/telegram/webhook`;
      
      // Set webhook
      const setWebhookResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query']
        })
      });
      
      const setWebhookResult = await setWebhookResponse.json();
      console.log('📡 Set webhook result:', setWebhookResult);
      
      return NextResponse.json({
        success: setWebhookResult.ok,
        message: setWebhookResult.description,
        webhookUrl,
        result: setWebhookResult
      });
      
    } else if (action === 'delete') {
      console.log('🗑️ Deleting webhook...');
      
      const deleteWebhookResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`, {
        method: 'POST'
      });
      
      const deleteWebhookResult = await deleteWebhookResponse.json();
      console.log('🗑️ Delete webhook result:', deleteWebhookResult);
      
      return NextResponse.json({
        success: deleteWebhookResult.ok,
        message: deleteWebhookResult.description,
        result: deleteWebhookResult
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('🚨 Webhook operation failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}