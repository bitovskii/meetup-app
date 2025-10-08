'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

type AuthProvider = 'telegram';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface User {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  provider: AuthProvider;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (userData: TelegramUser, provider: AuthProvider) => void;
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on load
    const savedUser = localStorage.getItem('meetup_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        setUser(parsedUser);
      } catch (error: unknown) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('meetup_user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = (userData: TelegramUser, provider: AuthProvider) => {
    if (provider === 'telegram') {
      const user: User = {
        id: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        username: userData.username,
        photoUrl: userData.photo_url,
        provider: 'telegram'
      };
      
      setUser(user);
      localStorage.setItem('meetup_user', JSON.stringify(user));
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('meetup_user');
  };

  const value = useMemo<AuthContextType>(() => ({
    user,
    isLoading,
    signIn,
    signOut,
    isAuthenticated: !!user
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
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

export type { User };