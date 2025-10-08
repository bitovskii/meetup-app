/**
 * Get the current app domain for Telegram bot configuration
 */
export function getAppDomain(): string {
  // For production, use environment variable set in Vercel
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_APP_DOMAIN || 'your-app.vercel.app';
  }
  
  // For development, detect current domain
  if (typeof window !== 'undefined') {
    return window.location.host;
  }
  
  // Fallback for server-side rendering in development
  return process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3001';
}

/**
 * Get the bot configuration based on environment
 */
export function getTelegramBotConfig() {
  const domain = getAppDomain();
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'meetup_auth_bot';
  
  return {
    botUsername,
    domain,
    isProduction: process.env.NODE_ENV === 'production'
  };
}

/**
 * Check if we need to update the bot domain in BotFather
 */
export function shouldUpdateBotDomain(): boolean {
  const currentDomain = getAppDomain();
  const isLocalhost = currentDomain.includes('localhost');
  const isVercel = currentDomain.includes('vercel.app');
  
  return !isLocalhost && !isVercel;
}