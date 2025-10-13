-- Telegram Authentication Tables Setup
-- Run this SQL in your Supabase SQL Editor

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_status ON auth_tokens(status);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_telegram_user_id ON auth_tokens(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);

-- Enable Row Level Security
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for auth_tokens table
CREATE POLICY "Allow anonymous read for pending tokens" ON auth_tokens
    FOR SELECT 
    USING (status = 'pending' OR status = 'success');

CREATE POLICY "Allow anonymous insert" ON auth_tokens
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow anonymous update for status changes" ON auth_tokens
    FOR UPDATE 
    USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_auth_tokens_updated_at
    BEFORE UPDATE ON auth_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired tokens (call this periodically)
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

-- Optional: Create a table for storing user sessions (if needed later)
CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGSERIAL PRIMARY KEY,
    telegram_user_id BIGINT UNIQUE NOT NULL,
    user_data JSONB NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_telegram_user_id ON user_sessions(telegram_user_id);

-- Enable RLS for user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for user_sessions
CREATE POLICY "Allow authenticated users to read their own sessions" ON user_sessions
    FOR ALL 
    USING (true); -- Adjust this based on your auth requirements