'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function TelegramAuthContent() {
  const [authStatus, setAuthStatus] = useState<'checking' | 'success' | 'failed'>('checking');
  const [userData, setUserData] = useState<{
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signIn } = useAuth();
  const token = searchParams.get('token');

  const handleSignIn = useCallback((userData: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  }) => {
    const telegramUser = {
      id: userData.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.username,
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'telegram_auth' // Placeholder hash
    };
    
    signIn(telegramUser, 'telegram');
    
    // Redirect to home page after a short delay
    setTimeout(() => {
      router.push('/');
    }, 2000);
  }, [signIn, router]);

  useEffect(() => {
    if (!token) {
      setAuthStatus('failed');
      return;
    }

    // Check auth status every 2 seconds
    const checkAuth = async () => {
      try {
        const response = await fetch(`/api/auth/simple?token=${token}`);
        const data = await response.json();
        
        if (data.status === 'authorized') {
          setAuthStatus('success');
          setUserData(data.userData);
          
          // Sign in the user with the Telegram data
          if (data.userData) {
            handleSignIn(data.userData);
          }
        } else if (data.status === 'cancelled') {
          setAuthStatus('failed');
        }
      } catch {
        // Ignore auth check errors and continue
      }
    };

    const interval = setInterval(checkAuth, 2000);
    checkAuth(); // Check immediately

    // Stop checking after 5 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setAuthStatus(prevStatus => prevStatus === 'checking' ? 'failed' : prevStatus);
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [token, handleSignIn]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p>No authorization token provided</p>
        </div>
      </div>
    );
  }

  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Authorize in Telegram</h1>
          <p className="text-gray-600 mb-6">
            Open Telegram and send this command to @meetup_auth_bot:
          </p>
          <div className="bg-gray-100 p-3 rounded font-mono text-sm break-all mb-4">
            /auth {token}
          </div>
          <p className="text-sm text-gray-500">
            Waiting for authorization...
          </p>
        </div>
      </div>
    );
  }

  if (authStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-600 mb-4">Authorization Successful!</h1>
          <p className="text-gray-600 mb-4">
            Welcome, {userData?.first_name}! You will be redirected to the main page in 2 seconds.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Continue to Meetup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-red-600 text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authorization Failed</h1>
        <p className="text-gray-600 mb-4">
          The authorization was cancelled or timed out.
        </p>
        <button 
          onClick={() => window.location.href = '/auth'}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default function TelegramAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <TelegramAuthContent />
    </Suspense>
  );
}