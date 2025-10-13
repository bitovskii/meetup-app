import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isValidTokenFormat } from '@/lib/auth-utils';
import { sendTelegramMessage } from '@/lib/telegram-bot';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Basic Telegram webhook validation
    if (!body.message?.from || !body.message?.text) {
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    const user = message.from;
    const text = message.text;
    const chatId = message.chat.id;

    // Check if this is a /start command
    if (!text.startsWith('/start')) {
      // Handle other commands or provide help
      if (text === '/help') {
        await sendTelegramMessage({
          chat_id: chatId,
          text: `🤖 <b>Meetup Authentication Bot</b>\n\n` +
                `This bot helps you authenticate with the Meetup app.\n\n` +
                `To get started, visit our website and click "Continue with Telegram" to generate your authentication link.\n\n` +
                `<a href="${process.env.NEXT_PUBLIC_APP_DOMAIN || 'http://localhost:3001'}">🌐 Visit Meetup App</a>`,
          parse_mode: 'HTML'
        });
      }
      return NextResponse.json({ ok: true });
    }

    // Handle /start command
    const commandParts = text.split(' ');
    
    // /start without token - show welcome message
    if (commandParts.length < 2) {
      await sendTelegramMessage({
        chat_id: chatId,
        text: `👋 <b>Welcome to Meetup!</b>\n\n` +
              `Hi ${user.first_name}! To authenticate with our app, please:\n\n` +
              `1. Visit our website\n` +
              `2. Click "Continue with Telegram"\n` +
              `3. You'll be redirected back here with an authentication link\n\n` +
              `<a href="${process.env.NEXT_PUBLIC_APP_DOMAIN || 'http://localhost:3001'}">🌐 Visit Meetup App</a>`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🌐 Open Meetup App',
              url: process.env.NEXT_PUBLIC_APP_DOMAIN || 'http://localhost:3001'
            }
          ]]
        }
      });
      return NextResponse.json({ ok: true });
    }

    // /start with token - authenticate user
    const token = commandParts[1].trim();
    
    if (!isValidTokenFormat(token)) {
      return NextResponse.json({ ok: true });
    }

    // Find the token in database
    const { data: tokenData, error } = await supabase
      .from('auth_tokens')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (error || !tokenData) {
      return NextResponse.json({ ok: true });
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      await supabase
        .from('auth_tokens')
        .update({ status: 'expired' })
        .eq('token', token);
      
      await sendTelegramMessage({
        chat_id: chatId,
        text: `⏰ <b>Authentication Token Expired</b>\n\n` +
              `This authentication link has expired. Please generate a new one from our website.\n\n` +
              `<a href="${process.env.NEXT_PUBLIC_APP_DOMAIN || 'http://localhost:3001'}/auth">🔗 Get New Authentication Link</a>`,
        parse_mode: 'HTML'
      });
      
      return NextResponse.json({ ok: true });
    }

    // Create user data object
    const userData = {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      photo_url: user.photo_url,
      auth_date: Math.floor(Date.now() / 1000)
    };

    // Update token with user data
    const { error: updateError } = await supabase
      .from('auth_tokens')
      .update({
        status: 'success',
        user_data: userData,
        telegram_user_id: user.id
      })
      .eq('token', token);

    if (updateError) {
      console.error('Token update error:', updateError);
      
      await sendTelegramMessage({
        chat_id: chatId,
        text: `❌ <b>Authentication Error</b>\n\n` +
              `Sorry, there was an error processing your authentication. Please try again.\n\n` +
              `<a href="${process.env.NEXT_PUBLIC_APP_DOMAIN || 'http://localhost:3001'}/auth">🔗 Try Again</a>`,
        parse_mode: 'HTML'
      });
      
      return NextResponse.json({ ok: true });
    }

    // Store user session
    await supabase
      .from('user_sessions')
      .upsert({
        telegram_user_id: user.id,
        user_data: userData
      }, {
        onConflict: 'telegram_user_id'
      });

    // Send success message with web app link
    const appUrl = process.env.NEXT_PUBLIC_APP_DOMAIN || 'http://localhost:3001';
    const welcomeMessage = `🎉 <b>Authentication Successful!</b>\n\n` +
                          `Welcome to Meetup, ${user.first_name}! 👋\n\n` +
                          `You're now logged in and can access all features:\n` +
                          `• 📅 Browse upcoming events\n` +
                          `• ✅ RSVP to events\n` +
                          `• 👥 Connect with other members\n\n` +
                          `<a href="${appUrl}">🌐 Open Meetup App</a>`;

    await sendTelegramMessage({
      chat_id: chatId,
      text: welcomeMessage,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🌐 Open Meetup App',
              url: appUrl
            }
          ],
          [
            {
              text: '📅 View Events',
              url: `${appUrl}/#events`
            },
            {
              text: '👤 My Profile',
              url: `${appUrl}/#profile`
            }
          ]
        ]
      }
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}