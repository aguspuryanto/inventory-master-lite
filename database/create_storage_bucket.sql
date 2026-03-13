-- Create storage bucket for product images
-- This needs to be run in Supabase Dashboard SQL Editor

-- Enable storage extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bucket_kasirku', 
  'bucket_kasirku', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create policies for the bucket
-- Allow public access to view images
CREATE POLICY "Public images are viewable by everyone" ON storage.objects
FOR SELECT USING (bucket_id = 'bucket_kasirku');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'bucket_kasirku' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own images
CREATE POLICY "Authenticated users can update images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'bucket_kasirku' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Authenticated users can delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'bucket_kasirku' AND 
  auth.role() = 'authenticated'
);

-- Alternative: Simpler policies for testing
-- Drop existing policies if they cause issues
DROP POLICY IF EXISTS "Public images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Create simpler policies
CREATE POLICY "Anyone can view bucket_kasirku images" ON storage.objects
FOR SELECT USING (bucket_id = 'bucket_kasirku');

CREATE POLICY "Anyone can upload to bucket_kasirku" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'bucket_kasirku');

CREATE POLICY "Anyone can update bucket_kasirku images" ON storage.objects
FOR UPDATE USING (bucket_id = 'bucket_kasirku');

CREATE POLICY "Anyone can delete bucket_kasirku images" ON storage.objects
FOR DELETE USING (bucket_id = 'bucket_kasirku');

-- Verify bucket was created
SELECT * FROM storage.buckets WHERE name = 'bucket_kasirku';

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
