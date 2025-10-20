import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { authenticateRequest } from '@/lib/auth';
import type { UpdateEventData } from '@/types';

// GET /api/events/[id] - Fetch single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: event, error } = await db.getEventById(id);

    if (error || !event) {
      console.error('Error fetching event:', error);
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Transform database response to match frontend expectations
    const transformedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      image: event.image_url,
      date: event.date,
      time: event.time,
      place: event.location,
      members: event.attendee_count || 0,
      creator_id: event.created_by,
      group_id: event.group_id,
      created_at: event.created_at,
      updated_at: event.updated_at
    };

    return NextResponse.json({ event: transformedEvent });
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
    
    // Authenticate the user
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if the event exists and user owns it
    const { data: existingEvent, error: fetchError } = await db.getEventById(id);

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (existingEvent.created_by !== authResult.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own events' },
        { status: 403 }
      );
    }

    const updateData: Partial<UpdateEventData> = await request.json();
    
    // Remove id from update data if it exists
    delete updateData.id;

    // Map frontend field names to database field names
    const mappedUpdateData = {
      ...updateData,
      image_url: updateData.image, // Map 'image' to 'image_url'
      location: updateData.place   // Map 'place' to 'location'
    };
    
    // Remove frontend field names
    delete mappedUpdateData.image;
    delete mappedUpdateData.place;

    // Update the event
    const { data: event, error } = await db.updateEvent(id, mappedUpdateData);

    if (error) {
      console.error('Error updating event:', error);
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found after update' },
        { status: 404 }
      );
    }

    // Transform database response to match frontend expectations
    const transformedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      image: event.image_url,
      date: event.date,
      time: event.time,
      place: event.location,
      members: event.attendee_count || 0,
      creator_id: event.created_by,
      group_id: event.group_id,
      created_at: event.created_at,
      updated_at: event.updated_at
    };

    return NextResponse.json({ event: transformedEvent });
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
    
    // Authenticate the user
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if the event exists and user owns it
    const { data: existingEvent, error: fetchError } = await db.getEventById(id);

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (existingEvent.created_by !== authResult.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own events' },
        { status: 403 }
      );
    }

    // Delete the event
    const { error } = await db.deleteEvent(id);

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