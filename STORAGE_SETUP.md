# Storage Bucket Setup

## Issue
Article image uploads require a Supabase Storage bucket. The code will try to use an `articles` bucket first, then fall back to the `listings` bucket.

## Solution
Create a storage bucket in Supabase:

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name it `articles` (or use `listings` if you prefer)
4. Make it **public** (so images can be accessed)
5. Click "Create bucket"

## Alternative
If you want to use the existing `listings` bucket for articles, the code will automatically fall back to it if the `articles` bucket doesn't exist.

## Bucket Settings
- **Public**: Yes (so article images can be displayed)
- **File size limit**: 5MB (enforced in code)
- **Allowed MIME types**: image/* (enforced in code)
