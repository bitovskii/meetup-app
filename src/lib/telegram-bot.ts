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

/**
 * Get user profile photos from Telegram
 */
export async function getUserProfilePhotos(userId: number, limit: number = 1): Promise<{
  ok: boolean;
  result?: {
    total_count: number;
    photos: Array<Array<{
      file_id: string;
      file_unique_id: string;
      width: number;
      height: number;
      file_size?: number;
    }>>;
  };
} | null> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not configured');
    return null;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/getUserProfilePhotos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        limit: limit
      }),
    });

    const result = await response.json();
    
    if (!result.ok) {
      console.error('Telegram getUserProfilePhotos API error:', result);
      return null;
    }

    return result;
  } catch (error) {
    console.error('Failed to get user profile photos:', error);
    return null;
  }
}

/**
 * Get file information from Telegram
 */
export async function getFile(fileId: string): Promise<{
  ok: boolean;
  result?: {
    file_id: string;
    file_unique_id: string;
    file_size?: number;
    file_path?: string;
  };
} | null> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not configured');
    return null;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/getFile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_id: fileId
      }),
    });

    const result = await response.json();
    
    if (!result.ok) {
      console.error('Telegram getFile API error:', result);
      return null;
    }

    return result;
  } catch (error) {
    console.error('Failed to get file info:', error);
    return null;
  }
}

/**
 * Get direct URL for Telegram file
 */
export function getTelegramFileUrl(filePath: string): string {
  return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
}

/**
 * Get user's profile photo URL (highest resolution available)
 */
export async function getUserProfilePhotoUrl(userId: number): Promise<string | null> {
  try {
    console.log(`📸 Fetching profile photo for Telegram user: ${userId}`);
    
    // Get user's profile photos
    const profilePhotos = await getUserProfilePhotos(userId, 1);
    
    if (!profilePhotos?.result?.photos?.length) {
      console.log(`📸 No profile photos found for user ${userId}`);
      return null;
    }

    // Get the largest size of the most recent photo
    const photoSizes = profilePhotos.result.photos[0]; // First photo (most recent)
    const largestPhoto = photoSizes.reduce((largest, current) => 
      current.width > largest.width ? current : largest,
      photoSizes[0] // Initial value
    );

    console.log(`📸 Found profile photo for user ${userId}:`, {
      fileId: largestPhoto.file_id,
      dimensions: `${largestPhoto.width}x${largestPhoto.height}`,
      fileSize: largestPhoto.file_size
    });

    // Get file path
    const fileInfo = await getFile(largestPhoto.file_id);
    
    if (!fileInfo?.result?.file_path) {
      console.error(`📸 Failed to get file path for photo: ${largestPhoto.file_id}`);
      return null;
    }

    // Return direct Telegram CDN URL
    const photoUrl = getTelegramFileUrl(fileInfo.result.file_path);
    console.log(`📸 Profile photo URL for user ${userId}: ${photoUrl}`);
    
    return photoUrl;
  } catch (error) {
    console.error('Error getting user profile photo URL:', error);
    return null;
  }
}