-- QUICK FIX: Make info@ an admin (Run this NOW to fix "Access Denied" and 406 errors)
-- Copy and paste this entire script into Supabase SQL Editor and click "Run"

-- Step 1: Ensure info@ user exists in users table (fixes 406 error)
-- This creates the user record if it doesn't exist, or updates it if it does
DO $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  -- Find the info@ user in auth.users
  SELECT id, email INTO v_user_id, v_user_email
  FROM auth.users
  WHERE email = 'info@tasmentalhealthdirectory.com.au'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User info@tasmentalhealthdirectory.com.au not found in auth.users. Please create the user first.';
  END IF;

  -- Insert or update the user in the users table
  INSERT INTO public.users (id, email, role, email_verified, created_at, updated_at)
  VALUES (
    v_user_id,
    v_user_email,
    'admin',
    COALESCE((SELECT email_confirmed_at IS NOT NULL FROM auth.users WHERE id = v_user_id), false),
    COALESCE((SELECT created_at FROM auth.users WHERE id = v_user_id), NOW()),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = 'admin',
    email_verified = COALESCE((SELECT email_confirmed_at IS NOT NULL FROM auth.users WHERE id = v_user_id), false),
    updated_at = NOW();
END $$;

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
