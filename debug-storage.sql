-- Debug storage access issues
-- Run this in your Supabase SQL Editor to diagnose the problem

-- 1. Check if buckets exist at all
SELECT id, name, public, created_at, updated_at 
FROM storage.buckets;

-- 2. Check RLS status on buckets table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'buckets';

-- 3. Check existing policies on storage.buckets
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'buckets';

-- 4. If no buckets are returned by the first query, try to create the images bucket again
-- (This will error if it already exists, which is fine)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, null, null)
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public;

-- 5. Check if the bucket exists after creation
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE name = 'images';

-- 6. Ensure RLS policies allow reading buckets (if needed)
-- Drop the policy if it exists, then create it
DROP POLICY IF EXISTS "Allow public bucket access" ON storage.buckets;

-- This policy allows anyone to read bucket information
CREATE POLICY "Allow public bucket access" ON storage.buckets
  FOR SELECT USING (true);

-- 7. Final verification - list all buckets again
SELECT id, name, public, created_at 
FROM storage.buckets;