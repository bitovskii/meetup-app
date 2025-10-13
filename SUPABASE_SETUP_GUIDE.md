# 🚀 Supabase Database Setup for Telegram Authentication

This guide will help you set up the Supabase database for your Telegram authentication system.

## 📋 Prerequisites

- ✅ Supabase project created
- ✅ Environment variables configured in `.env.local`
- ✅ Telegram bot created with @BotFather

## 🗄️ Database Setup

### Step 1: Create Tables

Go to your **Supabase SQL Editor** and run this SQL:

```sql
-- Create auth_tokens table for temporary authentication tokens
CREATE TABLE IF NOT EXISTS auth_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'expired', 'failed')),
    user_data JSONB,
    telegram_user_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table for storing user sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGSERIAL PRIMARY KEY,
    telegram_user_id BIGINT UNIQUE NOT NULL,
    user_data JSONB NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Step 2: Create Indexes

```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_status ON auth_tokens(status);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_telegram_user_id ON auth_tokens(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_telegram_user_id ON user_sessions(telegram_user_id);
```

### Step 3: Enable Row Level Security

```sql
-- Enable Row Level Security
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
```

### Step 4: Create Security Policies

```sql
-- Create policies for auth_tokens table
CREATE POLICY "Allow anonymous operations on auth_tokens" ON auth_tokens
    FOR ALL 
    USING (true);

-- Create policies for user_sessions table  
CREATE POLICY "Allow all operations on user_sessions" ON user_sessions
    FOR ALL 
    USING (true);
```

### Step 5: Create Utility Functions

```sql
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_auth_tokens_updated_at
    BEFORE UPDATE ON auth_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM auth_tokens 
    WHERE expires_at < NOW() 
    OR (status = 'pending' AND created_at < NOW() - INTERVAL '5 minutes');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

## 🧪 Test Your Setup

### Option 1: Use the Test Endpoint

Visit: `http://localhost:3001/api/auth/telegram/test`

This will run automated tests to verify:
- ✅ Database connection
- ✅ Token creation
- ✅ Token retrieval  
- ✅ Environment variables

### Option 2: Manual Test

1. **Generate a token:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/telegram/generate
   ```

2. **Check token status:**
   ```bash
   curl "http://localhost:3001/api/auth/telegram/validate?token=YOUR_TOKEN"
   ```

## 🤖 Telegram Bot Setup

### Step 1: Set Webhook

Replace `YOUR_BOT_TOKEN` and `YOUR_DOMAIN` with your actual values:

```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://YOUR_DOMAIN/api/auth/telegram/webhook",
       "allowed_updates": ["message"]
     }'
```

For local development, you can use ngrok:
```bash
# Install ngrok and run:
ngrok http 3001

# Then use the ngrok URL:
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://YOUR_NGROK_URL.ngrok.io/api/auth/telegram/webhook"
     }'
```

### Step 2: Test Bot

1. Start a chat with your bot: `https://t.me/YOUR_BOT_USERNAME`
2. Send: `/start test_token_123`
3. Check your webhook logs

## 🔧 Environment Variables Checklist

Make sure your `.env.local` has:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Telegram
TELEGRAM_BOT_TOKEN=123456789:your_bot_token
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username

# Optional: For production
NEXT_PUBLIC_APP_DOMAIN=https://your-domain.com
```

## 🎯 Authentication Flow

1. **User clicks "Continue with Telegram"**
2. **Token generated** and stored in `auth_tokens` table
3. **Deep link created**: `https://t.me/your_bot?start=TOKEN`
4. **User redirected** to Telegram
5. **User starts bot** with the token
6. **Webhook receives** the `/start` command
7. **Token updated** with user data
8. **Frontend polls** for completion
9. **User authenticated** and redirected

## 🔄 Maintenance

### Clean Up Expired Tokens

Run this periodically (daily recommended):

```sql
SELECT cleanup_expired_tokens();
```

### Monitor Token Usage

```sql
SELECT 
    status,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_completion_time_seconds
FROM auth_tokens 
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY status;
```

## 🚨 Troubleshooting

### Common Issues

1. **"Table doesn't exist"**
   - Run the SQL setup commands in Supabase SQL Editor

2. **"Permission denied"**
   - Check RLS policies are created correctly

3. **"Webhook not receiving updates"**
   - Verify webhook URL is accessible
   - Check Telegram bot token is correct

4. **"Token validation fails"**
   - Ensure token format is correct (32 hex characters)
   - Check token hasn't expired (2 minutes)

### Debug Commands

```sql
-- Check recent tokens
SELECT * FROM auth_tokens ORDER BY created_at DESC LIMIT 10;

-- Check table structure
\d auth_tokens
\d user_sessions

-- Check policies
SELECT * FROM pg_policies WHERE tablename IN ('auth_tokens', 'user_sessions');
```

## ✅ Ready to Go!

Once you've completed all steps:

1. ✅ Database tables created
2. ✅ Test endpoint passes all checks
3. ✅ Telegram webhook configured
4. ✅ Environment variables set

Your Telegram deep link authentication system is ready! 🎉

Visit your auth page: `http://localhost:3001/auth`