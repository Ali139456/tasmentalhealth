-- QUICK FIX: Make info@ an admin (Run this NOW to fix "Access Denied" error)
-- Copy and paste this entire script into Supabase SQL Editor and click "Run"

-- Step 1: Make info@ an admin
UPDATE users
SET role = 'admin',
    email_verified = true,
    updated_at = NOW()
WHERE email = 'info@tasmentalhealthdirectory.com.au';

-- Step 2: Verify email in auth.users
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'info@tasmentalhealthdirectory.com.au';

-- Step 3: Verify it worked (should show role = 'admin')
SELECT id, email, role, email_verified, created_at, updated_at
FROM users 
WHERE email = 'info@tasmentalhealthdirectory.com.au';

-- Step 4: (Optional) Delete admin@ account if it still exists
DELETE FROM auth.users 
WHERE email = 'admin@tasmentalhealthdirectory.com.au';

-- Step 5: Final check - should only show info@ as admin
SELECT id, email, role, email_verified
FROM users 
WHERE role = 'admin';
