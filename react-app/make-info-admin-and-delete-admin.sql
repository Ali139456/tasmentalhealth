-- Make info@tasmentalhealthdirectory.com.au an admin and delete admin@ account
-- Run this in Supabase SQL Editor

-- Step 1: Check current state
SELECT id, email, role, email_verified 
FROM users 
WHERE email IN ('admin@tasmentalhealthdirectory.com.au', 'info@tasmentalhealthdirectory.com.au')
ORDER BY email;

-- Step 2: Update info@ user to have admin role and ensure it's verified
UPDATE users
SET role = 'admin',
    email_verified = true,
    updated_at = NOW()
WHERE email = 'info@tasmentalhealthdirectory.com.au';

-- Step 3: Also update auth.users email_verified status for info@
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'info@tasmentalhealthdirectory.com.au';

-- Step 4: Delete the admin@ user account
-- First delete from auth.users (this will cascade to users table via foreign key)
DELETE FROM auth.users 
WHERE email = 'admin@tasmentalhealthdirectory.com.au';

-- Step 5: Verify the result - info@ should be admin
SELECT id, email, role, email_verified, created_at, updated_at
FROM users 
WHERE email = 'info@tasmentalhealthdirectory.com.au';

-- Step 6: Verify admin@ is deleted
SELECT COUNT(*) as admin_count
FROM users 
WHERE email = 'admin@tasmentalhealthdirectory.com.au';

-- Step 7: List all admin users (should only show info@)
SELECT id, email, role, email_verified
FROM users 
WHERE role = 'admin';
