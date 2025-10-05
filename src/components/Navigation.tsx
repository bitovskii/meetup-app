'use client';

import { useState } from 'react';

interface NavigationProps {
  readonly activeSection: 'events' | 'groups';
  readonly onSectionChange: (section: 'events' | 'groups') => void;
}

export default function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSectionChange = (section: 'events' | 'groups') => {
    onSectionChange(section);
    setIsMenuOpen(false); // Close mobile menu when selection is made
  };
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-900/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand area */}
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-3">
              {/* Logo Icon */}
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 transform hover:scale-105 transition-transform duration-200">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                <svg className="w-6 h-6 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2M4 1h2v6h2.5l1.5 1.5L8.5 10H6V7H4V1M15 7c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1m4 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1m-8 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1M8 12.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5M12 12c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1m7 1c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1M12 16c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1m-4 1.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5M7 20c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1"/>
                </svg>
              </div>
              {/* Brand Text - Hide text on very small screens */}
              <div className="hidden sm:flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-none">
                  Meetup
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                  Connect & Discover
                </span>
              </div>
            </div>
          </div>
          
          {/* Desktop Navigation buttons - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-3">
            <button 
              className={`group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                activeSection === 'events'
                  ? 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700'
                  : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onClick={(e) => {
                e.currentTarget.blur();
                onSectionChange('events');
              }}
            >
              <svg className={`w-4 h-4 mr-2 transition-colors ${
                activeSection === 'events'
                  ? 'text-white'
                  : 'text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Events
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
            
            <button 
              className={`group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                activeSection === 'groups'
                  ? 'bg-purple-600 text-white border border-purple-600 hover:bg-purple-700 hover:border-purple-700'
                  : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onClick={(e) => {
                e.currentTarget.blur();
                onSectionChange('groups');
              }}
            >
              <svg className={`w-4 h-4 mr-2 transition-colors ${
                activeSection === 'groups'
                  ? 'text-white'
                  : 'text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Groups
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
          </div>

          {/* Mobile Hamburger Menu Button - Shown only on mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200"
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Shown when hamburger is clicked */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-b-lg border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              className={`w-full text-left group relative flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                activeSection === 'events'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => handleSectionChange('events')}
            >
              <svg className={`w-5 h-5 mr-3 transition-colors ${
                activeSection === 'events'
                  ? 'text-white'
                  : 'text-blue-600 dark:text-blue-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Events
              {activeSection === 'events' && (
                <div className="absolute right-3 w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
            
            <button
              className={`w-full text-left group relative flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ${
                activeSection === 'groups'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => handleSectionChange('groups')}
            >
              <svg className={`w-5 h-5 mr-3 transition-colors ${
                activeSection === 'groups'
                  ? 'text-white'
                  : 'text-purple-600 dark:text-purple-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Groups
              {activeSection === 'groups' && (
                <div className="absolute right-3 w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}