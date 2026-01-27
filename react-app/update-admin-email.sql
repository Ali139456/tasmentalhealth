-- Update admin user email to info@tasmentalhealthdirectory.com.au
-- Run this in Supabase SQL Editor

-- First, check current admin email(s)
SELECT id, email, role, email_verified 
FROM users 
WHERE role = 'admin';

-- Update admin email to info@tasmentalhealthdirectory.com.au
-- Replace 'admin@tasmentalhealthdirectory.com.au' with the actual current admin email if different
UPDATE users
SET email = 'info@tasmentalhealthdirectory.com.au',
    email_verified = true,
    updated_at = NOW()
WHERE role = 'admin' 
  AND email = 'admin@tasmentalhealthdirectory.com.au';

-- If you want to update ALL admin users regardless of current email:
-- UPDATE users
-- SET email = 'info@tasmentalhealthdirectory.com.au',
--     email_verified = true,
--     updated_at = NOW()
-- WHERE role = 'admin';

-- Verify the update
SELECT id, email, role, email_verified, updated_at
FROM users 
WHERE role = 'admin';
