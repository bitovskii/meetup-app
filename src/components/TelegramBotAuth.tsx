'use client';

import { useState, useEffect } from 'react';
import { encodeTokenForTelegram } from '@/utils/authSessions';

interface TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramBotAuthProps {
  botUsername: string;
  onAuth: (userData: TelegramUserData) => void;
  onError: (error: string) => void;
  className?: string;
}

export default function TelegramBotAuth({ 
  botUsername, 
  onAuth, 
  onError, 
  className = '' 
}: Readonly<TelegramBotAuthProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Create auth session when component mounts
  useEffect(() => {
    createAuthSession();
  }, [onError]);

  // Poll for auth status
  useEffect(() => {
    if (!authToken) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/auth/session?token=${authToken}`);
        const data = await response.json();

        if (data.status === 'authorized' && data.userData) {
          clearInterval(pollInterval);
          setIsLoading(false);
          // Add required fields for compatibility with existing auth system
          const telegramUser = {
            ...data.userData,
            auth_date: Math.floor(Date.now() / 1000),
            hash: 'bot_auth', // Placeholder since bot auth doesn't use hash verification
          };
          onAuth(telegramUser);
        } else if (data.status === 'cancelled') {
          clearInterval(pollInterval);
          setIsLoading(false);
          onError('Authorization cancelled');
        }
      } catch (error) {
        console.error('Error polling auth status:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Cleanup after 10 minutes
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      setIsLoading(false);
      onError('Authorization timeout');
    }, 10 * 60 * 1000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [authToken, onAuth, onError]);

  const createAuthSession = async () => {
    try {
      const response = await fetch('/api/auth/session', { method: 'POST' });
      const data = await response.json();
      
      if (data.token) {
        setAuthToken(data.token);
      } else {
        onError('Failed to create auth session');
      }
    } catch (error) {
      console.error('Error creating auth session:', error);
      onError('Failed to create auth session');
    }
  };

  // Create auth session when component mounts
  useEffect(() => {
    createAuthSession();
  }, [onError]);

  const handleTelegramLogin = () => {
    if (!authToken) {
      onError('Auth session not ready');
      return;
    }

    setIsLoading(true);
    setShowInstructions(true);

    const encodedToken = encodeTokenForTelegram(authToken);
    const telegramUrl = `https://t.me/${botUsername}?start=${encodedToken}`;
    
    console.log('Opening Telegram bot:', telegramUrl);
    
    // Open Telegram in new tab
    window.open(telegramUrl, '_blank');
  };

  if (isLoading && showInstructions) {
    return (
      <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-pulse">
              <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Waiting for authorization...
          </h3>
          
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
            Please check Telegram and click &quot;Authorize&quot; to complete login
          </p>
          
          <div className="space-y-2 text-xs text-blue-600 dark:text-blue-400">
            <p>• A new tab with Telegram should have opened</p>
            <p>• Follow the bot&apos;s instructions to authorize</p>
            <p>• Return to this page after authorization</p>
          </div>
          
          <button
            onClick={() => {
              setIsLoading(false);
              setShowInstructions(false);
            }}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleTelegramLogin}
      disabled={!authToken || isLoading}
      className={`bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg flex items-center gap-3 transition-colors ${className}`}
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
      {isLoading ? 'Waiting for authorization...' : 'Login with Telegram Bot'}
    </button>
  );
}