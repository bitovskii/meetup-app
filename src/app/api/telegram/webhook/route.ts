import { NextRequest, NextResponse } from 'next/server';
import { updateAuthSession, decodeTokenFromTelegram } from '@/utils/authSessions';

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
    if (update.message?.text?.startsWith('/start ')) {
      const encodedToken = update.message.text.split('/start ')[1];
      const user = update.message.from;
      
      try {
        const token = decodeTokenFromTelegram(encodedToken);
        
        // Send authorization message with inline keyboard
        await sendAuthorizationMessage(user.id, user.first_name, token);
        
        return NextResponse.json({ ok: true });
      } catch (error) {
        console.error('Error processing start command:', error);
        await sendErrorMessage(user.id);
        return NextResponse.json({ ok: true });
      }
    }

    // Handle callback queries (button presses)
    if (update.callback_query) {
      const { id, from, data } = update.callback_query;
      
      try {
        const [action, token] = data.split(':');
        
        if (action === 'authorize') {
          // Update session as authorized
          const success = updateAuthSession(token, {
            status: 'authorized',
            userId: from.id,
            userData: {
              id: from.id,
              first_name: from.first_name,
              last_name: from.last_name,
              username: from.username,
            },
          });
          
          if (success) {
            await answerCallbackQuery(id, 'Авторизация успешна!');
            await sendSuccessMessage(from.id);
          } else {
            await answerCallbackQuery(id, 'Ошибка авторизации');
          }
        } else if (action === 'cancel') {
          updateAuthSession(token, { status: 'cancelled' });
          await answerCallbackQuery(id, 'Авторизация отменена');
          await sendCancelMessage(from.id);
        }
        
        return NextResponse.json({ ok: true });
      } catch (error) {
        console.error('Error processing callback query:', error);
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
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup,
    }),
  });
}

async function answerCallbackQuery(callbackQueryId: string, text: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`;
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
    }),
  });
}