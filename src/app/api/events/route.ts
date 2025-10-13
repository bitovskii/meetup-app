import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { CreateEventData } from '@/types';

// GET /api/events - Fetch all events
export async function GET() {
  try {
    // First, try to fetch events with group relationship
    let { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: events || [] });
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
    
    // For now, use a temporary creator_id until auth is implemented
    const creator_id = 'temp-user-id';
    
    // Insert the event with creator_id
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        image: eventData.image || defaultImage,
        creator_id,
        members: 0 // Start with 0 members
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}