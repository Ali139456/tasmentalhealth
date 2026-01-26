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

-- Also update any existing users who were incorrectly marked as verified
-- This fixes users who were created before this fix
UPDATE public.users
SET email_verified = FALSE
WHERE email_verified = TRUE 
  AND id IN (
    SELECT id FROM auth.users 
    WHERE email_confirmed_at IS NULL
  );
