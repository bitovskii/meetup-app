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
 * Validate Telegram webhook data (basic validation)
 */
export function validateTelegramData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  const requiredFields = ['id', 'first_name'];
  return requiredFields.every(field => data[field] !== undefined);
}