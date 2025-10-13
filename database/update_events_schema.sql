-- Update Events table to add foreign keys and creator tracking
-- Run this in Supabase SQL Editor

-- Add creator and group reference columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS events_creator_id_idx ON events(creator_id);
CREATE INDEX IF NOT EXISTS events_group_id_idx ON events(group_id);

-- Enable Row Level Security for events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read events (public visibility)
CREATE POLICY "Events are publicly readable" ON events
  FOR SELECT USING (true);

-- Policy: Authenticated users can create events
CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Policy: Users can update their own events
CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (auth.uid() = creator_id);

-- Policy: Users can delete their own events
CREATE POLICY "Users can delete own events" ON events
  FOR DELETE USING (auth.uid() = creator_id);

-- Enable Row Level Security for groups (if not already enabled)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read groups
CREATE POLICY "Groups are publicly readable" ON groups
  FOR SELECT USING (true);

-- Policy: Authenticated users can create groups (optional - you can restrict this later)
CREATE POLICY "Authenticated users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Update existing events to have a creator (optional - set to a default user or leave NULL)
-- You can run this if you want to assign existing events to a specific user:
-- UPDATE events SET creator_id = 'your-user-uuid-here' WHERE creator_id IS NULL;