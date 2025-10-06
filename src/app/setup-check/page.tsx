'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const StatusIcon = ({ status }: { status: boolean }) => (
  status ? (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
);

export default function SetupCheckPage() {
  const [checkResults, setCheckResults] = useState<{
    supabaseConnection: boolean;
    googleProvider: boolean;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      setLoading(true);
      
      // Test Supabase connection
      const { error } = await supabase.auth.getSession();
      const supabaseConnection = !error;

      // Test Google provider by attempting to get OAuth URL
      let googleProvider = false;
      try {
        const { error: providerError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'http://localhost:3001/auth/callback',
            skipBrowserRedirect: true // Don't actually redirect
          }
        });
        
        // If we get a "provider not enabled" error, that's what we're checking for
        googleProvider = !providerError?.message.includes('provider is not enabled');
      } catch (err) {
        console.log('Provider check:', err);
      }

      setCheckResults({
        supabaseConnection,
        googleProvider,
        error: error?.message
      });
    } catch (err) {
      console.error('Setup check error:', err);
      setCheckResults({
        supabaseConnection: false,
        googleProvider: false,
        error: 'Failed to check setup'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Setup Status Check
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Checking your Supabase and OAuth configuration
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Checking setup...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Configuration Status</h2>
              
              {/* Supabase Connection */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <StatusIcon status={checkResults?.supabaseConnection || false} />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Supabase Connection</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {checkResults?.supabaseConnection ? 'Connected successfully' : 'Connection failed'}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  checkResults?.supabaseConnection 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {checkResults?.supabaseConnection ? 'Ready' : 'Error'}
                </span>
              </div>

              {/* Google OAuth Provider */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <StatusIcon status={checkResults?.googleProvider || false} />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Google OAuth Provider</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {checkResults?.googleProvider ? 'Provider enabled and configured' : 'Provider not enabled or misconfigured'}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  checkResults?.googleProvider 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {checkResults?.googleProvider ? 'Ready' : 'Setup Required'}
                </span>
              </div>

              {/* Setup Instructions */}
              {!checkResults?.googleProvider && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                        Google OAuth Setup Required
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                        To enable Google sign-in, you need to configure the Google OAuth provider in your Supabase dashboard.
                      </p>
                      <a
                        href="https://github.com/bitovskii/meetup-app/blob/main/GOOGLE_OAUTH_SETUP.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 underline"
                      >
                        📋 View Complete Setup Guide
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {checkResults?.supabaseConnection && checkResults?.googleProvider && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-200">
                        🎉 All Set! Authentication is Ready
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Your authentication system is properly configured and ready to use.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={checkSetup}
              disabled={loading}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Recheck Setup
            </button>
          <Link
            href="/"
            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors text-center"
          >
            Back to App
          </Link>
          </div>
        </div>
      </div>
    </div>
  );
}