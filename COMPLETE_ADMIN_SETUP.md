# Complete Admin Setup - Use info@ Everywhere

## ✅ What's Already Done

The code is **already dynamic** - it fetches admin emails from the database based on `role = 'admin'`. So once you update the database, everything will work automatically.

## 🔧 What You Need to Do

### Step 1: Run SQL to Make info@ Admin and Delete admin@

Go to **Supabase Dashboard → SQL Editor** and run this complete script:

```sql
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
```

### Step 2: Set Password for info@

**Option A: Using HTML Page (Easiest)**
1. Open `set-password.html` in your browser
2. Click "Set Password" (anon key is already filled in)
3. Wait for success message

**Option B: Deploy Edge Function and Use It**
1. Deploy the Edge Function in Supabase Dashboard (see `DEPLOY_IN_SUPABASE_DASHBOARD.md`)
2. Then use the HTML page or curl command

### Step 3: Test Login

1. Go to: `https://tasmentalhealthdirectory.com.au/admin-login`
2. Email: `info@tasmentalhealthdirectory.com.au` (already pre-filled)
3. Password: `Tasmental@123`
4. Click "Sign In as Admin"

## 📝 Code Changes Made

I've updated:
- ✅ `AdminLogin.tsx` - Pre-fills `info@tasmentalhealthdirectory.com.au` in email field
- ✅ `AdminLogin.tsx` - Placeholder changed to `info@tasmentalhealthdirectory.com.au`
- ✅ All documentation files reference `info@`

## 🔍 How Admin System Works

The system is **role-based**, not email-based:
- Admin emails are fetched dynamically from database: `SELECT email FROM users WHERE role = 'admin'`
- Any user with `role = 'admin'` will receive admin notifications
- Admin login checks: `role = 'admin'` in the database

So once you:
1. ✅ Run the SQL to make `info@` an admin
2. ✅ Set the password
3. ✅ Delete `admin@` account

Everything will automatically use `info@` because it's the only admin user!

## 🚨 If Login Still Fails

If you still get "Invalid email or password":

1. **Check if password was set:**
   - Make sure you ran the Edge Function or used the HTML page
   - Check Supabase Edge Function logs for errors

2. **Check if email is verified:**
   - Go to Supabase Dashboard → Authentication → Users
   - Find `info@tasmentalhealthdirectory.com.au`
   - Make sure "Email Confirmed" is checked

3. **Reset password via Supabase Dashboard:**
   - Go to Supabase Dashboard → Authentication → Users
   - Find `info@tasmentalhealthdirectory.com.au`
   - Click "Send Password Reset Email"
   - Check email and set password to `Tasmental@123`
