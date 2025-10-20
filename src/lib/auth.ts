import { NextRequest } from 'next/server';
import { db } from '@/lib/database';
import crypto from 'node:crypto';

interface DatabaseUser {
  id: string;
  telegram_id?: number;
  username?: string;
  full_name: string;
  email?: string;
  avatar_url?: string;
  status: string;
}

export interface AuthenticatedUser {
  id: string;
  telegram_id?: number;
  username?: string;
  full_name: string;
  email?: string;
  avatar_url?: string;
  status: string;
  sessionId: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

interface TelegramAuthData {
  hash: string;
  auth_date: number;
  id?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  [key: string]: string | number | undefined;
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Extract session token from request headers
 */
export function getSessionToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookies as fallback
  const cookieToken = request.cookies.get('session_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * Validate session token and return user data
 */
export async function validateSession(sessionToken: string): Promise<AuthResult> {
  try {
    const { data: session, error } = await db.getActiveSession(sessionToken);
    
    if (error || !session) {
      return {
        success: false,
        error: 'Invalid or expired session'
      };
    }

    // Update last activity
    await db.updateSessionActivity(sessionToken);

    const user = session.users as DatabaseUser;
    if (!user || user.status !== 'active') {
      return {
        success: false,
        error: 'User account is not active'
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url,
        status: user.status,
        sessionId: session.id
      }
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return {
      success: false,
      error: 'Session validation failed'
    };
  }
}

/**
 * Authenticate request and return user data
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  const sessionToken = getSessionToken(request);
  
  if (!sessionToken) {
    return {
      success: false,
      error: 'No session token provided'
    };
  }

  return validateSession(sessionToken);
}

/**
 * Create a new user session
 */
export async function createUserSession(
  userId: string,
  loginMethod: string,
  metadata?: {
    telegramChatId?: number;
    deviceInfo?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<{ sessionToken: string; expiresAt: Date }> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  await db.createSession({
    user_id: userId,
    session_token: sessionToken,
    telegram_chat_id: metadata?.telegramChatId,
    device_info: metadata?.deviceInfo,
    ip_address: metadata?.ipAddress,
    user_agent: metadata?.userAgent,
    login_method: loginMethod,
    expires_at: expiresAt.toISOString()
  });

  // Update user's last login
  await db.updateUserLastLogin(userId);

  return { sessionToken, expiresAt };
}

/**
 * Verify Telegram authentication data
 */
export function verifyTelegramAuth(authData: TelegramAuthData, botToken: string): boolean {
  try {
    const { hash, ...data } = authData;
    
    if (!hash) {
      return false;
    }

    // Create data check string
    const dataCheckString = Object.keys(data)
      .sort((a, b) => a.localeCompare(b))
      .map(key => `${key}=${data[key]}`)
      .join('\n');
    
    // Create secret key using SHA256
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Verify hash matches
    const isHashValid = calculatedHash === hash;
    
    // Check auth_date (should be within last 24 hours for security)
    const authDate = data.auth_date;
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDiff = currentTime - authDate;
    const isTimeValid = timeDiff < 86400; // 24 hours in seconds
    
    return isHashValid && isTimeValid;
  } catch (error) {
    console.error('Error verifying Telegram auth data:', error);
    return false;
  }
}

/**
 * Handle Telegram user authentication
 */
export async function authenticateTelegramUser(telegramData: {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
}): Promise<{ user: DatabaseUser; sessionToken: string; expiresAt: Date }> {
  // Check if user already exists
  const { data: existingUser, error } = await db.getUserByTelegramId(telegramData.id);
  
  let user;
  if (error || !existingUser) {
    // Create new user
    user = await db.createUser({
      telegram_id: telegramData.id,
      username: telegramData.username,
      full_name: `${telegramData.first_name} ${telegramData.last_name || ''}`.trim(),
      avatar_url: telegramData.photo_url,
      activation_method: 'telegram'
    });
  } else {
    user = existingUser;
  }

  // Create session
  const { sessionToken, expiresAt } = await createUserSession(
    user.id,
    'telegram',
    {
      telegramChatId: telegramData.id
    }
  );

  return { user, sessionToken, expiresAt };
}

/**
 * Logout user by deactivating session
 */
export async function logoutUser(sessionToken: string): Promise<void> {
  await db.deactivateSession(sessionToken);
}

/**
 * Middleware helper for protected routes
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  return authenticateRequest(request);
}