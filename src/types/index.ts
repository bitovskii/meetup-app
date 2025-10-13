// Database interfaces for Events and Groups
export interface DatabaseEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  place: string;
  members: number;
  image: string;
  creator_id: string;
  group_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  members: number;
  image: string;
  created_at: string;
  updated_at: string;
}

// Client-side Event interface (for backwards compatibility)
export interface Event {
  readonly id?: string;
  readonly image: string;
  readonly title: string;
  readonly date: string;
  readonly time: string;
  readonly place: string;
  readonly description: string;
  readonly members: number;
  readonly creator_id?: string;
  readonly group_id?: string;
  readonly created_at?: string;
  readonly updated_at?: string;
}

// Form interfaces for creating/editing
export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  time: string;
  place: string;
  image: string;
  group_id?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

// Authentication types
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  provider: 'telegram';
  loginTime?: number;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (userData: TelegramUser, provider: 'telegram') => void;
  signOut: () => void;
  isAuthenticated: boolean;
}

// Auth token types for deep link authentication
export interface AuthToken {
  id: string;
  token: string;
  user_id?: string;
  telegram_user_id?: number;
  telegram_username?: string;
  telegram_first_name?: string;
  telegram_last_name?: string;
  telegram_photo_url?: string;
  is_used: boolean;
  expires_at: string;
  created_at: string;
  used_at?: string;
}

export interface TelegramAuthParams {
  id: string;
  username?: string;
  first_name: string;
  last_name?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
}

export interface AuthTokenResponse {
  success: boolean;
  data?: {
    token: string;
    deepLink: string;
    expiresAt: string;
  };
  error?: string;
}

export interface AuthValidationResponse {
  success: boolean;
  data?: {
    status: 'pending' | 'success' | 'failed';
    user?: {
      id: number;
      username?: string;
      first_name: string;
      last_name?: string;
      photo_url?: string;
      auth_date: number;
    };
  };
  error?: string;
}