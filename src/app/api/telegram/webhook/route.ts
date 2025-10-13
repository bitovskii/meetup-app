import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    message?: {
      message_id: number;
      chat: {
        id: number;
      };
    };
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
          // Decode token from base64url
          const token = Buffer.from(encodedToken, 'base64url').toString();
          console.log('=== TOKEN DEBUGGING ===');
          console.log('Encoded token from Telegram:', encodedToken);
          console.log('Decoded token:', token);
          console.log('Token length:', token.length);
          console.log('=======================');
          
          // Check if token exists in database
          const { data: tokenData, error } = await supabase
            .from('auth_tokens')
            .select('*')
            .eq('token', token)
            .eq('status', 'pending')
            .single();

          if (error || !tokenData) {
            console.log('=== TOKEN LOOKUP FAILED ===');
            console.log('Token lookup failed:', {
              token,
              error: error?.message || 'No error',
              tokenData: tokenData || 'No token data',
              searchCriteria: { token, status: 'pending' }
            });
            
            // Let's also check if ANY tokens exist in the database
            const { data: allTokens, error: allError } = await supabase
              .from('auth_tokens')
              .select('token, status, created_at')
              .order('created_at', { ascending: false })
              .limit(5);
            
            console.log('Recent tokens in database:', allTokens);
            console.log('All tokens query error:', allError);
            console.log('==========================');
            
            await sendErrorMessage(user.id);
            return NextResponse.json({ ok: true });
          }

          console.log('Token found successfully:', {
            token: tokenData.token,
            status: tokenData.status,
            created_at: tokenData.created_at,
            expires_at: tokenData.expires_at
          });

          // Check if token is expired
          const now = new Date();
          const expiresAt = new Date(tokenData.expires_at);
          
          if (now > expiresAt) {
            console.log('Token expired:', {
              token,
              now: now.toISOString(),
              expiresAt: expiresAt.toISOString(),
              expired: true
            });
            
            await supabase
              .from('auth_tokens')
              .update({ status: 'expired' })
              .eq('token', token);
            
            await sendErrorMessage(user.id);
            return NextResponse.json({ ok: true });
          }

          console.log('Token is valid and not expired');
          
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
        // Use simple external storage instead of in-memory sessions
        const authData = {
          token,
          userData: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
          }
        };
        
        // Call the simple auth API to mark as authorized
        await fetch(`${process.env.NEXT_PUBLIC_APP_DOMAIN || 'https://meetup-app-theta-steel.vercel.app'}/api/auth/simple`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authData),
        });
        
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
          
          // Find the token in database
          const { data: tokenData, error } = await supabase
            .from('auth_tokens')
            .select('*')
            .eq('token', token)
            .eq('status', 'pending')
            .single();

          if (error || !tokenData) {
            await answerCallbackQuery(id, 'Token expired or invalid');
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
            
            await answerCallbackQuery(id, 'Token expired');
            return NextResponse.json({ ok: true });
          }

          // Create user data object
          const userData = {
            id: from.id,
            username: from.username,
            first_name: from.first_name,
            last_name: from.last_name,
            auth_date: Math.floor(Date.now() / 1000)
          };

          // Update token with user data
          const { error: updateError } = await supabase
            .from('auth_tokens')
            .update({
              status: 'success',
              user_data: userData,
              telegram_user_id: from.id
            })
            .eq('token', token);

          if (updateError) {
            console.error('Token update error:', updateError);
            console.error('Update details:', {
              token,
              userData,
              telegram_user_id: from.id
            });
            await answerCallbackQuery(id, 'Database error');
            return NextResponse.json({ ok: true });
          }

          console.log('Token updated successfully in auth_tokens table');

          // Store user session
          const { error: sessionError } = await supabase
            .from('user_sessions')
            .upsert({
              telegram_user_id: from.id,
              user_data: userData
            }, {
              onConflict: 'telegram_user_id'
            });

          if (sessionError) {
            console.error('User session error:', sessionError);
            console.error('Session details:', {
              telegram_user_id: from.id,
              userData
            });
            // Continue even if session fails - the auth token is the important part
          }
          
          console.log('Auth session updated successfully in database');
          
          // Send simple responses without complex error handling
          try {
            console.log('Sending success callback...');
            await answerCallbackQuery(id, '✅ Authentication successful!');
          } catch {
            console.log('Callback query failed, but continuing...');
          }
          
          try {
            console.log('Sending success message...');
            await sendSuccessMessage(from.id);
          } catch {
            console.log('Success message failed, but session is created');
          }
        } else if (action === 'cancel') {
          // Update token status to cancelled in database
          await supabase
            .from('auth_tokens')
            .update({ status: 'cancelled' })
            .eq('token', token);
            
          await answerCallbackQuery(id, 'Авторизация отменена');
          
          // Delete the original authorization message
          try {
            if (update.callback_query.message) {
              await deleteMessage(from.id, update.callback_query.message.message_id);
            }
          } catch (error) {
            console.log('Failed to delete message, but continuing:', error);
          }
          
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

async function deleteMessage(chatId: number, messageId: number) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Telegram deleteMessage error:', result);
      throw new Error(`Telegram API error: ${result.description}`);
    }
    
    console.log('Message deleted successfully:', result);
    return result;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}