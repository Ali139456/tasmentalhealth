-- Fix: Ensure new users always start with email_verified = FALSE
-- This ensures the correct flow: signup → unverified → verify email → verified

-- Update the function to always set email_verified = FALSE for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    'lister',
    FALSE  -- Always start as unverified, even if email_confirmed_at exists
  )
  ON CONFLICT (id) DO NOTHING;  -- Prevent errors if user already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the sync trigger to only update when email_confirmed_at changes FROM NULL to NOT NULL
-- This prevents auto-verification during signup
CREATE OR REPLACE FUNCTION sync_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if email_confirmed_at changed from NULL to a value (actual verification)
  -- Don't sync if it was already set (prevents auto-verification during signup)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.users
    SET email_verified = TRUE
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update any existing users who were incorrectly marked as verified
-- This fixes users who were created before this fix
UPDATE public.users
SET email_verified = FALSE
WHERE email_verified = TRUE 
  AND id IN (
    SELECT id FROM auth.users 
    WHERE email_confirmed_at IS NULL
  );
