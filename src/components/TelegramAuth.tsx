'use client';

import { useEffect, useRef, useState } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramAuthProps {
  botName: string;
  onAuth: (user: TelegramUser) => void;
  onError: (error: string) => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function TelegramAuth({ 
  botName, 
  onAuth, 
  onError, 
  size = 'large',
  className = '' 
}: Readonly<TelegramAuthProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Create global callback function
    (window as unknown as { onTelegramAuth: (user: TelegramUser) => Promise<void> }).onTelegramAuth = async (user: TelegramUser) => {
      try {
        console.log('Telegram auth received:', user);
        onAuth(user);
      } catch (error) {
        console.error('Telegram auth error:', error);
        onError('Authentication failed');
      }
    };

    // Load Telegram widget script with debugging
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'meetup_auth_bot');
    script.setAttribute('data-size', size);
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'true'); // Enable user profile picture
    script.async = true;

    console.log('Loading Telegram widget with bot:', 'meetup_auth_bot');

    script.onload = () => {
      console.log('Telegram widget script loaded successfully');
      setIsLoading(false);
    };

    script.onerror = (error: Event | string) => {
      console.error('Failed to load Telegram widget script:', error);
      setIsLoading(false);
      onError('Failed to load Telegram widget');
    };

    const container = containerRef.current;
    if (container) {
      container.appendChild(script);
    }

    return () => {
      // Cleanup
      if (container && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete (window as unknown as { onTelegramAuth?: unknown }).onTelegramAuth;
    };
  }, [botName, onAuth, onError, size]);

  return (
    <div className={`telegram-auth-container ${className}`}>
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-600">Loading Telegram widget...</span>
        </div>
      )}
      <div 
        ref={containerRef}
        className="flex justify-center items-center"
        aria-label="Telegram authentication widget"
        style={{ minHeight: isLoading ? '60px' : 'auto' }}
      />
    </div>
  );
}

export type { TelegramUser };