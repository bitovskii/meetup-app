'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TelegramAuth from '@/components/TelegramAuth';
import { useAuth } from '@/contexts/AuthContext';
import type { TelegramUser } from '@/components/TelegramAuth';

function AuthContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  const handleTelegramAuth = useCallback(async (user: TelegramUser) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Sign in user using auth context
      signIn(user, 'telegram');
      
      // Redirect to main app after successful authentication
      router.push('/');
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [signIn, router]);

  const handleAuthError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  // Handle redirect from Telegram auth
  useEffect(() => {
    const telegramAuth = searchParams.get('telegram_auth');
    const userData = searchParams.get('user_data');
    const authError = searchParams.get('error');

    if (telegramAuth === 'success' && userData) {
      try {
        const user: TelegramUser = JSON.parse(userData);
        handleTelegramAuth(user);
      } catch (err) {
        console.error('Error parsing user data:', err);
        setError('Authentication failed. Please try again.');
      }
    } else if (authError) {
      const errorMessages = {
        config: 'Server configuration error. Please try again later.',
        invalid: 'Invalid authentication data. Please try again.',
        verification: 'Verification failed. Please try again.'
      };
      setError(errorMessages[authError as keyof typeof errorMessages] || 'Authentication failed.');
    }
  }, [searchParams, handleTelegramAuth]);

  // Handle redirect from Telegram auth
  useEffect(() => {
    const telegramAuth = searchParams.get('telegram_auth');
    const userData = searchParams.get('user_data');
    const authError = searchParams.get('error');

    if (telegramAuth === 'success' && userData) {
      try {
        const user: TelegramUser = JSON.parse(userData);
        handleTelegramAuth(user);
      } catch (err) {
        console.error('Error parsing user data:', err);
        setError('Authentication failed. Please try again.');
      }
    } else if (authError) {
      const errorMessages = {
        config: 'Server configuration error. Please try again later.',
        invalid: 'Invalid authentication data. Please try again.',
        verification: 'Verification failed. Please try again.'
      };
      setError(errorMessages[authError as keyof typeof errorMessages] || 'Authentication failed.');
    }
  }, [searchParams, handleTelegramAuth]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
            {/* Meetup Star Logo */}
            <svg className="w-8 h-8 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="8" cy="8" r="1" />
              <circle cx="16" cy="8" r="1" />
              <circle cx="8" cy="16" r="1" />
              <circle cx="16" cy="16" r="1" />
            </svg>
            Meetup
          </Link>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Join our community
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in with Telegram to RSVP for events and connect with other members
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Authenticating...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.569 1.825-1.595 3.593-3.061 5.296-1.756 2.04-4.581 3.775-7.387 4.357-.708.147-1.442.244-2.184.244-.75 0-1.48-.098-2.175-.244-2.808-.582-5.631-2.317-7.387-4.357C3.027 11.753 2.001 9.985 1.432 8.16c1.725-1.033 3.794-1.641 6.017-1.641 2.223 0 4.292.608 6.017 1.641z"/>
                  </svg>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    🔐 Secure & Bot-Protected Authentication
                  </span>
                </div>
              </div>
              
              <TelegramAuth 
                botName="meetup_auth_bot"
                onAuth={handleTelegramAuth}
                onError={handleAuthError}
                size="large"
                className="w-full"
              />

              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  By signing in with Telegram, you authorize our app to access your basic profile information.
                </p>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            ← Back to events
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}