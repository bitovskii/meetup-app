// Authentication token utilities
import crypto from 'crypto';

export interface AuthSession {
  token: string;
  userId?: number;
  userData?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  };
  status: 'pending' | 'authorized' | 'cancelled' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

// In-memory storage (in production, use Redis or database)
const authSessions = new Map<string, AuthSession>();

export function createAuthSession(): AuthSession {
  const token = crypto.randomBytes(32).toString('hex');
  const session: AuthSession = {
    token,
    status: 'pending',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  };
  
  authSessions.set(token, session);
  return session;
}

export function getAuthSession(token: string): AuthSession | null {
  const session = authSessions.get(token);
  if (!session) return null;
  
  // Check if expired
  if (new Date() > session.expiresAt) {
    authSessions.delete(token);
    return null;
  }
  
  return session;
}

export function updateAuthSession(token: string, updates: Partial<AuthSession>): boolean {
  const session = authSessions.get(token);
  if (!session) return false;
  
  Object.assign(session, updates);
  authSessions.set(token, session);
  return true;
}

export function deleteAuthSession(token: string): boolean {
  return authSessions.delete(token);
}

// Encode token for Telegram deep link
export function encodeTokenForTelegram(token: string): string {
  return Buffer.from(token).toString('base64url');
}

// Decode token from Telegram deep link
export function decodeTokenFromTelegram(encoded: string): string {
  return Buffer.from(encoded, 'base64url').toString();
}