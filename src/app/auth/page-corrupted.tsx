'use client';'use client';'use client';



import { Suspense, useState } from 'react';

import { useRouter } from 'next/navigation';

import Link from 'next/link';import { Suspense, useState } from 'react';import { useState, useCallback, Suspense } from 'react';



function AuthContent() {import { useRouter } from 'next/navigation';import { useRouter } from 'next/navigation';

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);import Link from 'next/link';import Link from 'next/link';

  const [error, setError] = useState('');



  const handleTelegramLogin = async () => {

    setIsLoading(true);function AuthContent() {function AuthContent() {

    setError('');

      const router = useRouter();  const [isLoading, setIsLoading] = useState(false);

    try {

      const response = await fetch('/api/auth/simple', {  const [isLoading, setIsLoading] = useState(false);  const [error, setError] = useState('');

        method: 'POST',

        headers: {  const [error, setError] = useState('');  const router = useRouter();

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({}),

      });  const handleTelegramLogin = async () => {  const handleTelegramLogin = useCallback(async () => {



      if (!response.ok) {    setIsLoading(true);    setIsLoading(true);

        throw new Error('Failed to create auth session');

      }    setError('');    setError('');



      const { token } = await response.json();        

      router.push(`/telegram-auth?token=${token}`);

    } catch (error) {    try {    try {

      console.error('Error creating auth session:', error);

      setError('Failed to start authentication. Please try again.');      // Create auth session      // Create auth session

      setIsLoading(false);

    }      const response = await fetch('/api/auth/simple', {      const response = await fetch('/api/auth/session', { method: 'POST' });

  };

        method: 'POST',      const data = await response.json();

  return (

    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">        headers: {      

      <div className="max-w-md w-full space-y-8">

        <div className="text-center">          'Content-Type': 'application/json',      if (data.token) {

          <Link href="/" className="inline-flex items-center text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">

            <svg className="w-8 h-8 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">        },        // Redirect to telegram-auth page with token

              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />

              <circle cx="12" cy="12" r="2" />        body: JSON.stringify({}),        router.push(`/telegram-auth?token=${data.token}`);

              <circle cx="8" cy="8" r="1" />

              <circle cx="16" cy="8" r="1" />      });      } else {

              <circle cx="8" cy="16" r="1" />

              <circle cx="16" cy="16" r="1" />        setError('Failed to create auth session');

            </svg>

            Meetup      if (!response.ok) {      }

          </Link>

                  throw new Error('Failed to create auth session');    } catch (err) {

          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">

            Join our community      }      console.error('Authentication error:', err);

          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">      setError('Authentication failed. Please try again.');

            Sign in with Telegram to RSVP for events and connect with other members

          </p>      const { token } = await response.json();    } finally {

        </div>

            setIsLoading(false);

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 space-y-6">

          {error && (      // Redirect to telegram auth page with the token    }

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">

              <div className="flex">      router.push(`/telegram-auth?token=${token}`);  }, [router]);

                <div className="flex-shrink-0">

                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">    } catch (error) {        config: 'Server configuration error. Please try again later.',

                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />

                  </svg>      console.error('Error creating auth session:', error);        invalid: 'Invalid authentication data. Please try again.',

                </div>

                <div className="ml-3">      setError('Failed to start authentication. Please try again.');        verification: 'Verification failed. Please try again.'

                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>

                </div>      setIsLoading(false);      };

              </div>

            </div>    }      setError(errorMessages[authError as keyof typeof errorMessages] || 'Authentication failed.');

          )}

  };    }

          {isLoading ? (

            <div className="flex items-center justify-center p-8">  }, [searchParams, handleTelegramAuth]);

              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>

              <span className="ml-2 text-gray-600 dark:text-gray-400">Starting authentication...</span>  return (

            </div>

          ) : (    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">  // Handle redirect from Telegram auth

            <div className="space-y-6">

              <button      <div className="max-w-md w-full space-y-8">  useEffect(() => {

                onClick={handleTelegramLogin}

                className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"        <div className="text-center">    const telegramAuth = searchParams.get('telegram_auth');

                disabled={isLoading}

              >          <Link href="/" className="inline-flex items-center text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">    const userData = searchParams.get('user_data');

                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">

                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221c-.238.85-.852 3.14-1.204 4.163-.149.434-.442.514-.724.314-.408-.287-1.537-.978-2.142-1.384-.283-.19-.605-.428-.204-.768.401-.34 2.206-2.021 2.49-2.267.071-.062.142-.186-.03-.266-.172-.08-.408.026-.582.15-.174.124-3.29 2.08-3.666 2.321-.376.241-.752.18-1.084.05-.332-.13-1.084-.287-1.693-.485-.61-.199-.61-.485 0-.684 0 0 6.823-2.805 7.23-2.962.407-.157.723-.087.723.684z"/>            {/* Meetup Star Logo */}    const authError = searchParams.get('error');

                </svg>

                Continue with Telegram            <svg className="w-8 h-8 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">

              </button>

              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />    if (telegramAuth === 'success' && userData) {

              <div className="text-center">

                <p className="text-xs text-gray-500 dark:text-gray-400">              <circle cx="12" cy="12" r="2" />      try {

                  Click the button above and follow the instructions on the next page

                </p>              <circle cx="8" cy="8" r="1" />        const user: TelegramUser = JSON.parse(userData);

              </div>

            </div>              <circle cx="16" cy="8" r="1" />        handleTelegramAuth(user);

          )}

        </div>              <circle cx="8" cy="16" r="1" />      } catch (err) {



        <div className="text-center">              <circle cx="16" cy="16" r="1" />        console.error('Error parsing user data:', err);

          <Link 

            href="/"             </svg>        setError('Authentication failed. Please try again.');

            className="text-blue-600 hover:text-blue-500 text-sm font-medium"

          >            Meetup      }

            ← Back to events

          </Link>          </Link>    } else if (authError) {

        </div>

      </div>                const errorMessages = {

    </div>

  );          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">        config: 'Server configuration error. Please try again later.',

}

            Join our community        invalid: 'Invalid authentication data. Please try again.',

export default function SignIn() {

  return (          </h2>        verification: 'Verification failed. Please try again.'

    <Suspense fallback={<div>Loading...</div>}>

      <AuthContent />          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">      };

    </Suspense>

  );            Sign in with Telegram to RSVP for events and connect with other members      setError(errorMessages[authError as keyof typeof errorMessages] || 'Authentication failed.');

}
          </p>    }

        </div>  }, [searchParams, handleTelegramAuth]);



        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 space-y-6">  return (

          {error && (    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">      <div className="max-w-md w-full space-y-8">

              <div className="flex">        <div className="text-center">

                <div className="flex-shrink-0">          <Link href="/" className="inline-flex items-center text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">

                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">            {/* Meetup Star Logo */}

                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />            <svg className="w-8 h-8 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">

                  </svg>              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />

                </div>              <circle cx="12" cy="12" r="2" />

                <div className="ml-3">              <circle cx="8" cy="8" r="1" />

                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>              <circle cx="16" cy="8" r="1" />

                </div>              <circle cx="8" cy="16" r="1" />

              </div>              <circle cx="16" cy="16" r="1" />

            </div>            </svg>

          )}            Meetup

          </Link>

          {isLoading ? (          

            <div className="flex items-center justify-center p-8">          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">

              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>            Join our community

              <span className="ml-2 text-gray-600 dark:text-gray-400">Starting authentication...</span>          </h2>

            </div>          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">

          ) : (            Sign in with Telegram to RSVP for events and connect with other members

            <div className="space-y-6">          </p>

              <div className="text-center">        </div>

                <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">

                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="currentColor" viewBox="0 0 24 24">        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 space-y-6">

                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.569 1.825-1.595 3.593-3.061 5.296-1.756 2.04-4.581 3.775-7.387 4.357-.708.147-1.442.244-2.184.244-.75 0-1.48-.098-2.175-.244-2.808-.582-5.631-2.317-7.387-4.357C3.027 11.753 2.001 9.985 1.432 8.16c1.725-1.033 3.794-1.641 6.017-1.641 2.223 0 4.292.608 6.017 1.641z"/>          {error && (

                  </svg>            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">

                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">              <div className="flex">

                    🔐 Secure & Bot-Protected Authentication                <div className="flex-shrink-0">

                  </span>                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">

                </div>                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />

              </div>                  </svg>

                              </div>

              <button                <div className="ml-3">

                onClick={handleTelegramLogin}                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>

                className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"                </div>

                disabled={isLoading}              </div>

              >            </div>

                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">          )}

                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221c-.238.85-.852 3.14-1.204 4.163-.149.434-.442.514-.724.314-.408-.287-1.537-.978-2.142-1.384-.283-.19-.605-.428-.204-.768.401-.34 2.206-2.021 2.49-2.267.071-.062.142-.186-.03-.266-.172-.08-.408.026-.582.15-.174.124-3.29 2.08-3.666 2.321-.376.241-.752.18-1.084.05-.332-.13-1.084-.287-1.693-.485-.61-.199-.61-.485 0-.684 0 0 6.823-2.805 7.23-2.962.407-.157.723-.087.723.684z"/>

                </svg>          {isLoading ? (

                Continue with Telegram            <div className="flex items-center justify-center p-8">

              </button>              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>

              <span className="ml-2 text-gray-600 dark:text-gray-400">Authenticating...</span>

              <div className="text-center">            </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">          ) : (

                  You'll be redirected to complete authentication through our Telegram bot @meetup_auth_bot            <div className="space-y-6">

                </p>              <div className="text-center">

              </div>                <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">

            </div>                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="currentColor" viewBox="0 0 24 24">

          )}                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.569 1.825-1.595 3.593-3.061 5.296-1.756 2.04-4.581 3.775-7.387 4.357-.708.147-1.442.244-2.184.244-.75 0-1.48-.098-2.175-.244-2.808-.582-5.631-2.317-7.387-4.357C3.027 11.753 2.001 9.985 1.432 8.16c1.725-1.033 3.794-1.641 6.017-1.641 2.223 0 4.292.608 6.017 1.641z"/>

                  </svg>

          <div className="text-center">                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">

            <p className="text-xs text-gray-500 dark:text-gray-400">                    🔐 Secure & Bot-Protected Authentication

              By signing in, you agree to our{' '}                  </span>

              <Link href="/terms" className="text-blue-600 hover:text-blue-500">                </div>

                Terms of Service              </div>

              </Link>{' '}              

              and{' '}              <TelegramBotAuth 

              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">                botUsername="meetup_auth_bot"

                Privacy Policy                onAuth={handleTelegramAuth}

              </Link>                onError={(error) => setError(error)}

            </p>                className="w-full justify-center"

          </div>              />

        </div>

              <div className="text-center">

        <div className="text-center">                <p className="text-xs text-gray-500 dark:text-gray-400">

          <Link                   By signing in with Telegram, you authorize our app to access your basic profile information.

            href="/"                 </p>

            className="text-blue-600 hover:text-blue-500 text-sm font-medium"              </div>

          >            </div>

            ← Back to events          )}

          </Link>

        </div>          <div className="text-center">

      </div>            <p className="text-xs text-gray-500 dark:text-gray-400">

    </div>              By signing in, you agree to our{' '}

  );              <Link href="/terms" className="text-blue-600 hover:text-blue-500">

}                Terms of Service

              </Link>{' '}

export default function SignIn() {              and{' '}

  return (              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">

    <Suspense fallback={<div>Loading...</div>}>                Privacy Policy

      <AuthContent />              </Link>

    </Suspense>            </p>

  );          </div>

}        </div>

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