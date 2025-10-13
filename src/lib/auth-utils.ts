import crypto from 'crypto';

/**
 * Generate a secure random token for authentication
 */
export function generateAuthToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate deep link for Telegram bot
 */
export function generateTelegramDeepLink(token: string): string {
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'meetup_auth_bot';
  return `https://t.me/${botUsername}?start=${token}`;
}

/**
 * Validate token format
 */
export function isValidTokenFormat(token: string): boolean {
  return /^[a-f0-9]{32}$/i.test(token);
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

/**
 * Get token expiration time (2 minutes from now)
 */
export function getTokenExpiration(): Date {
  const now = new Date();
  return new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes
}

/**
 * Telegram user data interface
 */
interface TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date?: number;
  [key: string]: unknown; // Allow additional fields
}

/**
 * Validate Telegram webhook data (basic validation)
 */
export function validateTelegramData(data: unknown): data is TelegramUserData {
  if (!data || typeof data !== 'object') return false;
  
  const typedData = data as Record<string, unknown>;
  
  // Check required fields
  const requiredFields = ['id', 'first_name'];
  return requiredFields.every(field => 
    typedData[field] !== undefined && typedData[field] !== null
  );
}