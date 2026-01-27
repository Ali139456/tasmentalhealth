# Quick Fix: Make info@ Admin (Fix "Access Denied" Error)

## The Problem
You're seeing "Access denied. This login is for administrators only." because `info@tasmentalhealthdirectory.com.au` doesn't have `role = 'admin'` in the database yet.

## The Solution: Run This SQL

Go to **Supabase Dashboard → SQL Editor** and run this:

```sql
-- Make info@ an admin (FIX THE ACCESS DENIED ERROR)
UPDATE users
SET role = 'admin',
    email_verified = true,
    updated_at = NOW()
WHERE email = 'info@tasmentalhealthdirectory.com.au';

-- Also verify email in auth.users
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'info@tasmentalhealthdirectory.com.au';

-- Verify it worked
SELECT id, email, role, email_verified
FROM users 
WHERE email = 'info@tasmentalhealthdirectory.com.au';
```

**Expected Result:** You should see `role = 'admin'` in the results.

## After Running SQL

1. **Refresh the admin login page** (or go back and come again)
2. **Log in again** with:
   - Email: `info@tasmentalhealthdirectory.com.au`
   - Password: `Tasmental@123`
3. **You should now have access!** ✅

## If Password Doesn't Work

If you get "Invalid email or password", you need to set the password first:

1. **Deploy the Edge Function** (see `DEPLOY_IN_SUPABASE_DASHBOARD.md`)
2. **Or use the HTML page**: Open `set-password.html` and click "Set Password"
3. **Or reset via Supabase Dashboard**:
   - Go to Supabase Dashboard → Authentication → Users
   - Find `info@tasmentalhealthdirectory.com.au`
   - Click "Send Password Reset Email"
   - Set password to `Tasmental@123`

## Complete Checklist

- [ ] Run SQL to make `info@` admin (above)
- [ ] Set password to `Tasmental@123` (if not already set)
- [ ] Delete `admin@` account (optional, from `make-info-admin-and-delete-admin.sql`)
- [ ] Test login at `/admin-login`
