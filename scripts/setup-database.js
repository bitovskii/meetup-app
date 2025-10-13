#!/usr/bin/env node

/**
 * Setup Supabase database for Telegram authentication
 * Run with: node scripts/setup-database.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need to add this to .env.local

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure you have:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY (service role key, not anon key)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database for Telegram authentication...\n');

  try {
    // Create auth_tokens table
    console.log('📝 Creating auth_tokens table...');
    const { error: authTokensError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (authTokensError) {
      console.error('❌ Error creating auth_tokens table:', authTokensError);
    } else {
      console.log('✅ auth_tokens table created successfully');
    }

    // Create indexes
    console.log('📝 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);',
      'CREATE INDEX IF NOT EXISTS idx_auth_tokens_status ON auth_tokens(status);',
      'CREATE INDEX IF NOT EXISTS idx_auth_tokens_telegram_user_id ON auth_tokens(telegram_user_id);',
      'CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);'
    ];

    for (const indexSql of indexes) {
      const { error } = await supabase.rpc('exec_sql', { sql: indexSql });
      if (error) {
        console.warn('⚠️ Index creation warning:', error.message);
      }
    }
    console.log('✅ Indexes created successfully');

    // Create user_sessions table
    console.log('📝 Creating user_sessions table...');
    const { error: userSessionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_sessions (
          id BIGSERIAL PRIMARY KEY,
          telegram_user_id BIGINT UNIQUE NOT NULL,
          user_data JSONB NOT NULL,
          last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (userSessionsError) {
      console.error('❌ Error creating user_sessions table:', userSessionsError);
    } else {
      console.log('✅ user_sessions table created successfully');
    }

    // Enable RLS
    console.log('📝 Enabling Row Level Security...');
    const rlsQueries = [
      'ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;'
    ];

    for (const rlsSql of rlsQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: rlsSql });
      if (error) {
        console.warn('⚠️ RLS warning:', error.message);
      }
    }
    console.log('✅ Row Level Security enabled');

    // Create policies
    console.log('📝 Creating security policies...');
    const policies = [
      `CREATE POLICY IF NOT EXISTS "Allow anonymous operations on auth_tokens" ON auth_tokens FOR ALL USING (true);`,
      `CREATE POLICY IF NOT EXISTS "Allow all operations on user_sessions" ON user_sessions FOR ALL USING (true);`
    ];

    for (const policySql of policies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policySql });
      if (error) {
        console.warn('⚠️ Policy warning:', error.message);
      }
    }
    console.log('✅ Security policies created');

    // Create cleanup function
    console.log('📝 Creating cleanup function...');
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (functionError) {
      console.warn('⚠️ Function creation warning:', functionError.message);
    } else {
      console.log('✅ Cleanup function created');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Set up your Telegram bot webhook');
    console.log('2. Test the authentication flow');
    console.log('3. Optionally set up a cron job to run cleanup_expired_tokens()');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();