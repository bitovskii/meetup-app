// Simple in-memory store for pending authentication tokens
// In production, you'd want to use Redis or a similar solution

interface PendingAuthToken {
  token: string;
  status: 'pending' | 'success' | 'failed' | 'expired';
  expiresAt: Date;
  userData?: Record<string, unknown>;
  createdAt: Date;
}

class AuthTokenStore {
  private readonly tokens: Map<string, PendingAuthToken> = new Map();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired tokens every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  // Store a new pending token
  setPending(token: string, expiresAt: Date): void {
    this.tokens.set(token, {
      token,
      status: 'pending',
      expiresAt,
      createdAt: new Date()
    });
  }

  // Update token status with user data
  setSuccess(token: string, userData: Record<string, unknown>): void {
    const existing = this.tokens.get(token);
    if (existing && existing.status === 'pending' && new Date() < existing.expiresAt) {
      existing.status = 'success';
      existing.userData = userData;
    }
  }

  // Mark token as failed
  setFailed(token: string): void {
    const existing = this.tokens.get(token);
    if (existing) {
      existing.status = 'failed';
    }
  }

  // Get token status and data
  get(token: string): PendingAuthToken | null {
    const authToken = this.tokens.get(token);
    if (!authToken) {
      return null;
    }

    // Check if expired
    if (new Date() > authToken.expiresAt) {
      authToken.status = 'expired';
    }

    return authToken;
  }

  // Remove a token
  remove(token: string): void {
    this.tokens.delete(token);
  }

  // Clean up expired tokens
  private cleanup(): void {
    const now = new Date();
    for (const [token, authToken] of this.tokens.entries()) {
      if (now > authToken.expiresAt) {
        this.tokens.delete(token);
      }
    }
  }

  // Get stats for debugging
  getStats() {
    const now = new Date();
    let pending = 0;
    let expired = 0;
    let success = 0;
    let failed = 0;

    for (const authToken of this.tokens.values()) {
      if (now > authToken.expiresAt) {
        expired++;
      } else {
        switch (authToken.status) {
          case 'pending':
            pending++;
            break;
          case 'success':
            success++;
            break;
          case 'failed':
            failed++;
            break;
        }
      }
    }

    return {
      total: this.tokens.size,
      pending,
      success,
      failed,
      expired
    };
  }

  // Cleanup on shutdown
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.tokens.clear();
  }
}

// Export singleton instance
export const authTokenStore = new AuthTokenStore();