'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import type { NavigationProps, NavigationSection } from '@/types';

export default function Navigation({ activeSection, onSectionChange }: Readonly<NavigationProps>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();

  // Debug logging for user data
  console.log('Navigation: user object:', user);
  console.log('Navigation: user photoUrl:', user?.photoUrl);
  console.log('Navigation: isAuthenticated:', isAuthenticated);

  const handleSectionChange = (section: NavigationSection) => {
    onSectionChange(section);
    setIsMenuOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Custom Meetup logo */}
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.27L5.82 21L7 14L2 9L8.91 8.26L12 2Z" opacity="0.8"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
              <circle cx="8" cy="8" r="1.5" fill="currentColor" opacity="0.6"/>
              <circle cx="16" cy="8" r="1.5" fill="currentColor" opacity="0.6"/>
              <circle cx="8" cy="16" r="1.5" fill="currentColor" opacity="0.6"/>
              <circle cx="16" cy="16" r="1.5" fill="currentColor" opacity="0.6"/>
            </svg>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">Meetup</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation tabs */}
            <div className="flex space-x-8" role="tablist" aria-label="Section navigation">
              <button 
                className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === 'events'
                    ? 'border-orange-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => onSectionChange('events')}
                role="tab"
                aria-selected={activeSection === 'events'}
                aria-controls="events-panel"
              >
                Events
              </button>
              
              {/* Groups tab hidden for now */}
              {/* <button 
                className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === 'groups'
                    ? 'border-orange-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => onSectionChange('groups')}
                role="tab"
                aria-selected={activeSection === 'groups'}
                aria-controls="groups-panel"
              >
                Groups
              </button> */}
            </div>

            {/* Authentication section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  {user?.photoUrl ? (
                    <div className="relative">
                      <Image 
                        src={user.photoUrl} 
                        alt="Profile" 
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          console.error('Navigation: Failed to load profile image:', user.photoUrl, e);
                        }}
                        onLoad={() => {
                          console.log('Navigation: Profile image loaded successfully:', user.photoUrl);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.firstName || 'User'}
                  </span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                        <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                        {user?.username && (
                          <div className="text-gray-500 dark:text-gray-400">@{user.username}</div>
                        )}
                        <div className="text-xs text-blue-600 dark:text-blue-400 capitalize">
                          via {user?.provider}
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
            ) : (
              <Link 
                href="/auth"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1" role="menu" aria-orientation="vertical">
              <button
                className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md ${
                  activeSection === 'events'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => handleSectionChange('events')}
                role="menuitem"
              >
                Events
              </button>
              
              {/* Groups hidden for now */}
              {/* <button
                className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md ${
                  activeSection === 'groups'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => handleSectionChange('groups')}
                role="menuitem"
              >
                Groups
              </button> */}

              {/* Mobile authentication section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center px-3 py-2">
                      {user?.photoUrl ? (
                        <Image 
                          src={user.photoUrl} 
                          alt="Profile" 
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-medium">
                            {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 capitalize">
                          via {user?.provider}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-md"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/auth"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}