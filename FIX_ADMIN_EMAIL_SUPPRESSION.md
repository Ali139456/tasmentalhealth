# Fix Admin Email Suppression Issue

## Problem
Admin emails to `info@tasmentalhealthdirectory.com.au` are showing as "Suppressed" in Resend, meaning they're not being delivered.

## Why Emails Get Suppressed
1. **Hard Bounce**: Email address doesn't exist or is invalid
2. **Spam Complaint**: Recipient marked email as spam
3. **Manual Suppression**: Email was manually suppressed in Resend
4. **Domain Issues**: Domain not properly verified in Resend

## How to Fix

### Option 1: Unsuppress in Resend Dashboard (Recommended)
1. Go to [Resend Dashboard](https://resend.com/emails)
2. Navigate to **Emails** → **Suppressions** (or **Audience** → **Suppressions**)
3. Search for `info@tasmentalhealthdirectory.com.au`
4. Click **"Remove"** or **"Unsuppress"** button
5. Confirm the action

### Option 2: Verify Email Address Exists
1. Try sending a test email to `info@tasmentalhealthdirectory.com.au` from another email service
2. Check if the email address actually exists and can receive emails
3. If it doesn't exist, create the email address or use a different one

### Option 3: Check Domain Verification
1. Go to Resend Dashboard → **Domains**
2. Verify that `tasmentalhealthdirectory.com.au` is verified
3. Check SPF, DKIM, and DMARC records are properly configured
4. If domain is not verified, complete the verification process

### Option 4: Use a Different Admin Email
If the current admin email keeps getting suppressed, you can:
1. Update the admin user's email in the database to a different address
2. Or add a fallback email address in the code

## Verify Fix
After unsuppressing:
1. Wait a few minutes for the change to propagate
2. Trigger a test admin notification (e.g., create a new listing)
3. Check Resend Dashboard → **Emails** to see if the email is now "Delivered" instead of "Suppressed"

## Prevention
- Ensure admin email address is valid and actively monitored
- Don't mark admin notification emails as spam
- Keep domain verification up to date
- Monitor bounce rates in Resend Dashboard
