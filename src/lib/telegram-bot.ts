/**
 * Telegram Bot API utilities
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface TelegramMessage {
  chat_id: number;
  text: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  reply_markup?: {
    inline_keyboard?: Array<Array<{
      text: string;
      url?: string;
      callback_data?: string;
    }>>;
  };
}

/**
 * Send a message to a Telegram user
 */
export async function sendTelegramMessage(message: TelegramMessage): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not configured');
    return false;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    
    if (!result.ok) {
      console.error('Telegram API error:', result);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}

/**
 * Set up bot commands
 */
export async function setBotCommands(): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not configured');
    return false;
  }

  const commands = [
    {
      command: 'start',
      description: 'Start authentication process'
    },
    {
      command: 'help',
      description: 'Show help information'
    }
  ];

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/setMyCommands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ commands }),
    });

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('Failed to set bot commands:', error);
    return false;
  }
}

/**
 * Set webhook URL
 */
export async function setWebhook(webhookUrl: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not configured');
    return false;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message'],
        drop_pending_updates: true
      }),
    });

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('Failed to set webhook:', error);
    return false;
  }
}

/**
 * Get bot info
 */
export async function getBotInfo(): Promise<{ ok: boolean; result?: { id: number; is_bot: boolean; first_name: string; username: string; can_join_groups: boolean; can_read_all_group_messages: boolean; supports_inline_queries: boolean } } | null> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not configured');
    return null;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/getMe`);
    const result = await response.json();
    return result.ok ? result.result : null;
  } catch (error) {
    console.error('Failed to get bot info:', error);
    return null;
  }
}