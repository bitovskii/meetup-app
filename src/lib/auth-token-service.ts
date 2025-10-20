import { createClient } from '@supabase/supabase-js';

interface AuthToken {
  token: string;
  status: 'pending' | 'success' | 'failed' | 'expired';
  expires_at: string;
  user_data?: Record<string, unknown>;
  created_at: string;
}

class AuthTokenService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not found, falling back to in-memory store');
      this.supabase = null;
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async setPending(token: string, expiresAt: Date): Promise<void> {
    if (!this.supabase) {
      console.warn('No Supabase client, token not stored');
      return;
    }

    try {
      const { error } = await this.supabase
        .from('auth_tokens')
        .insert({
          token,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to store pending token:', error);
      }
    } catch (err) {
      console.error('Error storing pending token:', err);
    }
  }

  async setSuccess(token: string, userData: Record<string, unknown>): Promise<void> {
    if (!this.supabase) {
      console.warn('No Supabase client, token not updated');
      return;
    }

    try {
      const { error } = await this.supabase
        .from('auth_tokens')
        .update({
          status: 'success',
          user_data: userData
        })
        .eq('token', token)
        .eq('status', 'pending');

      if (error) {
        console.error('Failed to update token to success:', error);
      }
    } catch (err) {
      console.error('Error updating token to success:', err);
    }
  }

  async setFailed(token: string): Promise<void> {
    if (!this.supabase) {
      console.warn('No Supabase client, token not updated');
      return;
    }

    try {
      const { error } = await this.supabase
        .from('auth_tokens')
        .update({ status: 'failed' })
        .eq('token', token);

      if (error) {
        console.error('Failed to update token to failed:', error);
      }
    } catch (err) {
      console.error('Error updating token to failed:', err);
    }
  }

  async get(token: string): Promise<AuthToken | null> {
    if (!this.supabase) {
      console.warn('No Supabase client, returning null token');
      return null;
    }

    try {
      const { data, error } = await this.supabase
        .from('auth_tokens')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !data) {
        return null;
      }

      // Check if expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      
      if (now > expiresAt && data.status !== 'expired') {
        // Mark as expired
        await this.supabase
          .from('auth_tokens')
          .update({ status: 'expired' })
          .eq('token', token);
        
        data.status = 'expired';
      }

      return data;
    } catch (err) {
      console.error('Error getting token:', err);
      return null;
    }
  }

  async cleanup(): Promise<void> {
    if (!this.supabase) {
      return;
    }

    try {
      // Delete tokens older than 1 hour
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const { error } = await this.supabase
        .from('auth_tokens')
        .delete()
        .lt('created_at', oneHourAgo.toISOString());

      if (error) {
        console.error('Failed to cleanup old tokens:', error);
      }
    } catch (err) {
      console.error('Error cleaning up tokens:', err);
    }
  }

  async getStats() {
    if (!this.supabase) {
      return { total: 0, pending: 0, success: 0, failed: 0, expired: 0 };
    }

    try {
      const { data, error } = await this.supabase
        .from('auth_tokens')
        .select('status');

      if (error || !data) {
        return { total: 0, pending: 0, success: 0, failed: 0, expired: 0 };
      }

      const stats = {
        total: data.length,
        pending: data.filter(t => t.status === 'pending').length,
        success: data.filter(t => t.status === 'success').length,
        failed: data.filter(t => t.status === 'failed').length,
        expired: data.filter(t => t.status === 'expired').length
      };

      return stats;
    } catch (err) {
      console.error('Error getting stats:', err);
      return { total: 0, pending: 0, success: 0, failed: 0, expired: 0 };
    }
  }
}

// Export singleton instance
export const authTokenService = new AuthTokenService();