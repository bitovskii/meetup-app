'use client';

import { useState, useEffect, useRef } from 'react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import type { TelegramUser } from '@/types';

interface TelegramAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: TelegramUser) => void;
}

export default function TelegramAuthModal({ isOpen, onClose, onSuccess }: TelegramAuthModalProps) {
  const { generateAuthToken, validateToken } = useTelegramAuth();
  const [authData, setAuthData] = useState<{
    token: string;
    deepLink: string;
    expiresAt: string;
  } | null>(null);
  const [status, setStatus] = useState<'idle' | 'generating' | 'waiting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate auth token when modal opens
  useEffect(() => {
    if (isOpen && status === 'idle') {
      handleGenerateToken();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer
  useEffect(() => {
    if (authData && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && authData) {
      setStatus('error');
      setError('Authentication link expired. Please try again.');
    }
  }, [timeLeft, authData]);

  // Poll for authentication status
  useEffect(() => {
    if (authData && status === 'waiting') {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const result = await validateToken(authData.token);
          if (result.success && result.data?.status === 'success' && result.data?.user) {
            setStatus('success');
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            setTimeout(() => {
              // Transform the user data to match TelegramUser interface
              const user = result.data!.user!; // We've already checked these exist
              const telegramUser: TelegramUser = {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                photo_url: user.photo_url,
                auth_date: user.auth_date || Math.floor(Date.now() / 1000),
                hash: 'validated' // Add a default hash since this is validated through our system
              };
              onSuccess(telegramUser);
              onClose();
            }, 1500);
          }
        } catch (err) {
          // Continue polling on errors
          console.log('Polling error:', err);
        }
      }, 1000);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    }
  }, [authData, status, validateToken, onSuccess, onClose]);

  const handleGenerateToken = async () => {
    setStatus('generating');
    setError(null);
    
    try {
      const result = await generateAuthToken();
      if (result.success && result.data) {
        setAuthData(result.data);
        setStatus('waiting');
        
        // Calculate time left
        const expiresAt = new Date(result.data.expiresAt);
        const now = new Date();
        const timeLeftSeconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
        setTimeLeft(Math.max(0, timeLeftSeconds));
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to generate authentication link');
    }
  };

  const handleTryAgain = () => {
    setStatus('idle');
    setAuthData(null);
    setError(null);
    setTimeLeft(0);
    handleGenerateToken();
  };

  const handleCancel = () => {
    // Stop polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    
    // Reset state
    setStatus('idle');
    setAuthData(null);
    setError(null);
    setTimeLeft(0);
    
    // Close modal
    onClose();
  };

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      // Reset state when modal closes
      setStatus('idle');
      setAuthData(null);
      setError(null);
      setTimeLeft(0);
    }
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal content */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Continue with Telegram
          </h2>

          {status === 'generating' && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400">Generating authentication link...</p>
            </div>
          )}

          {status === 'waiting' && authData && (
            <div className="space-y-4">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-gray-900 dark:text-white font-medium">
                Click the link below to authenticate with Telegram
              </p>
              <a
                href={authData.deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Open in Telegram
              </a>
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
                <p>After clicking, you&apos;ll see an authorization message in Telegram.</p>
                <p>Click &quot;Authorize&quot; to complete the login process.</p>
                {timeLeft > 0 && (
                  <p className="font-mono">
                    Expires in: <span className="text-blue-600 dark:text-blue-400">{formatTime(timeLeft)}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full" style={{ animationDelay: '0.4s' }}></div>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Waiting for authorization...</span>
              </div>
              <button
                onClick={handleCancel}
                className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-green-600 dark:text-green-400 font-medium">
                Successfully authenticated!
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Redirecting you to the app...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="text-6xl mb-4">❌</div>
              <p className="text-red-600 dark:text-red-400 font-medium">
                Authentication failed
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {error}
              </p>
              <button
                onClick={handleTryAgain}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}