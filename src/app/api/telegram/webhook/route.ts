import { NextRequest, NextResponse } from 'next/server';
import { updateAuthSession, decodeTokenFromTelegram, createOrUpdateAuthSession } from '@/utils/authSessions';

interface TelegramUpdate {
  message?: {
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    text: string;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    data: string;
  };
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(request: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN is not set');
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    const update: TelegramUpdate = await request.json();
    console.log('Telegram webhook received:', JSON.stringify(update, null, 2));

    // Handle /start command
    if (update.message?.text?.startsWith('/start')) {
      const user = update.message.from;
      
      // Check if this is /start with a token
      if (update.message.text.startsWith('/start ')) {
        const encodedToken = update.message.text.split('/start ')[1];
        console.log('Processing /start with token:', encodedToken);
        
        try {
          const token = decodeTokenFromTelegram(encodedToken);
          console.log('Decoded token:', token);
          
          // Create a new auth session with this token for this user
          // This fixes the serverless memory issue
          const newSession = {
            token,
            status: 'pending' as const,
            userId: user.id,
            userData: {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              username: user.username,
            },
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          };
          
          // Store the session temporarily (will be used when user clicks authorize)
          createOrUpdateAuthSession(token, newSession);
          
          // Send authorization message with inline keyboard
          console.log('Sending authorization message to chat ID:', user.id);
          await sendAuthorizationMessage(user.id, user.first_name, token);
          
          return NextResponse.json({ ok: true });
        } catch (error) {
          console.error('Error processing start command:', error);
          await sendErrorMessage(user.id);
          return NextResponse.json({ ok: true });
        }
      } else {
        // Plain /start command - send welcome message
        await sendWelcomeMessage(user.id, user.first_name);
        return NextResponse.json({ ok: true });
      }
    }

    // Handle simple /auth command (new simple flow)
    if (update.message?.text?.startsWith('/auth ')) {
      const user = update.message.from;
      const token = update.message.text.split('/auth ')[1];
      
      console.log('Processing /auth command for token:', token);
      
      try {
        // Immediately authorize the user
        const authSession = {
          token,
          status: 'authorized' as const,
          userId: user.id,
          userData: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
          },
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        };
        
        createOrUpdateAuthSession(token, authSession);
        
        await sendTelegramMessage(user.id, `✅ Готово! Вы успешно авторизовались как ${user.first_name}. Можете вернуться на сайт.`);
        
        return NextResponse.json({ ok: true });
      } catch (error) {
        console.error('Error processing auth command:', error);
        await sendTelegramMessage(user.id, '❌ Ошибка авторизации. Попробуйте еще раз.');
        return NextResponse.json({ ok: true });
      }
    }

    // Handle callback queries (button presses)
    if (update.callback_query) {
      const { id, from, data } = update.callback_query;
      console.log('Callback query received:', { id, from, data });
      
      try {
        const [action, token] = data.split(':');
        console.log('Parsed action:', action, 'token:', token);
        
        if (action === 'authorize') {
          console.log('Processing authorize callback for token:', token);
          
          // Create/Update session as authorized (handles serverless issue)
          const authSession = {
            token,
            status: 'authorized' as const,
            userId: from.id,
            userData: {
              id: from.id,
              first_name: from.first_name,
              last_name: from.last_name,
              username: from.username,
            },
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          };
          
          console.log('Creating auth session:', authSession);
          
          // Force create the session (solves serverless memory issue)
          const success = createOrUpdateAuthSession(token, authSession);
          console.log('Session creation/update result:', success);
          
          // Send simple responses without complex error handling
          try {
            console.log('Sending success callback...');
            await answerCallbackQuery(id, 'Готово!');
          } catch (callbackError) {
            console.log('Callback query failed, but continuing...');
          }
          
          try {
            console.log('Sending success message...');
            await sendSuccessMessage(from.id);
          } catch (messageError) {
            console.log('Success message failed, but session is created');
          }
        } else if (action === 'cancel') {
          updateAuthSession(token, { status: 'cancelled' });
          await answerCallbackQuery(id, 'Авторизация отменена');
          await sendCancelMessage(from.id);
        }
        
        return NextResponse.json({ ok: true });
      } catch (error) {
        console.error('Error processing callback query:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          callbackData: update.callback_query?.data
        });
        await answerCallbackQuery(id, 'Произошла ошибка');
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function sendWelcomeMessage(chatId: number, firstName: string) {
  const message = `Привет, ${firstName}! 👋

Я бот для авторизации на сайте Meetup. 

Чтобы войти на сайт:
1. Откройте сайт Meetup в браузере
2. Нажмите кнопку "Войти через Telegram"
3. Вы будете перенаправлены ко мне с кодом авторизации

Если у вас есть код авторизации, отправьте команду:
/start [ваш_код]`;

  await sendTelegramMessage(chatId, message);
}

async function sendAuthorizationMessage(chatId: number, firstName: string, token: string) {
  const message = `Вы входите на сайт Meetup под учетной записью "${firstName}".
Чтобы продолжить авторизацию на сайте, нажмите на кнопку "Авторизоваться".
Если вы не совершали никаких действий на сайте, или попали сюда в результате действий третьих лиц, нажмите на кнопку "Отмена".`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Авторизоваться', callback_data: `authorize:${token}` },
        { text: '❌ Отмена', callback_data: `cancel:${token}` }
      ]
    ]
  };

  await sendTelegramMessage(chatId, message, keyboard);
}

async function sendSuccessMessage(chatId: number) {
  const message = 'Вы успешно авторизовались на сайте Meetup, теперь можно вернуться обратно на сайт';
  await sendTelegramMessage(chatId, message);
}

async function sendCancelMessage(chatId: number) {
  const message = 'Авторизация отменена';
  await sendTelegramMessage(chatId, message);
}

async function sendErrorMessage(chatId: number) {
  const message = 'Произошла ошибка при авторизации. Попробуйте еще раз.';
  await sendTelegramMessage(chatId, message);
}

async function sendTelegramMessage(chatId: number, text: string, reply_markup?: object) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        reply_markup,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Telegram API error:', result);
      throw new Error(`Telegram API error: ${result.description}`);
    }
    
    console.log('Message sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

async function answerCallbackQuery(callbackQueryId: string, text: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Telegram answerCallbackQuery error:', result);
      throw new Error(`Telegram API error: ${result.description}`);
    }
    
    console.log('Callback query answered successfully:', result);
    return result;
  } catch (error) {
    console.error('Error answering callback query:', error);
    throw error;
  }
}