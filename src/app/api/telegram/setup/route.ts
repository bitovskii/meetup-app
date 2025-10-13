import { NextRequest, NextResponse } from 'next/server';
import { setWebhook, setBotCommands, getBotInfo } from '@/lib/telegram-bot';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { action, webhookUrl } = await request.json();

    switch (action) {
      case 'setWebhook':
        if (!webhookUrl) {
          return NextResponse.json(
            { success: false, error: 'Webhook URL is required' },
            { status: 400 }
          );
        }

        const webhookResult = await setWebhook(webhookUrl);
        if (webhookResult) {
          return NextResponse.json({
            success: true,
            message: 'Webhook set successfully',
            webhookUrl
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'Failed to set webhook' },
            { status: 500 }
          );
        }

      case 'setCommands':
        const commandsResult = await setBotCommands();
        if (commandsResult) {
          return NextResponse.json({
            success: true,
            message: 'Bot commands set successfully'
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'Failed to set bot commands' },
            { status: 500 }
          );
        }

      case 'getBotInfo':
        const botInfo = await getBotInfo();
        if (botInfo) {
          return NextResponse.json({
            success: true,
            botInfo
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'Failed to get bot info' },
            { status: 500 }
          );
        }

      case 'setup':
        // Complete bot setup
        const setupWebhookUrl = webhookUrl || `${process.env.NEXT_PUBLIC_APP_DOMAIN}/api/telegram/webhook`;
        
        // Get bot info first
        const info = await getBotInfo();
        if (!info) {
          return NextResponse.json(
            { success: false, error: 'Failed to connect to bot. Check TELEGRAM_BOT_TOKEN.' },
            { status: 500 }
          );
        }

        // Set webhook
        const webhookSetup = await setWebhook(setupWebhookUrl);
        if (!webhookSetup) {
          return NextResponse.json(
            { success: false, error: 'Failed to set webhook' },
            { status: 500 }
          );
        }

        // Set commands
        const commandsSetup = await setBotCommands();
        if (!commandsSetup) {
          console.warn('Failed to set bot commands, but continuing...');
        }

        return NextResponse.json({
          success: true,
          message: 'Bot setup completed successfully',
          botInfo: info,
          webhookUrl: setupWebhookUrl,
          commandsSet: commandsSetup
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Bot setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}