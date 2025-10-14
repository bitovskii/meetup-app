-- Fix storage upload permissions
-- Run this in your Supabase SQL Editor

-- 1. Check current policies on storage.objects
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 2. Check RLS status on objects table  
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 3. Drop existing restrictive policies that might be blocking uploads
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;

-- 4. Create more permissive policies for the images bucket

-- Allow anyone to upload to images bucket (you can make this more restrictive later)
CREATE POLICY "Allow uploads to images bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images');

-- Allow public read access to images bucket
CREATE POLICY "Allow public read access to images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Allow users to delete from images bucket (optional)
CREATE POLICY "Allow delete from images bucket" ON storage.objects
  FOR DELETE USING (bucket_id = 'images');

-- Allow users to update in images bucket (optional)  
CREATE POLICY "Allow update in images bucket" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images');

-- 5. Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects' AND qual LIKE '%images%';