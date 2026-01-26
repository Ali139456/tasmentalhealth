# Password Reset Email Setup

## ✅ What's Been Fixed

The password reset system now uses our custom Resend email service instead of Supabase's built-in email (which may not be configured).

## 📋 Setup Instructions

### 1. Deploy the New Edge Function

You need to deploy the new `password-reset` Edge Function:

1. Go to **Supabase Dashboard** → **Edge Functions**
2. Click **"Create a new function"** or find `password-reset`
3. If creating new:
   - Name: `password-reset`
   - Copy the code from `supabase/functions/password-reset/index.ts`
4. Click **"Deploy"**

### 2. Verify Environment Variables

Make sure these secrets are set in **Supabase Dashboard → Edge Functions → Secrets**:

- ✅ `RESEND_API_KEY` - Your Resend API key
- ✅ `RESEND_FROM_EMAIL` - Should be: `Tasmanian Mental Health Directory <noreply@tasmentalhealthdirectory.com.au>`
- ✅ `SUPABASE_URL` - Your Supabase project URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Your service role key
- ✅ `APP_URL` - Your production URL: `https://www.tasmentalhealthdirectory.com.au` (IMPORTANT: prevents localhost redirects)

### 3. Test the Password Reset

1. Go to Dashboard
2. Click **"Change Password"**
3. Click **"Send Reset Link"**
4. **You should receive an email** with a password reset link
5. Click the link to go to the reset password page
6. Enter new password
7. **You should receive a confirmation email** after password is changed

## 🔍 Troubleshooting

### If password reset email is not received:

1. **Check Supabase Logs**:
   - Go to Supabase Dashboard → Edge Functions → `password-reset` → **Logs**
   - Look for errors

2. **Verify Function is Deployed**:
   - Make sure the `password-reset` function exists and is deployed
   - Check that it's not showing any errors

3. **Check Resend Dashboard**:
   - Go to Resend Dashboard → Logs
   - Check if emails are being sent
   - Look for delivery errors

4. **Verify Secrets**:
   - Ensure all required secrets are set correctly
   - `RESEND_API_KEY` should be your actual Resend API key
   - `SUPABASE_SERVICE_ROLE_KEY` should be your service role key (not anon key)

### If confirmation email is not received:

1. Check browser console for errors
2. Check Supabase Edge Function logs for `send-email` function
3. Verify `send-email` function is deployed and working

## 📧 Email Flow

1. **User clicks "Change Password"** → Dashboard sends request to `password-reset` Edge Function
2. **Edge Function generates reset link** → Uses Supabase Admin API
3. **Edge Function sends email** → Uses Resend service
4. **User clicks link** → Redirected to `/reset-password` page
5. **User enters new password** → Password is updated
6. **Confirmation email sent** → Uses `send-email` Edge Function

## ✅ Expected Behavior

- ✅ Password reset email arrives within seconds
- ✅ Email is from `noreply@tasmentalhealthdirectory.com.au`
- ✅ Reset link works and redirects to reset password page
- ✅ Password can be changed successfully
- ✅ Confirmation email arrives after password change
