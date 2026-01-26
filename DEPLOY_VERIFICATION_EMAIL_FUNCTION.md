# Deploy Verification Email Edge Function

## 📋 Steps to Deploy

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to **Edge Functions** (left sidebar)

2. **Create New Function**
   - Click **"Create a new function"** or **"New Function"**
   - Name it: `send-verification-email`

3. **Copy the Code**
   - The code is in: `supabase/functions/send-verification-email/index.ts`
   - Copy the entire contents
   - Paste into the Supabase function editor

4. **Set Environment Variables (Secrets)**
   - Go to **Project Settings → Edge Functions → Secrets**
   - Make sure these are set:
     - ✅ `RESEND_API_KEY` - Your Resend API key
     - ✅ `RESEND_FROM_EMAIL` - `Tasmanian Mental Health Directory <noreply@www.tasmentalhealthdirectory.com.au>`
     - ✅ `APP_URL` - `https://www.tasmentalhealthdirectory.com.au`
     - ✅ `SUPABASE_URL` - Your Supabase project URL
     - ✅ `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

5. **Deploy the Function**
   - Click **"Deploy"** or **"Save"**
   - Wait for deployment to complete

6. **Test It**
   - Create a new account
   - Check your inbox for verification email
   - Or click "Resend Email" on dashboard

## ✅ What This Function Does

- Uses Supabase Admin API to generate verification links
- Sends verification emails via Resend (your custom email service)
- Works even if Supabase's email service is unavailable
- Includes proper error handling and logging

## 🔍 Troubleshooting

If emails still don't arrive:
1. Check Supabase Edge Functions → Logs for errors
2. Check Resend Dashboard → Logs for email delivery status
3. Verify all secrets are set correctly
4. Check spam/junk folder
