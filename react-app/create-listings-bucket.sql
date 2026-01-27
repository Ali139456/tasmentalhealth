-- Create listings bucket and policies for avatar uploads
-- Run this in Supabase SQL Editor

-- First, create the bucket in Supabase Dashboard:
-- 1. Go to Storage > Buckets
-- 2. Click "New bucket"
-- 3. Name: "listings"
-- 4. Public: Yes (or No if you want private)
-- 5. Click "Create bucket"

-- Then run these policies:

-- Allow authenticated users to upload avatars to listings bucket
CREATE POLICY "Authenticated users can upload to listings bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listings');

-- Allow authenticated users to update their own files in listings bucket
CREATE POLICY "Users can update their own files in listings bucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'listings' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Allow authenticated users to delete their own files in listings bucket
CREATE POLICY "Users can delete their own files in listings bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'listings' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Allow public to read files from listings bucket (if bucket is public)
CREATE POLICY "Public can read listings bucket files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listings');
