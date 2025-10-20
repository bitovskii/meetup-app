import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/database';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test basic database operations
    const results = {
      connection: false,
      tables: [] as string[],
      sampleData: {
        users: 0,
        events: 0,
        groups: 0,
        sessions: 0
      },
      errors: [] as string[]
    };

    // Test 1: Check if we can connect and get table list
    try {
      // Use a simpler approach to check tables
      const { data: users, error: usersError } = await supabaseAdmin
        .from('users')
        .select('count', { count: 'exact', head: true });
      
      const { data: events, error: eventsError } = await supabaseAdmin
        .from('events')
        .select('count', { count: 'exact', head: true });
      
      if (!usersError && !eventsError) {
        results.connection = true;
        results.tables = ['users', 'events', 'groups', 'user_sessions'];
      } else {
        results.errors.push(`Connection test failed: ${usersError?.message || eventsError?.message}`);
      }
    } catch (error) {
      results.errors.push(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 2: Count records in each table
    if (results.connection) {
      try {
        const { data: usersData, error: usersError } = await supabaseAdmin
          .from('users')
          .select('count', { count: 'exact', head: true });
        
        if (!usersError) {
          results.sampleData.users = usersData?.length || 0;
        }
      } catch (error) {
        results.errors.push(`Users count error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }

      try {
        const { data: eventsData, error: eventsError } = await supabaseAdmin
          .from('events')
          .select('count', { count: 'exact', head: true });
        
        if (!eventsError) {
          results.sampleData.events = eventsData?.length || 0;
        }
      } catch (error) {
        results.errors.push(`Events count error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }

      try {
        const { data: groupsData, error: groupsError } = await supabaseAdmin
          .from('groups')
          .select('count', { count: 'exact', head: true });
        
        if (!groupsError) {
          results.sampleData.groups = groupsData?.length || 0;
        }
      } catch (error) {
        results.errors.push(`Groups count error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }

      try {
        const { data: sessionsData, error: sessionsError } = await supabaseAdmin
          .from('user_sessions')
          .select('count', { count: 'exact', head: true });
        
        if (!sessionsError) {
          results.sampleData.sessions = sessionsData?.length || 0;
        }
      } catch (error) {
        results.errors.push(`Sessions count error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: 'fbwrldsvatlvywukdohe.supabase.co',
      ...results
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}