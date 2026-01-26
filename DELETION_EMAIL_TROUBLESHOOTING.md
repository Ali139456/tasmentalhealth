# User Deletion Email Troubleshooting Guide

## Current Status
✅ `RESEND_API_KEY` is set in Edge Function Secrets
✅ Code has been updated with email sending logic
⚠️ Function needs to be redeployed

## Steps to Fix

### 1. Redeploy the Edge Function
The function code has been updated but needs to be redeployed:

1. Go to Supabase Dashboard → Edge Functions → `admin-delete-user`
2. Click on the **"Code"** tab
3. Click **"Deploy updates"** button (green button at bottom right)
4. Wait for deployment to complete

### 2. Test the Function
After redeploying:

1. Go to your Admin panel
2. Delete a test user
3. Check the toast message - it will show:
   - ✅ "User deleted successfully! Deletion email sent to user." (if email sent)
   - ⚠️ "User deleted successfully, but email could not be sent: [error]" (if email failed)
   - ✅ "User deleted successfully!" (if no email configured)

### 3. Check the Logs
After deleting a user, check the logs:

1. Go to Supabase Dashboard → Edge Functions → `admin-delete-user` → **"Logs"** tab
2. Look for these log messages:
   - `Fetching user data for deletion, userId: [id]`
   - `User email retrieved: [email]`
   - `RESEND_API_KEY exists: true`
   - `Attempting to send deletion email to: [email]`
   - `Deletion email sent successfully to: [email]` ✅
   - OR error messages if something failed

### 4. Common Issues

#### Issue: "RESEND_API_KEY not configured"
**Solution:** 
- Go to Edge Functions → Secrets
- Add `RESEND_API_KEY` with your Resend API key
- Redeploy the function

#### Issue: "No user email found"
**Solution:**
- The user might not have an email in their auth record
- Check if the user exists in Supabase Auth

#### Issue: Email sent but not received
**Solution:**
- Check spam/junk folder
- Check Resend Dashboard → Logs to see delivery status
- Verify domain is properly verified in Resend

#### Issue: Function not being invoked
**Solution:**
- Check browser console for errors
- Verify the function URL is correct
- Check if CORS is blocking the request

### 5. Verify Email Delivery
1. Go to Resend Dashboard → Logs
2. Look for emails sent to the deleted user's email
3. Check delivery status (delivered, bounced, etc.)

## Expected Behavior

When you delete a user:
1. ✅ Function fetches user email
2. ✅ Checks if RESEND_API_KEY exists
3. ✅ Sends deletion email via Resend
4. ✅ Deletes user from database
5. ✅ Returns success with email status

## Next Steps

1. **Redeploy the function** (most important!)
2. **Test by deleting a user**
3. **Check logs** for email sending status
4. **Check Resend logs** for delivery status
