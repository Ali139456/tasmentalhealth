# How to Enable Email Verification in Supabase

## ✅ Important: Templates Don't Have Toggles

The email **templates** (like "Confirm sign up") are just the email content. They don't have enable/disable toggles. The actual email verification setting is in a different place.

## 🔍 Where to Find "Enable Email Confirmations"

### Option 1: Authentication Settings (Most Common)
1. Go to **Authentication** (left sidebar)
2. Look for **"Settings"** or **"General"** under CONFIGURATION
3. Look for a setting called:
   - **"Enable email confirmations"** 
   - OR **"Require email verification"**
   - OR **"Confirm email"**
4. Make sure it's **turned ON**

### Option 2: Email Settings Page
1. Go to **Authentication → Email** (NOTIFICATIONS section)
2. Look at the top of the page (above the Templates/SMTP tabs)
3. There might be a toggle for **"Enable email confirmations"**

### Option 3: Project Settings
1. Go to **Project Settings** (gear icon in left sidebar)
2. Look for **"Authentication"** section
3. Find **"Email"** or **"Email Confirmations"** setting

## 🎯 What You're Looking For

The setting might be labeled as:
- ✅ "Enable email confirmations"
- ✅ "Require email verification"
- ✅ "Confirm email address"
- ✅ "Email confirmation required"

## 📝 If You Can't Find It

If Supabase doesn't have this setting visible, it might mean:
1. **Email confirmations are enabled by default** - Supabase sends verification emails automatically
2. **It's controlled by the template** - If the "Confirm sign up" template exists, verification is active
3. **Check Supabase documentation** - Settings location may vary by Supabase version

## ✅ What's Already Working

Even if you can't find the toggle, our code sends verification emails via **Resend** (your custom email service):
- ✅ Sends on signup
- ✅ Resend button on dashboard
- ✅ Uses your verified domain

So verification emails should work regardless of Supabase's setting!

## 🧪 Test It

1. Create a new test account
2. Check your inbox (and spam folder)
3. You should receive a verification email from either:
   - Supabase (if their email is enabled)
   - OR your Resend domain (our custom email)

## 💡 Quick Check

Can you:
1. Go to **Authentication → Email**
2. Look at the **top of the page** (before the Templates/SMTP tabs)
3. See if there's any toggle or checkbox for email confirmations?

If not, that's okay - our custom email system handles it!
