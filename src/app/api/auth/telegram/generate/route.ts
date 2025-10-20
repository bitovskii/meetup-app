import { NextResponse } from 'next/server';
import { generateSessionToken } from '@/lib/auth';
import { generateTelegramDeepLink } from '@/lib/auth-utils';
import { authTokenService } from '@/lib/auth-token-service';
import type { AuthTokenResponse } from '@/types';

export async function POST(): Promise<NextResponse<AuthTokenResponse>> {
  try {
    // Generate secure token for Telegram auth
    const token = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minute expiration for auth tokens

    // Store token as pending in our token service
    await authTokenService.setPending(token, expiresAt);

    // Generate deep link
    const deepLink = generateTelegramDeepLink(token);

    return NextResponse.json({
      success: true,
      data: {
        token: token,
        deepLink: deepLink,
        expiresAt: expiresAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}