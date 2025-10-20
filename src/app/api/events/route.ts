import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { authenticateRequest } from '@/lib/auth';
import type { CreateEventData } from '@/types';

// GET /api/events - Fetch all events
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('public') !== 'false'; // Default to public events
    const groupId = searchParams.get('groupId');
    const createdBy = searchParams.get('createdBy');
    const limit = searchParams.get('limit') ? Number.parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? Number.parseInt(searchParams.get('offset')!) : undefined;

    // Build filters
    const filters: {
      isPublic?: boolean;
      groupId?: string;
      createdBy?: string;
      status?: string;
      limit?: number;
      offset?: number;
    } = {
      isPublic,
      status: 'scheduled' // Only show scheduled events
    };

    if (groupId) filters.groupId = groupId;
    if (createdBy) filters.createdBy = createdBy;
    if (limit) filters.limit = limit;
    if (offset) filters.offset = offset;

    const { data: events, error } = await db.getEvents(filters);

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    // Transform database response to match frontend expectations
    const transformedEvents = events?.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      image: event.image_url, // Map image_url to image
      date: event.date,
      time: event.time,
      place: event.location || event.place, // Handle both location and place
      members: event.attendee_count || 0,
      creator_id: event.created_by,
      group_id: event.group_id,
      created_at: event.created_at,
      updated_at: event.updated_at
    })) || [];

    return NextResponse.json({ 
      success: true, 
      data: transformedEvents,
      count: transformedEvents.length
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication required' },
        { status: 401 }
      );
    }

    const eventData: CreateEventData = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'description', 'date', 'time', 'place'];
    for (const field of requiredFields) {
      if (!eventData[field as keyof CreateEventData]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Provide default image if not provided
    const defaultImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop';
    
    // Prepare event data for database
    const dbEventData = {
      title: eventData.title,
      description: eventData.description,
      image_url: eventData.image || defaultImage,
      date: eventData.date,
      time: eventData.time,
      location: eventData.place,
      group_id: eventData.group_id || undefined,
      created_by: authResult.user.id,
      is_public: true,
      registration_required: true
    };

    const event = await db.createEvent(dbEventData);

    // Transform database response to match frontend expectations
    const transformedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      image: event.image_url, // Map image_url to image
      date: event.date,
      time: event.time,
      place: event.location,
      members: event.attendee_count || 0,
      creator_id: event.created_by,
      group_id: event.group_id,
      created_at: event.created_at,
      updated_at: event.updated_at
    };

    return NextResponse.json({ 
      success: true, 
      data: transformedEvent 
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}