# Email Verification Setup Guide

## 📍 Where to Configure Email Verification in Supabase

### Step 1: Navigate to Email Settings
1. In Supabase Dashboard, go to **Authentication** (left sidebar)
2. Under **NOTIFICATIONS**, click **"Email"**
3. This is where you configure email verification

### Step 2: Check Email Confirmation Settings
On the Email settings page, look for:

1. **"Enable email confirmations"** toggle
   - ✅ **Should be ON** for email verification to work
   - If OFF, users can sign in without verifying email

2. **"Confirm email"** template
   - This is the email template Supabase uses
   - You can customize it or use the default

### Step 3: Configure URL Settings
Go to **Authentication → URL Configuration**:

1. **Site URL**: 
   - Set to: `https://www.tasmentalhealthdirectory.com.au`

2. **Redirect URLs**:
   - Add: `https://www.tasmentalhealthdirectory.com.au/**`
   - This allows redirects after email verification

### Step 4: Check Email Provider
Supabase uses its default email service, but you can configure custom SMTP:

1. Go to **Authentication → Email**
2. Scroll to **"SMTP Settings"** (if available)
3. Or use Supabase's default email service

## 🔍 Current Issue: Email Verification Not Received

### Possible Causes:
1. **Email confirmations disabled** - Check toggle in Email settings
2. **Email going to spam** - Check spam/junk folder
3. **Supabase email service limits** - Free tier has limits
4. **Wrong email address** - Verify the email used for signup

### Solutions:

#### Option 1: Enable Email Confirmations
1. Go to **Authentication → Email**
2. Turn ON **"Enable email confirmations"**
3. Save changes

#### Option 2: Use Custom Email (Already Implemented)
Our code now sends verification emails via Resend (your custom email service):
- ✅ Sends on signup
- ✅ Resend button on dashboard
- ✅ Uses your verified domain: `tasmentalhealthdirectory.com.au`

#### Option 3: Check Spam Folder
- Verification emails might be in spam/junk
- Mark as "Not Spam" to improve deliverability

## ✅ What's Already Working

1. **Custom Verification Email**:
   - Sent via Resend on signup
   - Uses `signup_verification` template
   - Includes verification link

2. **Resend Button**:
   - Available on dashboard for unverified users
   - Tries Supabase first, then custom email

3. **Email Templates**:
   - All templates configured in `react-app/src/lib/email.ts`
   - Uses your verified domain

## 🎯 Recommended Action

1. **Check Email Settings**:
   - Go to **Authentication → Email**
   - Enable "Enable email confirmations" if not already on

2. **Test Verification Email**:
   - Create a new test account
   - Check inbox (and spam folder)
   - Click "Resend Email" on dashboard if needed

3. **Verify Supabase Email Service**:
   - Check if Supabase is sending emails
   - Look at Supabase logs for email sending errors

## 📝 Notes

- **Sessions page** (what you're viewing) is for session management, not email settings
- **Email settings** are under **Authentication → Email** (NOTIFICATIONS section)
- Our custom email system (Resend) works independently of Supabase's email settings
- Both systems can work together for redundancy
