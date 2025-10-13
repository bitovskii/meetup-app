import { useState, useCallback } from 'react';
import type { AuthTokenResponse, AuthValidationResponse } from '@/types';

interface TelegramAuthState {
  isGenerating: boolean;
  isValidating: boolean;
  token: string | null;
  deepLink: string | null;
  expiresAt: string | null;
  error: string | null;
}

export function useTelegramAuth() {
  const [state, setState] = useState<TelegramAuthState>({
    isGenerating: false,
    isValidating: false,
    token: null,
    deepLink: null,
    expiresAt: null,
    error: null
  });

  const generateAuthToken = useCallback(async () => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const response = await fetch('/api/auth/telegram/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: AuthTokenResponse = await response.json();

      if (data.success && data.data) {
        const { token, deepLink, expiresAt } = data.data;
        setState(prev => ({
          ...prev,
          isGenerating: false,
          token,
          deepLink,
          expiresAt,
          error: null
        }));
        return data;
      } else {
        throw new Error(data.error || 'Failed to generate auth token');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  const validateToken = useCallback(async (token: string, userData?: any) => {
    setState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      // If userData is provided, it's for webhook validation (POST)
      if (userData) {
        const response = await fetch('/api/auth/telegram/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            user_data: userData
          }),
        });

        const data: AuthValidationResponse = await response.json();
        setState(prev => ({ ...prev, isValidating: false }));

        if (data.success) {
          return data;
        } else {
          throw new Error(data.error || 'Token validation failed');
        }
      } else {
        // For polling, use GET request to check status
        const response = await fetch(`/api/auth/telegram/validate?token=${encodeURIComponent(token)}`, {
          method: 'GET',
        });

        const data: AuthValidationResponse = await response.json();
        setState(prev => ({ ...prev, isValidating: false }));

        if (data.success) {
          return data;
        } else {
          throw new Error(data.error || 'Token validation failed');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isValidating: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      isValidating: false,
      token: null,
      deepLink: null,
      expiresAt: null,
      error: null
    });
  }, []);

  return {
    ...state,
    generateAuthToken,
    validateToken,
    clearError,
    reset
  };
}