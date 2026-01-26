# Email System Verification Checklist

## ✅ Domain Verification
Your domain `tasmentalhealthdirectory.com.au` is verified in Resend! This means emails will be sent from your domain.

## ✅ Email Configuration

### 1. Supabase Edge Function Setup
- **Function Name**: `send-email`
- **Location**: `supabase/functions/send-email/index.ts`
- **Status**: ✅ Configured

### 2. Environment Variables (Supabase Dashboard)
Make sure these are set in **Supabase Dashboard → Project Settings → Edge Functions → Secrets**:

- ✅ `RESEND_API_KEY` - Your Resend API key
- ✅ `RESEND_FROM_EMAIL` - Should be: `Tasmanian Mental Health Directory <noreply@tasmentalhealthdirectory.com.au>`

### 3. Email Templates
All email templates are configured:
- ✅ Welcome email (sent on account creation)
- ✅ Account activated
- ✅ Password changed
- ✅ Password reset
- ✅ Listing submitted
- ✅ Listing approved/rejected
- ✅ Event subscription confirmation

## 🧪 Testing Email Functionality

### Test Account Creation Email:
1. Go to `/login` page
2. Click "Sign Up"
3. Enter a test email address
4. Create an account
5. **You should receive a welcome email** within a few seconds

### What to Check:
- ✅ Email arrives in inbox (check spam folder too)
- ✅ Email is from `noreply@tasmentalhealthdirectory.com.au`
- ✅ Email has proper formatting and branding
- ✅ Links in email work correctly

## 🔍 Troubleshooting

### If emails are not received:

1. **Check Supabase Logs**:
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Look for `send-email` function logs
   - Check for any errors

2. **Verify Environment Variables**:
   - Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Ensure `RESEND_API_KEY` is set correctly
   - Ensure `RESEND_FROM_EMAIL` matches your verified domain

3. **Check Resend Dashboard**:
   - Go to Resend Dashboard → Logs
   - Check if emails are being sent
   - Look for any delivery errors

4. **Check Spam Folder**:
   - Sometimes emails go to spam initially
   - Mark as "Not Spam" to improve deliverability

5. **Verify Domain Status**:
   - Go to Resend Dashboard → Domains
   - Ensure domain shows "Verified" status
   - Check DNS records are correct

## 📧 Email Flow on Account Creation

When a user creates an account:
1. User signs up on `/login` page
2. Supabase creates the user account
3. **Welcome email is automatically sent** via Edge Function
4. Email is sent from `noreply@tasmentalhealthdirectory.com.au`
5. User receives welcome email

## ✅ Current Status

- ✅ Domain verified in Resend
- ✅ Email system configured
- ✅ Welcome email template ready
- ✅ Edge Function deployed (verify in Supabase Dashboard)

**Next Step**: Test by creating a new account and checking if you receive the welcome email!
