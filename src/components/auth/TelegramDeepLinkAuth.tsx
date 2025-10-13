'use client';

import { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { Button, LoadingSpinner } from '@/components/ui';

interface TelegramDeepLinkAuthProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: string) => void;
}

export function TelegramDeepLinkAuth({ onSuccess, onError }: Readonly<TelegramDeepLinkAuthProps>) {
  const {
    isGenerating,
    token,
    deepLink,
    expiresAt,
    error,
    generateAuthToken,
    validateToken,
    clearError,
    reset
  } = useTelegramAuth();

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isPolling, setIsPolling] = useState(false);

  // Auto-generate token on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await generateAuthToken();
        setIsPolling(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate auth link';
        onError?.(errorMessage);
      }
    };

    initializeAuth();
  }, [generateAuthToken, onError]);

  // Handle token expiration countdown
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const remaining = Math.max(0, expiry - now);
      
      setTimeLeft(Math.floor(remaining / 1000));

      if (remaining <= 0) {
        setIsPolling(false);
        reset();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, reset]);

  // Poll for authentication completion
  useEffect(() => {
    if (!isPolling || !token) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await validateToken(token); // This now uses GET request for polling
        
        if (response.success && response.data?.status === 'success' && response.data.user) {
          setIsPolling(false);
          onSuccess?.(response.data.user);
        }
      } catch {
        // Continue polling on error
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [isPolling, token, validateToken, onSuccess]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle loading state
  if (isGenerating || !deepLink) {
    return (
      <div className="text-center space-y-4">
        <div className="text-gray-700">
          <span className="text-4xl block mb-2">🔐</span>
          <h3 className="text-lg font-semibold">Preparing Telegram Authentication</h3>
          <p className="text-sm text-gray-600 mt-1">
            Generating secure authentication link...
          </p>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-gray-600">Please wait...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2 text-red-800">
          <span className="text-xl">❌</span>
          <div>
            <p className="font-medium">Authentication Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <Button
          onClick={() => {
            clearError();
            reset();
            window.location.reload(); // Reload to restart the auth process
          }}
          className="mt-4 bg-red-600 hover:bg-red-700"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="text-gray-700">
        <span className="text-4xl block mb-2">📱</span>
        <h3 className="text-lg font-semibold">Continue with Telegram</h3>
        <p className="text-sm text-gray-600 mt-1">
          Click the button below to authenticate via Telegram
        </p>
        {timeLeft > 0 && (
          <p className="text-xs text-blue-600 mt-2">
            Link expires in: <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </p>
        )}
      </div>

      {/* Direct link button to Telegram */}
      <a
        href={deepLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221c-.238.85-.852 3.14-1.204 4.163-.149.434-.442.514-.724.314-.408-.287-1.537-.978-2.142-1.384-.283-.19-.605-.428-.204-.768.401-.34 2.206-2.021 2.49-2.267.071-.062.142-.186-.03-.266-.172-.08-.408.026-.582.15-.174.124-3.29 2.08-3.666 2.321-.376.241-.752.18-1.084.05-.332-.13-1.084-.287-1.693-.485-.61-.199-.61-.485 0-.684 0 0 6.823-2.805 7.23-2.962.407-.157.723-.087.723.684z"/>
        </svg>
        Continue with Telegram
      </a>

      <div className="text-xs text-gray-500">
        <p>Or copy this link:</p>
        <div className="mt-1 p-2 bg-gray-50 border rounded font-mono text-xs break-all">
          {deepLink}
        </div>
      </div>

      {isPolling && (
        <div className="flex items-center justify-center space-x-2 text-blue-600 mt-4">
          <LoadingSpinner size="sm" />
          <span className="text-sm">Waiting for authorization...</span>
        </div>
      )}

      <Button
        onClick={() => {
          reset();
          window.location.reload(); // Reload to restart the auth process
        }}
        variant="outline"
        className="text-gray-600 border-gray-300 hover:bg-gray-100"
      >
        Cancel
      </Button>
    </div>
  );
}

export default TelegramDeepLinkAuth;