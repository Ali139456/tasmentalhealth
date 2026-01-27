-- Add avatar_url column to listings table
-- Run this in Supabase SQL Editor

ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN listings.avatar_url IS 'URL to the practice logo/avatar image (only shown for featured listings)';
