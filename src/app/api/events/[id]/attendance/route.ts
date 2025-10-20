import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { authenticateRequest } from '@/lib/auth';

// GET /api/events/[id]/attendance - Check user's attendance status
export async function GET(
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

    // Check if user is attending
    const { data: attendance } = await db.checkEventAttendance(eventId, userId);
    
    // Get current event data for attendee count
    const { data: event } = await db.getEventById(eventId);

    return NextResponse.json({ 
      success: true, 
      data: { 
        isAttending: !!attendance,
        attendeeCount: event?.attendee_count || 0
      }
    });

  } catch (error) {
    console.error('Unexpected error checking attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}