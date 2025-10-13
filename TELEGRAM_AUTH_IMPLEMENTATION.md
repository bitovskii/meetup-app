# Telegram Deep Link Authentication Implementation

## Overview

We've successfully implemented a **Telegram deep link authentication system** similar to the one used by tgstat.ru. This system generates secure, short-lived authentication tokens that enable seamless user authentication through Telegram without requiring a Telegram login widget.

## Architecture

### 🔧 Core Components

1. **`TelegramDeepLinkAuth`** - React component that handles the authentication flow
2. **`useTelegramAuth`** - Custom hook for token management and polling
3. **API Routes** - Backend endpoints for token generation, validation, and webhook handling
4. **Supabase Integration** - Database storage for auth tokens with TTL

### 📁 File Structure

```
src/
├── components/auth/
│   ├── TelegramDeepLinkAuth.tsx    # Main auth component
│   └── index.ts                    # Barrel exports
├── hooks/
│   ├── useTelegramAuth.ts          # Authentication hook
│   └── index.ts                    # Hook exports
├── lib/
│   └── auth-utils.ts               # Token generation utilities
├── app/api/auth/telegram/
│   ├── generate/route.ts           # Token generation endpoint
│   ├── validate/route.ts           # Token validation endpoint
│   └── webhook/route.ts            # Telegram bot webhook
└── app/auth/
    └── page.tsx                    # Authentication page
```

## 🚀 How It Works

### Step 1: Token Generation
When a user clicks "Continue with Telegram":
1. Frontend calls `/api/auth/telegram/generate`
2. Server generates a secure random token (32 chars)
3. Token is stored in Supabase with 2-minute expiration
4. Deep link URL is created: `https://t.me/your_bot?start=TOKEN`

### Step 2: User Interaction
1. User is redirected to Telegram with the deep link
2. User starts conversation with the bot
3. Bot receives the token and user information via webhook

### Step 3: Token Validation
1. Frontend polls `/api/auth/telegram/validate?token=TOKEN` every 2 seconds
2. Once user authenticates in Telegram, server validates and returns user data
3. User is signed in and redirected to the main application

## 🔑 Environment Variables

Add these to your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Telegram Bot Configuration  
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_BOT_USERNAME=your_bot_username
```

## 🗄️ Database Setup

### Supabase Migration

Run this SQL in your Supabase SQL editor:

```sql
-- Create auth_tokens table
CREATE TABLE IF NOT EXISTS auth_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    user_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_status ON auth_tokens(status);

-- Enable Row Level Security
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed)
CREATE POLICY "Allow all operations on auth_tokens" ON auth_tokens
    FOR ALL USING (true);

-- Optional: Create function to auto-delete expired tokens
CREATE OR REPLACE FUNCTION delete_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM auth_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

## 🤖 Telegram Bot Setup

### 1. Create Bot with BotFather

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` and follow instructions
3. Save your bot token and username

### 2. Configure Webhook

Set up the webhook URL in BotFather:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-domain.com/api/auth/telegram/webhook"}'
```

### 3. Bot Commands (Optional)

Configure bot commands with BotFather:

```
start - Begin authentication process
help - Show help information
```

## 🔒 Security Features

1. **Token Expiration**: All tokens expire after 2 minutes
2. **Single Use**: Tokens are invalidated after first use
3. **Secure Generation**: Cryptographically secure random tokens
4. **Rate Limiting**: Built-in protection against spam (consider adding more)
5. **Validation**: Telegram signature verification for webhook requests

## 🧪 Testing

### Local Development

1. Start the development server: `npm run dev`
2. Navigate to `/auth` page
3. Click "Continue with Telegram"
4. Test the deep link generation and polling

### Production Checklist

- [ ] Configure Supabase production database
- [ ] Set up Telegram bot webhook with HTTPS URL
- [ ] Add proper environment variables
- [ ] Test deep link generation and validation
- [ ] Verify webhook receives Telegram updates

## 🔄 API Endpoints

### `POST /api/auth/telegram/generate`
Generates a new authentication token and deep link.

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "abc123...",
    "deepLink": "https://t.me/your_bot?start=abc123...",
    "expiresAt": "2024-01-01T12:02:00Z"
  }
}
```

### `GET /api/auth/telegram/validate?token=TOKEN`
Validates a token and returns user data if authenticated.

**Response (pending):**
```json
{
  "success": true,
  "data": { "status": "pending" }
}
```

**Response (success):**
```json
{
  "success": true,
  "data": {
    "status": "success",
    "user": {
      "id": 123456789,
      "first_name": "John",
      "username": "johndoe",
      // ... other user data
    }
  }
}
```

### `POST /api/auth/telegram/webhook`
Handles incoming Telegram bot updates.

## 🎯 Next Steps

1. **Set up Supabase database** with the migration above
2. **Configure Telegram bot** and webhook
3. **Add environment variables** to `.env.local`
4. **Test the complete flow** from token generation to user authentication
5. **Deploy to production** and update webhook URL

## 🔗 Deep Link Format

The generated deep links follow this pattern:
```
https://t.me/{BOT_USERNAME}?start={SECURE_TOKEN}
```

Example: `https://t.me/meetup_auth_bot?start=YI9j5jN9F9MmrmcM0JEn8gNqPAQn8mru`

## 🎨 UI/UX Features

- **Real-time Status Updates**: Shows loading, error, and success states
- **Auto-polling**: Automatically checks for authentication completion
- **Responsive Design**: Works on all device sizes
- **Dark Mode Support**: Consistent with app theme
- **Error Handling**: User-friendly error messages
- **Timeout Handling**: Graceful handling of expired tokens

---

**Status:** ✅ Implementation Complete - Ready for Database Setup and Bot Configuration