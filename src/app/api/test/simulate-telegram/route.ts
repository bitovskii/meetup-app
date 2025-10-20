import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }
    
    console.log('🤖 Simulating Telegram /start command with token:', token);
    
    // Simulate the exact webhook payload that Telegram would send
    const telegramWebhookPayload = {
      message: {
        from: {
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser'
        },
        text: `/start ${token}`
      }
    };
    
    console.log('📡 Sending simulated webhook payload to telegram webhook');
    
    // Call our webhook endpoint with the simulated payload
    const webhookResponse = await fetch('http://localhost:3000/api/telegram/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telegramWebhookPayload)
    });
    
    const webhookResult = await webhookResponse.json();
    
    console.log('📨 Webhook response:', webhookResult);
    
    return NextResponse.json({
      success: true,
      message: 'Simulated Telegram /start command',
      webhook: {
        status: webhookResponse.status,
        response: webhookResult
      },
      payload: telegramWebhookPayload
    });
    
  } catch (error) {
    console.error('🚨 Telegram simulation failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}