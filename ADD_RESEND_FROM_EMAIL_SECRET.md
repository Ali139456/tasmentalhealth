# Add RESEND_FROM_EMAIL Secret to Supabase

## 📋 Steps to Add the Secret

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to **Project Settings** (gear icon in left sidebar)
   - Click **Edge Functions** tab
   - Scroll to **Secrets** section

2. **Add New Secret**
   - Click **"Add new secret"** or **"New Secret"**
   - **Name**: `RESEND_FROM_EMAIL`
   - **Value**: `Tasmanian Mental Health Directory <noreply@www.tasmentalhealthdirectory.com.au>`

3. **Save**
   - Click **"Save"** or **"Add Secret"**

## ✅ Correct Format

The value should be in this format:
```
Tasmanian Mental Health Directory <noreply@www.tasmentalhealthdirectory.com.au>
```

**Important:**
- Use your verified domain: `www.tasmentalhealthdirectory.com.au`
- The format is: `Display Name <email@domain.com>`
- Make sure the domain is verified in Resend Dashboard

## 🔍 Verify in Resend

1. Go to **Resend Dashboard → Domains**
2. Make sure `www.tasmentalhealthdirectory.com.au` shows as **"Verified"**
3. If not verified, you'll need to add DNS records

## 📝 All Required Secrets

Make sure you have ALL these secrets set:

- ✅ `RESEND_API_KEY` - Your Resend API key
- ✅ `RESEND_FROM_EMAIL` - `Tasmanian Mental Health Directory <noreply@www.tasmentalhealthdirectory.com.au>`
- ✅ `APP_URL` - `https://www.tasmentalhealthdirectory.com.au`
- ✅ `SUPABASE_URL` - Your Supabase project URL (usually auto-set)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (usually auto-set)

## 🎯 After Adding

1. The Edge Functions will automatically use the new secret
2. No need to redeploy functions
3. Test by creating a new account or clicking "Resend Email"
