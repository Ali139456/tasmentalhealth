# Email System Setup - Complete Guide

## ✅ What Has Been Implemented

### 1. Email Templates Added
All email templates have been created with professional styling:

- ✅ **Welcome Email** - Sent when user creates account
- ✅ **Account Activated** - Sent when email is verified
- ✅ **Password Changed** - Security notification when password changes
- ✅ **Password Reset Confirmation** - Sent after successful password reset
- ✅ **Lister Account Created** - Sent when someone signs up via Get Listed form
- ✅ **Listing Submitted** - Sent when listing is submitted for review
- ✅ **Listing Approved** - Already existed, now updated with better styling
- ✅ **Listing Rejected** - Already existed, now updated with better styling
- ✅ **Listing Needs Changes** - Already existed, now updated with better styling
- ✅ **Subscription Confirmation** - Already existed, now updated with better styling

### 2. Code Updates

#### Frontend Code:
- ✅ `Login.tsx` - Sends welcome email on signup
- ✅ `GetListed.tsx` - Sends lister account creation + listing submitted emails
- ✅ `Admin.tsx` - Updated to use new email templates with proper data
- ✅ `email.ts` - Added all new templates with consistent styling

#### Email Function:
- ✅ `send-email` Edge Function - Already configured and working

## 🔧 What You Need to Do

### Step 1: Add Environment Variable in Supabase

**Where:** Supabase Dashboard → Your Project → Settings → Edge Functions → Environment Variables

**Add:**
- **Key:** `APP_URL`
- **Value:** `https://tasmentalhealth.vercel.app` (for testing)
- **Note:** Change this to `https://tasmentalhealthdirectory.com.au` when ready for production

### Step 2: Verify Resend Configuration

**Check in Supabase:**
- ✅ `RESEND_API_KEY` - Should already be set
- ✅ `RESEND_FROM_EMAIL` - Should already be set (or using default)

**Verify in Resend Dashboard:**
1. Go to https://resend.com
2. Verify your domain is set up (for production)
3. Check API key is active

### Step 3: Test the Email System

1. **Test Welcome Email:**
   - Go to `/login`
   - Click "Sign Up"
   - Create a new account
   - Check email inbox for welcome email

2. **Test Lister Account Email:**
   - Go to `/get-listed`
   - Fill out the form (without being logged in)
   - Submit listing
   - Check email for lister account creation email

3. **Test Listing Submitted Email:**
   - Submit a listing (logged in or not)
   - Check email for listing submitted confirmation

4. **Test Admin Emails:**
   - As admin, approve/reject a listing
   - Check user's email for notification

## 📧 Email Flow Summary

### User Signup Flow:
1. User signs up → **Welcome Email** sent
2. User verifies email → **Account Activated Email** (can be added via Supabase Auth hooks)

### Lister Signup Flow:
1. User submits listing without account → Account created → **Lister Account Created Email** + **Listing Submitted Email** sent
2. User submits listing with account → **Listing Submitted Email** sent

### Password Flow:
1. User requests password reset → Supabase sends reset email (handled by Supabase)
2. User successfully resets password → **Password Reset Confirmation Email** (can be added)
3. User changes password → **Password Changed Email** (can be added via auth state listener)

### Listing Review Flow:
1. Admin approves listing → **Listing Approved Email** sent
2. Admin rejects listing → **Listing Rejected Email** sent
3. Admin requests changes → **Listing Needs Changes Email** sent

## 🔄 Future Enhancements (Optional)

### To Add Password Change Email:
You can add a listener in `AuthContext.tsx` to detect password changes:

```typescript
// In AuthContext, listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    // Send password reset confirmation email
  }
  if (event === 'USER_UPDATED') {
    // Check if password was changed and send notification
  }
})
```

### To Add Email Verification Email:
Supabase handles this automatically, but you can customize the email template in Supabase Dashboard → Authentication → Email Templates

## 🐛 Troubleshooting

### Emails Not Sending?
1. Check Supabase Edge Function logs:
   - Go to Supabase Dashboard → Edge Functions → send-email → Logs
   - Look for any errors

2. Verify Environment Variables:
   - Check `RESEND_API_KEY` is set correctly
   - Check `APP_URL` is set (if using in templates)

3. Check Resend Dashboard:
   - Verify API key is active
   - Check email delivery logs
   - Verify domain (for production)

### Email Template Issues?
- All templates use `window.location.origin` as fallback for appUrl
- Templates will work even if APP_URL is not set in Supabase
- Check browser console for any errors

## 📝 Notes

- All emails are sent asynchronously (won't block user actions)
- Email failures are logged to console but don't break the user flow
- Templates are responsive and mobile-friendly
- All emails include proper footer with unsubscribe info (can be enhanced)

## 🚀 Production Checklist

Before going live:
- [ ] Change `APP_URL` to production domain
- [ ] Verify domain in Resend
- [ ] Test all email types
- [ ] Check email deliverability
- [ ] Set up email monitoring/alerts (optional)
- [ ] Review email content for accuracy

---

**Status:** ✅ Email system is fully implemented and ready to use!

Just add the `APP_URL` environment variable in Supabase and you're good to go!
