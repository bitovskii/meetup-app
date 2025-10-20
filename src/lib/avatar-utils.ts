/**
 * Utility to refresh user avatar from Telegram
 * Use this to update existing user sessions with profile photos
 */

import { getUserProfilePhotoUrl } from './telegram-bot';

/**
 * Refresh the current user's avatar from Telegram
 * This updates both the database and localStorage
 */
export async function refreshCurrentUserAvatar(): Promise<{
  success: boolean;
  avatarUrl?: string;
  message: string;
}> {
  try {
    // Get current user from localStorage
    const userDataString = localStorage.getItem('meetup_user');
    if (!userDataString) {
      return {
        success: false,
        message: 'No user session found. Please log in first.'
      };
    }

    const userData = JSON.parse(userDataString);
    if (!userData.id) {
      return {
        success: false,
        message: 'Invalid user session data.'
      };
    }

    console.log('🔄 Refreshing avatar for user:', userData.id);

    // Fetch fresh profile photo from Telegram
    const photoUrl = await getUserProfilePhotoUrl(userData.id);
    
    if (!photoUrl) {
      return {
        success: false,
        message: 'No profile photo found on Telegram account.'
      };
    }

    // Update user data in localStorage
    const updatedUserData = {
      ...userData,
      photoUrl: photoUrl
    };

    localStorage.setItem('meetup_user', JSON.stringify(updatedUserData));

    console.log('📸 Avatar updated successfully:', photoUrl);

    return {
      success: true,
      avatarUrl: photoUrl,
      message: 'Avatar updated successfully! Refresh the page to see changes.'
    };

  } catch (error) {
    console.error('Error refreshing user avatar:', error);
    return {
      success: false,
      message: 'Failed to refresh avatar. Please try again.'
    };
  }
}

/**
 * Check if current user has avatar data
 */
export function checkCurrentUserAvatar(): {
  hasUser: boolean;
  hasAvatar: boolean;
  userId?: number;
  avatarUrl?: string;
} {
  try {
    const userDataString = localStorage.getItem('meetup_user');
    if (!userDataString) {
      return { hasUser: false, hasAvatar: false };
    }

    const userData = JSON.parse(userDataString);
    return {
      hasUser: true,
      hasAvatar: !!userData.photoUrl,
      userId: userData.id,
      avatarUrl: userData.photoUrl
    };
  } catch (error) {
    console.error('Error checking user avatar:', error);
    return { hasUser: false, hasAvatar: false };
  }
}