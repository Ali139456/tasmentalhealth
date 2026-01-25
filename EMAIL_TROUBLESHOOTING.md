# Email Troubleshooting Guide

## Issue: Not Receiving Emails After Account Creation

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Create a new account
4. Look for these log messages:
   - `"Sending welcome email to: [email]"`
   - `"Attempting to send email via Edge Function"`
   - `"Email sent successfully"` or error messages

### Step 2: Check Supabase Edge Function Logs
1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Edge Functions** → **send-email**
3. Click on **Logs** tab
4. Look for:
   - `"send-email function called"`
   - `"RESEND_API_KEY exists: true"`
   - `"Email sent successfully"` or error messages

### Step 3: Verify Environment Variables in Supabase
1. Go to **Supabase Dashboard** → Your Project → **Settings**
2. Click on **Edge Functions** → **Environment Variables**
3. Verify these are set:
   - ✅ `RESEND_API_KEY` - Should have a value starting with `re_`
   - ✅ `RESEND_FROM_EMAIL` - Should be set (or using default)
   - ✅ `APP_URL` - Should be set (for email links)

### Step 4: Verify Resend API Key
1. Go to **Resend Dashboard**: https://resend.com
2. Check your API keys are active
3. Verify the API key matches what's in Supabase

### Step 5: Check Email Delivery in Resend
1. Go to **Resend Dashboard** → **Emails**
2. Check if emails are being sent (you should see delivery attempts)
3. Check for any bounce/spam issues

### Step 6: Check Spam Folder
- Sometimes emails go to spam, especially for new domains
- Check your spam/junk folder

### Step 7: Verify Edge Function is Deployed
1. Go to **Supabase Dashboard** → **Edge Functions**
2. Make sure `send-email` function is listed and deployed
3. If not deployed, you need to deploy it:
   ```bash
   supabase functions deploy send-email
   ```

## Common Issues and Solutions

### Issue: "RESEND_API_KEY environment variable is required"
**Solution:** Add `RESEND_API_KEY` in Supabase Edge Functions environment variables

### Issue: "Failed to send email" in console
**Possible causes:**
1. Resend API key is invalid
2. From email address is not verified in Resend
3. Network/CORS issues

**Solutions:**
- Verify API key in Resend dashboard
- Verify domain/email in Resend
- Check Supabase Edge Function logs for detailed error

### Issue: No logs appearing
**Possible causes:**
1. Edge Function not being called
2. Authentication issue with Supabase

**Solutions:**
- Check browser console for errors
- Verify Supabase client is properly configured
- Check if Edge Function requires authentication

### Issue: Emails sent but not received
**Possible causes:**
1. Email in spam folder
2. Email provider blocking
3. Invalid email address

**Solutions:**
- Check spam folder
- Verify email address is correct
- Check Resend dashboard for delivery status

## Testing Email System

### Test 1: Check Console Logs
1. Open browser console
2. Create a new account
3. You should see:
   ```
   Sending welcome email to: test@example.com
   Attempting to send email via Edge Function: {to: "test@example.com", ...}
   Email sent successfully via Edge Function: {...}
   ```

### Test 2: Check Supabase Logs
1. Go to Supabase → Edge Functions → send-email → Logs
2. You should see:
   ```
   send-email function called
   RESEND_API_KEY exists: true
   Email request received: {to: "...", subject: "...", ...}
   Email sent successfully: {...}
   ```

### Test 3: Check Resend Dashboard
1. Go to Resend → Emails
2. You should see email delivery attempts with status

## Quick Fix Checklist

- [ ] `RESEND_API_KEY` is set in Supabase Edge Functions
- [ ] `RESEND_FROM_EMAIL` is set (or using default)
- [ ] Edge Function `send-email` is deployed
- [ ] Browser console shows email sending attempts
- [ ] Supabase logs show function being called
- [ ] Resend dashboard shows email delivery attempts
- [ ] Checked spam folder
- [ ] Email address is valid

## Still Not Working?

If emails still aren't working after checking all above:

1. **Check Supabase Edge Function Logs** - This will show the exact error
2. **Verify Resend API Key** - Make sure it's active and correct
3. **Test Resend directly** - Try sending an email manually from Resend dashboard
4. **Check Network Tab** - In browser DevTools, check if the Edge Function call is successful

## Contact Support

If you've checked everything and it's still not working, provide:
- Browser console errors
- Supabase Edge Function logs
- Resend dashboard status
- Any error messages you see
