# Resend Email Setup Guide

This guide will help you connect Resend to your application for sending emails.

## Step 1: Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign up/login
2. Navigate to **API Keys** in the dashboard
3. Click **Create API Key**
4. Give it a name (e.g., "Tasmanian Mental Health Directory")
5. Copy the API key (starts with `re_`)

## Step 2: Verify Your Domain (Optional but Recommended)

For production, you should verify your domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `tasmentalhealthdirectory.com.au`)
4. Add the DNS records provided by Resend to your domain registrar
5. Wait for verification (usually takes a few minutes)

**Note:** For testing, you can use Resend's default domain, but emails may go to spam.

## Step 3: Add Secrets to Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **Tasmanian Mental Health Directory**
3. Go to **Project Settings** → **Edge Functions** → **Secrets**
4. Add the following secrets:

   - **Name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key (starts with `re_`)

   - **Name:** `RESEND_FROM_EMAIL` (optional)
   - **Value:** Your verified email (e.g., `noreply@tasmentalhealthdirectory.com.au`)

## Step 4: Deploy the Edge Function

### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   cd /Users/mac/Documents/tasmentalhealth
   supabase link --project-ref azhurpnhsvoaczuktldw
   ```

4. Deploy the function:
   ```bash
   supabase functions deploy send-email
   ```

### Option B: Using Supabase Dashboard

1. Go to Supabase Dashboard → **Edge Functions**
2. Click **Create a new function**
3. Name it: `send-email`
4. Copy the contents of `supabase/functions/send-email/index.ts`
5. Paste into the editor
6. Click **Deploy**

## Step 5: Test the Email Function

After deployment, you can test it from your app or directly:

```typescript
import { sendEmail } from './lib/email'

// Test email
await sendEmail({
  to: 'your-email@example.com',
  subject: 'Test Email',
  html: '<h1>Hello from Resend!</h1>'
})
```

## Troubleshooting

### Error: "RESEND_API_KEY environment variable is required"
- Make sure you added the secret in Supabase Dashboard → Edge Functions → Secrets

### Error: "Failed to send email"
- Check your Resend API key is correct
- Verify your domain in Resend (if using custom domain)
- Check Resend dashboard for error logs

### Emails going to spam
- Verify your domain in Resend
- Set up SPF, DKIM, and DMARC records
- Use a verified "from" email address

## Next Steps

Once Resend is connected, you can:
- Send listing approval/rejection emails
- Send subscription confirmation emails
- Send password reset emails
- Send welcome emails to new users

The email templates are already set up in `react-app/src/lib/email.ts`.
