-- Fix creator_id column to be nullable for anonymous event creation
-- Run this in Supabase SQL Editor

-- Drop the foreign key constraint temporarily
ALTER TABLE events 
DROP CONSTRAINT IF EXISTS events_creator_id_fkey;

-- Make creator_id nullable
ALTER TABLE events 
ALTER COLUMN creator_id DROP NOT NULL;

-- Recreate the foreign key constraint but allow nulls
ALTER TABLE events 
ADD CONSTRAINT events_creator_id_fkey 
FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update RLS policies to allow anonymous event creation
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;

-- Policy: Anyone can create events (including anonymous users)
CREATE POLICY "Anyone can create events" ON events
  FOR INSERT WITH CHECK (true);

-- Policy: Users can update events they created (when creator_id matches)
CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (
    creator_id IS NULL OR creator_id = auth.uid()
  );

-- Policy: Users can delete events they created (when creator_id matches)
CREATE POLICY "Users can delete own events" ON events
  FOR DELETE USING (
    creator_id IS NULL OR creator_id = auth.uid()
  );