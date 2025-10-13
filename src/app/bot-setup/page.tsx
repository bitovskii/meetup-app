'use client';

import { useState } from 'react';

interface BotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
}

interface SetupResponse {
  success: boolean;
  message?: string;
  error?: string;
  botInfo?: BotInfo;
  webhookUrl?: string;
  commandsSet?: boolean;
}

export default function BotSetupPage() {
  const [setupResult, setSetupResult] = useState<SetupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  const handleSetup = async (action: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/telegram/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          webhookUrl: webhookUrl || undefined
        }),
      });

      const result: SetupResponse = await response.json();
      setSetupResult(result);
    } catch (error) {
      setSetupResult({
        success: false,
        error: 'Failed to connect to API'
      });
    } finally {
      setLoading(false);
    }
  };

  const quickSetup = () => {
    const defaultWebhook = `${window.location.origin}/api/auth/telegram/webhook`;
    setWebhookUrl(defaultWebhook);
    handleSetup('setup');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Telegram Bot Setup
          </h1>

          <div className="space-y-6">
            {/* Quick Setup Section */}
            <div className="border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6 bg-blue-50 dark:bg-blue-900/20">
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
                🚀 Quick Setup
              </h2>
              <p className="text-blue-800 dark:text-blue-200 mb-4">
                This will automatically configure your bot with the correct webhook URL and commands.
              </p>
              <button
                onClick={quickSetup}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Setting up...' : 'Setup Bot Now'}
              </button>
            </div>

            {/* Manual Setup Section */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Manual Setup
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Webhook URL (optional - will use default if empty)
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder={`${window.location.origin}/api/auth/telegram/webhook`}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleSetup('getBotInfo')}
                    disabled={loading}
                    className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                  >
                    Get Bot Info
                  </button>
                  
                  <button
                    onClick={() => handleSetup('setWebhook')}
                    disabled={loading || !webhookUrl}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg"
                  >
                    Set Webhook
                  </button>
                  
                  <button
                    onClick={() => handleSetup('setCommands')}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg"
                  >
                    Set Commands
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            {setupResult && (
              <div className={`border rounded-lg p-6 ${
                setupResult.success 
                  ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20' 
                  : 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
              }`}>
                <h3 className={`text-lg font-semibold mb-3 ${
                  setupResult.success 
                    ? 'text-green-900 dark:text-green-100' 
                    : 'text-red-900 dark:text-red-100'
                }`}>
                  {setupResult.success ? '✅ Success' : '❌ Error'}
                </h3>
                
                {setupResult.message && (
                  <p className={`mb-3 ${
                    setupResult.success 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {setupResult.message}
                  </p>
                )}
                
                {setupResult.error && (
                  <p className="text-red-800 dark:text-red-200 mb-3">
                    {setupResult.error}
                  </p>
                )}

                {setupResult.botInfo && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Bot Information:</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li><strong>Name:</strong> {setupResult.botInfo.first_name}</li>
                      <li><strong>Username:</strong> @{setupResult.botInfo.username}</li>
                      <li><strong>ID:</strong> {setupResult.botInfo.id}</li>
                      <li><strong>Can Join Groups:</strong> {setupResult.botInfo.can_join_groups ? 'Yes' : 'No'}</li>
                    </ul>
                  </div>
                )}

                {setupResult.webhookUrl && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Webhook URL:</h4>
                    <code className="text-sm text-blue-600 dark:text-blue-400 break-all">
                      {setupResult.webhookUrl}
                    </code>
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
                📋 Setup Instructions
              </h3>
              <ol className="text-yellow-800 dark:text-yellow-200 space-y-2 text-sm">
                <li><strong>1.</strong> Make sure your TELEGRAM_BOT_TOKEN is set in environment variables</li>
                <li><strong>2.</strong> Click "Setup Bot Now" for automatic configuration</li>
                <li><strong>3.</strong> If using a custom domain, update the webhook URL first</li>
                <li><strong>4.</strong> For local development, use ngrok to expose your webhook endpoint</li>
                <li><strong>5.</strong> Test the bot by sending a message to your bot on Telegram</li>
              </ol>
            </div>

            {/* Test Deep Link */}
            <div className="bg-gray-50 dark:bg-gray-800 border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                🔗 Test Deep Link
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                After setup, test your authentication flow:
              </p>
              <a
                href="/auth"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Go to Auth Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}