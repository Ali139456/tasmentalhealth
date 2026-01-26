# Fix: Domain Verification Issue

## 🔍 The Problem

The error shows:
> "The www.tasmentalhealthdirectory.com.au domain is not verified"

But in Resend, only `tasmentalhealthdirectory.com.au` (without `www`) is verified.

## ✅ Solution

I've updated all Edge Functions to use the verified domain (without `www`):

**Changed from:**
- `noreply@www.tasmentalhealthdirectory.com.au` ❌ (not verified)

**Changed to:**
- `noreply@tasmentalhealthdirectory.com.au` ✅ (verified)

## 📝 Update Supabase Secret

**Update the `RESEND_FROM_EMAIL` secret:**

1. Go to **Supabase Dashboard → Project Settings → Edge Functions → Secrets**
2. Find `RESEND_FROM_EMAIL` secret
3. Update the value to:
   ```
   Tasmanian Mental Health Directory <noreply@tasmentalhealthdirectory.com.au>
   ```
   (Remove `www.` from the email address)

4. Save the changes

## 🔄 Redeploy Edge Functions

After updating the secret, redeploy these functions:
1. `send-email`
2. `send-verification-email`
3. `password-reset`
4. `admin-delete-user`

## ✅ Alternative: Verify www Subdomain

If you want to use `www.tasmentalhealthdirectory.com.au`:

1. Go to **Resend Dashboard → Domains**
2. Click on `tasmentalhealthdirectory.com.au`
3. Add `www` as a subdomain
4. Add the required DNS records for `www` subdomain
5. Wait for verification

But using the verified domain (without www) is the quickest fix!
