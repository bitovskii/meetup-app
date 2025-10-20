# 📸 Telegram Profile Image Implementation

## Overview

This implementation automatically fetches and stores users' profile images from Telegram during their first login/registration using the Telegram Bot API.

## ✅ What's Implemented

### 1. **Profile Photo Fetching Functions** (`src/lib/telegram-bot.ts`)

Added the following functions to fetch profile photos:

- **`getUserProfilePhotos(userId, limit)`** - Gets user's profile photos from Telegram Bot API
- **`getFile(fileId)`** - Gets file information from Telegram
- **`getTelegramFileUrl(filePath)`** - Constructs direct Telegram CDN URL
- **`getUserProfilePhotoUrl(userId)`** - Main function that gets the highest resolution profile photo URL

### 2. **Enhanced Authentication** (`src/app/api/telegram/webhook/route.ts`)

Modified the webhook to:
- Automatically fetch profile photos during authentication
- Works for both `/start` and `/auth` commands
- Graceful error handling - user creation continues even if photo fetch fails

### 3. **Database Support** (`src/lib/database.ts`)

Added:
- **`updateUserAvatar(userId, avatarUrl)`** - Updates user's avatar URL in database

### 4. **Enhanced Auth Logic** (`src/lib/auth.ts`)

Updated `authenticateTelegramUser()` to:
- Accept `photo_url` parameter
- Store avatar URL for new users  
- Update existing users' avatars if they've changed

### 5. **UI Component** (`src/components/ui/UserAvatar.tsx`)

Created a reusable avatar component with:
- Multiple sizes (sm, md, lg, xl)
- Fallback to user initials if no photo
- Error handling for broken images

## 🚀 How It Works

### User Authentication Flow with Profile Photos:

1. **User authenticates via Telegram bot**
2. **Webhook receives user data** from Telegram
3. **System fetches profile photo**:
   ```typescript
   const photoUrl = await getUserProfilePhotoUrl(from.id);
   ```
4. **User is created/updated** with profile photo URL:
   ```typescript
   const { user } = await authenticateTelegramUser({
     id: from.id,
     first_name: from.first_name,
     last_name: from.last_name,
     username: from.username,
     photo_url: photoUrl, // 📸 Telegram profile photo URL
     auth_date: Math.floor(Date.now() / 1000)
   });
   ```
5. **Profile photo is stored** in the `users.avatar_url` field
6. **User can immediately see their profile photo** throughout the app

## 📋 Database Schema

Your existing `users` table already has the `avatar_url` field:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE,
  username VARCHAR(50),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  avatar_url TEXT,  -- 📸 Profile photo URL stored here
  bio TEXT,
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  activation_method VARCHAR(20),
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎯 Usage Examples

### Display User Avatar

```tsx
import { UserAvatar } from '@/components/ui';

export function UserProfile({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-3">
      <UserAvatar 
        user={{
          full_name: user.full_name,
          avatar_url: user.avatar_url 
        }}
        size="lg"
      />
      <div>
        <h3 className="font-semibold">{user.full_name}</h3>
        <p className="text-gray-600">@{user.username}</p>
      </div>
    </div>
  );
}
```

### Avatar in Event Cards

```tsx
<UserAvatar 
  user={{ 
    full_name: event.creator.full_name,
    avatar_url: event.creator.avatar_url 
  }}
  size="sm"
  className="mr-2"
/>
```

### Navigation User Menu

```tsx
<UserAvatar 
  user={{ 
    full_name: currentUser.full_name,
    avatar_url: currentUser.avatar_url 
  }}
  size="md"
/>
```

## 🖼️ Profile Image Details

### Image URL Format

Telegram returns direct CDN URLs like:
```
https://api.telegram.org/file/bot<BOT_TOKEN>/photos/file_<ID>.jpg
```

These URLs:
- ✅ **Work directly in `<img>` tags**
- ✅ **Are served from Telegram's fast CDN**
- ✅ **Don't expire (as long as user keeps the photo)**
- ✅ **Automatically use the highest resolution available**

### Fallback Handling

The system gracefully handles cases where users don't have profile photos:

```typescript
// If no photo found
const photoUrl = await getUserProfilePhotoUrl(userId);
// photoUrl will be null if no photo exists

// UserAvatar component shows initials as fallback
{user.avatar_url ? (
  <img src={user.avatar_url} alt="Profile" />
) : (
  <div>JD</div> // User initials
)}
```

## 🔧 Technical Implementation Details

### Profile Photo Fetching Process

1. **Get user's photos**: `getUserProfilePhotos(userId, 1)`
2. **Find highest resolution**: Pick largest width from available sizes
3. **Get file path**: `getFile(fileId)` to get the file path
4. **Construct URL**: `getTelegramFileUrl(filePath)` for direct access

### Error Handling

```typescript
try {
  const photoUrl = await getUserProfilePhotoUrl(from.id);
  // Store photo URL with user
} catch (error) {
  console.error('Photo fetch failed, continuing without photo:', error);
  // User authentication continues normally
}
```

### Automatic Updates

For existing users, the system checks if their profile photo has changed:

```typescript
if (telegramData.photo_url && user.avatar_url !== telegramData.photo_url) {
  console.log('📸 Updating user avatar URL');
  await db.updateUserAvatar(user.id, telegramData.photo_url);
}
```

## 🧪 Testing

### Test Profile Photo Functionality

1. **Test with user who has a profile photo**:
   - Authenticate via Telegram bot
   - Check database: `SELECT avatar_url FROM users WHERE telegram_id = YOUR_ID;`
   - Verify photo displays in your app

2. **Test with user who has no profile photo**:
   - Use account without profile photo
   - Verify graceful fallback to initials
   - Check that `avatar_url` is `null` in database

3. **Test photo updates**:
   - Change your Telegram profile photo
   - Authenticate again
   - Verify database is updated with new photo URL

## 🎉 Benefits

After implementing this system, your users get:

- ✅ **Automatic profile photos** from their Telegram accounts
- ✅ **Familiar visual identity** throughout your app
- ✅ **Zero additional setup** required from users
- ✅ **High-quality images** (automatically uses best resolution)
- ✅ **Fast loading** (served from Telegram's CDN)
- ✅ **Graceful fallbacks** for users without photos

## � Important: Existing User Sessions

### If You Don't See Your Avatar Right Now

**The profile photo fetching was just implemented**, so:

1. **If you authenticated BEFORE this implementation** - your session doesn't have avatar data yet
2. **If you authenticate AFTER this implementation** - you'll get your profile photo automatically

### Two Ways to Get Your Avatar:

#### Option 1: Sign Out and Re-login (Recommended)
```bash
1. Click "Sign Out" in your user menu
2. Click "Sign In" again
3. Complete Telegram authentication
4. Your profile photo will be fetched and stored automatically! 📸
```

#### Option 2: Use the Debug Panel (For Testing)
Add this temporarily to your main page to refresh your current session:

```tsx
// Add to your main page component for testing
import AvatarDebugPanel from '@/components/debug/AvatarDebugPanel';

export default function HomePage() {
  return (
    <div>
      {/* Your existing content */}
      
      {/* Temporary debug panel - remove in production */}
      <AvatarDebugPanel />
    </div>
  );
}
```

The debug panel will let you:
- Check if your session has avatar data
- Refresh your avatar from Telegram without re-authenticating

## �🚀 Next Steps

Your profile photo system is now ready! 

### For Current Users:
- **Sign out and re-login** to get your profile photo

### For New Users:
- Will automatically get their Telegram profile photos during authentication

The photos will be:

1. **Fetched automatically** during first login
2. **Stored in your database** for fast access
3. **Updated automatically** if users change their Telegram photos
4. **Displayed throughout your app** using the `UserAvatar` component

**Answer to your question:** Yes! If you sign out and re-login, you will see your avatar automatically fetched from Telegram! 🎯