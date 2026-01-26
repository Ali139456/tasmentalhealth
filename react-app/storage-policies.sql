-- Storage Bucket Policies for Articles
-- Run this in Supabase SQL Editor

-- Allow admins to upload files to Articles bucket
CREATE POLICY "Admins can upload to Articles bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'Articles' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update files in Articles bucket
CREATE POLICY "Admins can update Articles bucket files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'Articles' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete files from Articles bucket
CREATE POLICY "Admins can delete from Articles bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'Articles' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow public to read files from Articles bucket (since it's a public bucket)
CREATE POLICY "Public can read Articles bucket files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'Articles');

-- If you also want to allow authenticated users (not just admins) to upload:
-- Uncomment the following policy:

-- CREATE POLICY "Authenticated users can upload to Articles bucket"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'Articles');
