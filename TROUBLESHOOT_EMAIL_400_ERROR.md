# Troubleshooting 400 Bad Request Error for send-email Function

## 🔍 The Problem

You're getting `400 (Bad Request)` errors when trying to send emails via the `send-email` Edge Function.

## ✅ Quick Fixes

### 1. Add Missing Secret: `RESEND_FROM_EMAIL`

**Go to Supabase Dashboard:**
1. Project Settings → Edge Functions → Secrets
2. Add new secret:
   - **Name**: `RESEND_FROM_EMAIL`
   - **Value**: `Tasmanian Mental Health Directory <noreply@www.tasmentalhealthdirectory.com.au>`

### 2. Verify All Required Secrets

Make sure these are set:
- ✅ `RESEND_API_KEY` - Your Resend API key
- ✅ `RESEND_FROM_EMAIL` - `Tasmanian Mental Health Directory <noreply@www.tasmentalhealthdirectory.com.au>`

### 3. Check Resend Domain Verification

1. Go to **Resend Dashboard → Domains**
2. Verify that `www.tasmentalhealthdirectory.com.au` is **verified**
3. If not verified, add the required DNS records

### 4. Check Supabase Edge Function Logs

1. Go to **Supabase Dashboard → Edge Functions**
2. Click on `send-email` function
3. Go to **Logs** tab
4. Look for error messages that show the actual Resend API error

## 🔍 Common Causes of 400 Errors

1. **Invalid FROM email format**
   - Must be: `Display Name <email@verified-domain.com>`
   - Domain must be verified in Resend

2. **Missing RESEND_API_KEY**
   - Check if the secret is set correctly

3. **Invalid email address**
   - The `to` email must be valid

4. **Resend API limits**
   - Check if you've exceeded your Resend plan limits

## 📝 Check Function Logs

The function now logs more details. Check Supabase Edge Functions → Logs to see:
- What FROM_EMAIL is being used
- The actual Resend API error message
- Email data being sent

## 🎯 Next Steps

1. **Add the `RESEND_FROM_EMAIL` secret** (most likely fix)
2. **Redeploy the `send-email` function** (to get updated logging)
3. **Check the logs** after trying to send an email
4. **Verify domain in Resend** if still failing
