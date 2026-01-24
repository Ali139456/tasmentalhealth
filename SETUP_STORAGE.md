# Setup Supabase Storage for Avatars

To enable avatar uploads for featured listings, you need to create a storage bucket in Supabase.

## Steps:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Open Storage**
   - Click "Storage" in the left sidebar
   - Or go to: `https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/storage/buckets`

3. **Create New Bucket**
   - Click "New bucket"
   - Name: `listings`
   - Make it **Public** (so images can be accessed)
   - Click "Create bucket"

4. **Set Up Policies**
   - Click on the `listings` bucket
   - Go to "Policies" tab
   - Create a policy for uploads:
     - Policy name: "Allow authenticated uploads"
     - Allowed operation: INSERT
     - Target roles: authenticated
     - Policy definition: `bucket_id = 'listings' AND auth.role() = 'authenticated'`
   
   - Create a policy for reads:
     - Policy name: "Allow public reads"
     - Allowed operation: SELECT
     - Target roles: anon, authenticated
     - Policy definition: `bucket_id = 'listings'`

5. **Create Folder Structure**
   - The code will automatically create an `avatars/` folder when uploading
   - No manual folder creation needed

## Testing

After setup, try uploading an avatar in the "Get Listed" form or Dashboard edit form. The image should upload and display for featured listings.
