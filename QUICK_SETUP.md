# 🎯 Quick Supabase Setup

Copy and paste this SQL in your **Supabase SQL Editor** (https://supabase.com/dashboard → Your Project → SQL Editor):

```sql
-- 📝 Step 1: Create Tables
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

CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGSERIAL PRIMARY KEY,
    telegram_user_id BIGINT UNIQUE NOT NULL,
    user_data JSONB NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔍 Step 2: Create Indexes
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_status ON auth_tokens(status);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_telegram_user_id ON auth_tokens(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_telegram_user_id ON user_sessions(telegram_user_id);

-- 🔒 Step 3: Enable Row Level Security
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 🛡️ Step 4: Create Security Policies
CREATE POLICY "Allow anonymous operations on auth_tokens" ON auth_tokens FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_sessions" ON user_sessions FOR ALL USING (true);

-- ⚙️ Step 5: Create Utility Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_auth_tokens_updated_at
    BEFORE UPDATE ON auth_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

## ✅ After running the SQL:

1. **Test your setup**: Visit http://localhost:3001/api/auth/telegram/test
2. **Test authentication**: Visit http://localhost:3001/auth

## 🤖 Next: Configure Telegram Bot Webhook

Once your database is set up, configure your Telegram bot webhook to point to:
```
https://your-domain.com/api/auth/telegram/webhook
```

For local development with ngrok:
```bash
ngrok http 3001
# Then set webhook to: https://your-ngrok-url.ngrok.io/api/auth/telegram/webhook
```