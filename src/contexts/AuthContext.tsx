'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import type { TelegramUser, User, AuthContextType } from '@/types';
import { APP_CONFIG } from '@/lib/constants';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(APP_CONFIG.localStorageKeys.user);
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        
        const isSessionValid = parsedUser.loginTime && 
          (Date.now() - parsedUser.loginTime) < APP_CONFIG.sessionDuration;

        if (isSessionValid) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem(APP_CONFIG.localStorageKeys.user);
        }
      } catch {
        localStorage.removeItem(APP_CONFIG.localStorageKeys.user);
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = (userData: TelegramUser, provider: 'telegram') => {
    const user: User = {
      id: userData.id,
      firstName: userData.first_name,
      lastName: userData.last_name,
      username: userData.username,
      photoUrl: userData.photo_url,
      provider,
      loginTime: Date.now()
    };

    setUser(user);
    localStorage.setItem(APP_CONFIG.localStorageKeys.user, JSON.stringify(user));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(APP_CONFIG.localStorageKeys.user);
  };

  const contextValue = useMemo(() => ({
    user,
    isLoading,
    signIn,
    signOut,
    isAuthenticated: !!user
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}