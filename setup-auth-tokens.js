const { createClient } = require('@supabase/supabase-js');

async function setupDatabase() {
  // For this script, use the environment variables directly from Vercel/production
  const supabaseUrl = 'https://zqmwdmvqgjsikupivnmi.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here';

  if (!supabaseUrl || !supabaseKey || supabaseKey === 'your-service-role-key-here') {
    console.error('❌ Missing Supabase credentials');
    console.log('Please set SUPABASE_SERVICE_ROLE_KEY environment variable');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔧 Setting up auth_tokens table...');

  try {
    // Create the table
    const { error } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS auth_tokens (
          id SERIAL PRIMARY KEY,
          token VARCHAR(255) UNIQUE NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'expired')),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          user_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
        CREATE INDEX IF NOT EXISTS idx_auth_tokens_status ON auth_tokens(status);
        CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);
        CREATE INDEX IF NOT EXISTS idx_auth_tokens_created_at ON auth_tokens(created_at);
      `
    });

    if (error) {
      console.error('❌ Failed to create table:', error);
      return;
    }

    console.log('✅ auth_tokens table created successfully!');

    // Test the table
    const { data: testData, error: testError } = await supabase
      .from('auth_tokens')
      .select('count(*)');

    if (testError) {
      console.error('❌ Failed to test table:', testError);
      return;
    }

    console.log('✅ Table test successful:', testData);

  } catch (err) {
    console.error('❌ Setup failed:', err);
  }
}

setupDatabase();