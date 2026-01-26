# Storage Bucket Setup

## Issue
Article image uploads require a Supabase Storage bucket. The code will try to use an `Articles` bucket first, then fall back to the `listings` bucket.

## Solution

### Step 1: Create the Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name it `Articles` (case-sensitive - must be capitalized)
4. Make it **public** (so images can be accessed)
5. Click "Create bucket"

### Step 2: Set Up Storage Policies (IMPORTANT!)
After creating the bucket, you need to set up Row Level Security (RLS) policies to allow admins to upload files:

**Run the SQL script `storage-policies.sql` in Supabase SQL Editor:**

Go to Supabase Dashboard → SQL Editor → New Query, then copy and paste the contents of `react-app/storage-policies.sql` and run it.

This will create policies that:
- Allow admins to upload files to the Articles bucket
- Allow admins to update files in the Articles bucket
- Allow admins to delete files from the Articles bucket
- Allow public to read files from the Articles bucket (for displaying images)

## Alternative
If you want to use the existing `listings` bucket for articles, the code will automatically fall back to it if the `Articles` bucket doesn't exist.

## Bucket Settings
- **Public**: Yes (so article images can be displayed)
- **File size limit**: 5MB (enforced in code)
- **Allowed MIME types**: image/* (enforced in code)
- **RLS Policies**: Must be set up (see Step 2 above)

## Troubleshooting

If you get "new row violates row-level security policy" error:
1. Make sure you've run the `storage-policies.sql` script
2. Verify your user has the 'admin' role in the users table
3. Check that the bucket name is exactly `Articles` (case-sensitive)
