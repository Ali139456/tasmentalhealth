# Fix: Verification Email Not Sending

## 🔍 The Problem

- Other emails (welcome, admin notification) work fine ✅
- Verification email shows toast but doesn't actually send ❌
- Console shows success but no email arrives

## 🐛 Root Cause

The code was only calling `send-verification-email` Edge Function as a **fallback** when Supabase's `auth.resend()` fails. But if `auth.resend()` succeeds (returns no error), it never calls our custom Edge Function, even though Supabase's email service might not actually send the email.

## ✅ The Fix

Changed the logic to **ALWAYS use our custom Edge Function first** for verification emails, since we know it works (other emails are working). Only fallback to Supabase's `auth.resend()` if our function fails.

### Changes Made:

1. **Dashboard.tsx** - "Resend Email" button:
   - Now calls `send-verification-email` Edge Function FIRST
   - Falls back to Supabase's `auth.resend()` only if Edge Function fails

2. **Login.tsx** - Signup flow:
   - Now calls `send-verification-email` Edge Function FIRST
   - Falls back to Supabase's `auth.resend()` only if Edge Function fails
   - Runs asynchronously so it doesn't block signup

## 📋 Next Steps

1. **Make sure `send-verification-email` function is deployed:**
   - Go to Supabase Dashboard → Edge Functions
   - Check if `send-verification-email` exists
   - If not, deploy it (see `DEPLOY_VERIFICATION_EMAIL_FUNCTION.md`)

2. **Verify secrets are set:**
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` - `Tasmanian Mental Health Directory <noreply@tasmentalhealthdirectory.com.au>`
   - `APP_URL` - `https://www.tasmentalhealthdirectory.com.au`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Test:**
   - Create a new account
   - Check console for "Verification email sent successfully via Edge Function"
   - Check inbox for verification email

## 🎯 Why This Works

- Our `send-verification-email` function uses Resend (which we know works)
- It uses Supabase Admin API to generate proper verification links
- It's more reliable than Supabase's built-in email service
- We control the email template and delivery
