'use client';

import { useState } from 'react';
import { checkCurrentUserAvatar, refreshCurrentUserAvatar } from '@/lib/avatar-utils';

export default function AvatarDebugPanel() {
  const [status, setStatus] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkStatus = () => {
    const result = checkCurrentUserAvatar();
    setStatus(JSON.stringify(result, null, 2));
  };

  const refreshAvatar = async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshCurrentUserAvatar();
      setStatus(JSON.stringify(result, null, 2));
      
      if (result.success) {
        // Force page reload to see the changes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      setStatus(`Error: ${error}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-md">
      <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">🔧 Avatar Debug Panel</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={checkStatus}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
        >
          Check Avatar Status
        </button>
        
        <button
          onClick={refreshAvatar}
          disabled={isRefreshing}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-2 rounded text-sm"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Avatar from Telegram'}
        </button>
      </div>
      
      {status && (
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs">
          <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 overflow-x-auto">
            {status}
          </pre>
        </div>
      )}
      
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
        Use this panel to debug and refresh your profile avatar. Remove this component in production.
      </p>
    </div>
  );
}