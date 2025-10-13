/**
 * Application constants
 */

export const APP_CONFIG = {
  name: 'Meetup',
  description: 'Connect with Your Community',
  sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  localStorageKeys: {
    user: 'meetup_user'
  }
} as const;

export const ROUTES = {
  home: '/',
  auth: '/auth',
  telegramAuth: '/telegram-auth'
} as const;

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;