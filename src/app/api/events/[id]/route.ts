import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { UpdateEventData } from '@/types';

// GET /api/events/[id] - Fetch single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get the authenticated user from Supabase Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Check if the event exists and user owns it
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (existingEvent.creator_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own events' },
        { status: 403 }
      );
    }

    const updateData: Partial<UpdateEventData> = await request.json();
    
    // Remove id from update data if it exists
    delete updateData.id;

    // Update the event
    const { data: event, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get the authenticated user from Supabase Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Check if the event exists and user owns it
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('creator_id, title')
      .eq('id', id)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (existingEvent.creator_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own events' },
        { status: 403 }
      );
    }

    // Delete the event
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Event deleted successfully',
      deletedEvent: { id, title: existingEvent.title }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}