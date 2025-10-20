import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { db } from '@/lib/database';
import { authenticateRequest } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
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

// Helper function to handle image upload
async function handleImageUpload(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (buffer.length > maxSize) {
    throw new Error('File size exceeds 5MB limit');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed');
  }

  // Generate unique filename (always save as WebP for consistency and compression)
  const uniqueName = `events/${crypto.randomUUID()}.webp`;

  // Process image: resize and compress
  const processedBuffer = await sharp(buffer)
    .resize(800, 600, {
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 85 })
    .toBuffer();

  // Upload to Supabase Storage
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side uploads
  );

  const { error } = await supabase.storage
    .from('images')
    .upload(uniqueName, processedBuffer, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error('Failed to upload image to storage');
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(uniqueName);

  return publicUrl;
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

    // Check if request is FormData (with file upload) or JSON
    const contentType = request.headers.get('content-type') || '';
    let eventData: CreateEventData;
    let imageUrl = '';

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with file upload
      const formData = await request.formData();
      
      // Extract form fields
      eventData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        date: formData.get('date') as string,
        time: formData.get('time') as string,
        place: formData.get('place') as string,
        image: '', // Will be set after upload
        group_id: formData.get('group_id') as string || undefined
      };

      // Handle image upload if present
      const imageFile = formData.get('image') as File;
      if (imageFile && imageFile.size > 0) {
        imageUrl = await handleImageUpload(imageFile);
        eventData.image = imageUrl;
      }
    } else {
      // Handle JSON request (existing functionality)
      eventData = await request.json();
    }

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
    console.error('🔥 EVENT CREATION ERROR:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}