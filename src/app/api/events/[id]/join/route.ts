import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { authenticateRequest } from '@/lib/auth';

// POST /api/events/[id]/join - Join an event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;
    const userId = authResult.user.id;

    // Check if user is already attending
    const { data: existingAttendance } = await db.checkEventAttendance(eventId, userId);
    
    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Already attending this event' },
        { status: 400 }
      );
    }

    // Add user to event attendees
    const { data: attendee, error } = await db.addEventAttendee(eventId, userId, 'going');

    if (error) {
      console.error('Error joining event:', error);
      return NextResponse.json(
        { error: 'Failed to join event' },
        { status: 500 }
      );
    }

    // Get updated event data with new attendee count
    const { data: event } = await db.getEventById(eventId);

    return NextResponse.json({ 
      success: true, 
      data: { 
        attendee,
        attendeeCount: event?.attendee_count || 0
      }
    });

  } catch (error) {
    console.error('Unexpected error joining event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/join - Leave an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;
    const userId = authResult.user.id;

    // Check if user is actually attending
    const { data: existingAttendance } = await db.checkEventAttendance(eventId, userId);
    
    if (!existingAttendance) {
      return NextResponse.json(
        { error: 'Not attending this event' },
        { status: 400 }
      );
    }

    // Remove user from event attendees
    const { data: removedAttendee, error } = await db.removeEventAttendee(eventId, userId);

    if (error) {
      console.error('Error leaving event:', error);
      return NextResponse.json(
        { error: 'Failed to leave event' },
        { status: 500 }
      );
    }

    // Get updated event data with new attendee count
    const { data: event } = await db.getEventById(eventId);

    return NextResponse.json({ 
      success: true, 
      data: { 
        removedAttendee,
        attendeeCount: event?.attendee_count || 0
      }
    });

  } catch (error) {
    console.error('Unexpected error leaving event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}