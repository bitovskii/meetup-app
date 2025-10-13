import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types';

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: Readonly<UserMenuProps>) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    setIsUserMenuOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-expanded={isUserMenuOpen}
        aria-haspopup="true"
      >
        {user.photoUrl ? (
          <div className="relative">
            <Image 
              src={user.photoUrl} 
              alt="Profile" 
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {user.firstName || 'User'}
        </span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isUserMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
              <div className="font-medium">{user.firstName} {user.lastName}</div>
              {user.username && (
                <div className="text-gray-500 dark:text-gray-400">@{user.username}</div>
              )}
              <div className="text-xs text-blue-600 dark:text-blue-400 capitalize">
                via {user.provider}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}