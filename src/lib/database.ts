import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client with fallback values to prevent deployment errors
const supabaseAdmin = (() => {
  if (supabaseUrl && supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey);
  } else {
    console.warn('Supabase environment variables not found. Database operations will be disabled.');
    // Return a placeholder client that won't cause deployment failures
    return createClient(
      'https://placeholder.supabase.co', 
      'placeholder-service-key'
    );
  }
})();

export { supabaseAdmin };

// Database connection utility for direct queries
export class DatabaseService {
  private readonly client = supabaseAdmin;

  // User operations
  async createUser(userData: {
    telegram_id?: number;
    username?: string;
    full_name: string;
    email?: string;
    avatar_url?: string;
    activation_method?: string;
  }) {
    const { data, error } = await this.client
      .from('users')
      .insert({
        ...userData,
        status: 'active', // Auto-activate users
        email_verified: false,
        phone_verified: false,
        last_login_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserByTelegramId(telegramId: number) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .eq('status', 'active')
      .single();
    
    return { data, error };
  }

  async getUserById(userId: string) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('status', 'active')
      .single();
    
    return { data, error };
  }

  async updateUserLastLogin(userId: string) {
    const { error } = await this.client
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) throw error;
  }

  // Session operations
  async createSession(sessionData: {
    user_id: string;
    session_token: string;
    telegram_chat_id?: number;
    device_info?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    login_method: string;
    expires_at: string;
  }) {
    const { data, error } = await this.client
      .from('user_sessions')
      .insert({
        ...sessionData,
        is_active: true,
        last_activity: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getActiveSession(sessionToken: string) {
    const { data, error } = await this.client
      .from('user_sessions')
      .select(`
        *,
        users (*)
      `)
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .single();
    
    return { data, error };
  }

  async updateSessionActivity(sessionToken: string) {
    const { error } = await this.client
      .from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('session_token', sessionToken);
    
    if (error) throw error;
  }

  async deactivateSession(sessionToken: string) {
    const { error } = await this.client
      .from('user_sessions')
      .update({ is_active: false })
      .eq('session_token', sessionToken);
    
    if (error) throw error;
  }

  // Event operations
  async createEvent(eventData: {
    title: string;
    description?: string;
    image_url?: string;
    date: string;
    time: string;
    duration_minutes?: number;
    location?: string;
    max_attendees?: number;
    group_id?: string;
    created_by: string;
    is_public?: boolean;
    registration_required?: boolean;
  }) {
    const { data, error } = await this.client
      .from('events')
      .insert({
        ...eventData,
        status: 'scheduled',
        attendee_count: 0
      })
      .select(`
        *,
        users!events_created_by_fkey (id, full_name, username, avatar_url),
        groups (id, name, slug)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getEvents(filters?: {
    isPublic?: boolean;
    groupId?: string;
    createdBy?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = this.client
      .from('events')
      .select(`
        *,
        users!events_created_by_fkey (id, full_name, username, avatar_url),
        groups (id, name, slug)
      `);

    if (filters?.isPublic !== undefined) {
      query = query.eq('is_public', filters.isPublic);
    }
    if (filters?.groupId) {
      query = query.eq('group_id', filters.groupId);
    }
    if (filters?.createdBy) {
      query = query.eq('created_by', filters.createdBy);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    query = query.order('date', { ascending: true });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
    }

    const { data, error } = await query;
    return { data, error };
  }

  async getEventById(eventId: string) {
    const { data, error } = await this.client
      .from('events')
      .select(`
        *,
        users!events_created_by_fkey (id, full_name, username, avatar_url),
        groups (id, name, slug)
      `)
      .eq('id', eventId)
      .single();
    
    return { data, error };
  }

  async updateEvent(eventId: string, updateData: Partial<{
    title: string;
    description: string;
    image_url: string;
    date: string;
    time: string;
    location: string;
    is_public: boolean;
    group_id: string;
    status: string;
  }>) {
    const { data, error } = await this.client
      .from('events')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select(`
        *,
        users!events_created_by_fkey (id, full_name, username, avatar_url),
        groups (id, name, slug)
      `)
      .single();
    
    return { data, error };
  }

  async deleteEvent(eventId: string) {
    const { error } = await this.client
      .from('events')
      .delete()
      .eq('id', eventId);
    
    return { error };
  }

  // Group operations
  async createGroup(groupData: {
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    location?: string;
    is_public?: boolean;
    max_members?: number;
    created_by: string;
  }) {
    const { data, error } = await this.client
      .from('groups')
      .insert({
        ...groupData,
        status: 'active',
        member_count: 0
      })
      .select(`
        *,
        users!groups_created_by_fkey (id, full_name, username, avatar_url)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getGroups(filters?: {
    isPublic?: boolean;
    createdBy?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = this.client
      .from('groups')
      .select(`
        *,
        users!groups_created_by_fkey (id, full_name, username, avatar_url)
      `);

    if (filters?.isPublic !== undefined) {
      query = query.eq('is_public', filters.isPublic);
    }
    if (filters?.createdBy) {
      query = query.eq('created_by', filters.createdBy);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
    }

    const { data, error } = await query;
    return { data, error };
  }

  // Event attendance operations
  async addEventAttendee(eventId: string, userId: string, status: 'going' | 'maybe' | 'not_going' = 'going') {
    // First, add the attendee
    const { data, error } = await this.client
      .from('event_attendees')
      .upsert({
        event_id: eventId,
        user_id: userId,
        status,
        registered_at: new Date().toISOString()
      }, {
        onConflict: 'event_id,user_id'
      })
      .select()
      .single();
    
    if (error) throw error;

    // Update the attendee count in the events table
    await this.updateEventAttendeeCount(eventId);
    
    return data;
  }

  async getEventAttendees(eventId: string) {
    const { data, error } = await this.client
      .from('event_attendees')
      .select(`
        *,
        users (id, full_name, username, avatar_url)
      `)
      .eq('event_id', eventId)
      .order('registered_at', { ascending: true });
    
    return { data, error };
  }

  // Group membership operations
  async addGroupMember(groupId: string, userId: string, role: 'owner' | 'admin' | 'moderator' | 'member' = 'member') {
    const { data, error } = await this.client
      .from('group_members')
      .upsert({
        group_id: groupId,
        user_id: userId,
        role,
        status: 'active',
        joined_at: new Date().toISOString()
      }, {
        onConflict: 'group_id,user_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getGroupMembers(groupId: string) {
    const { data, error } = await this.client
      .from('group_members')
      .select(`
        *,
        users (id, full_name, username, avatar_url)
      `)
      .eq('group_id', groupId)
      .eq('status', 'active')
      .order('joined_at', { ascending: true });
    
    return { data, error };
  }

  // Additional event attendee methods
  async removeEventAttendee(eventId: string, userId: string) {
    const { data, error } = await this.client
      .from('event_attendees')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (!error) {
      // Update the attendee count in the events table
      await this.updateEventAttendeeCount(eventId);
    }
    
    return { data, error };
  }

  // Update attendee count for an event
  async updateEventAttendeeCount(eventId: string) {
    // Count current attendees
    const { count } = await this.client
      .from('event_attendees')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'going');

    // Update the events table
    const { error } = await this.client
      .from('events')
      .update({ attendee_count: count || 0 })
      .eq('id', eventId);

    if (error) {
      console.error('Error updating attendee count:', error);
    }

    return count || 0;
  }

  async checkEventAttendance(eventId: string, userId: string) {
    const { data, error } = await this.client
      .from('event_attendees')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .eq('status', 'going')
      .single();
    
    return { data, error };
  }
}

// Export singleton instance
export const db = new DatabaseService();