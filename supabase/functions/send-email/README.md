# Send Email Edge Function

This Supabase Edge Function handles sending emails via Resend.

## Setup

1. Get your Resend API key from https://resend.com/api-keys
2. Add the API key to Supabase:
   - Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Add secret: `RESEND_API_KEY` with your Resend API key value
   - Optionally add: `RESEND_FROM_EMAIL` with your verified domain email (e.g., `noreply@yourdomain.com`)

## Deploy

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-email
```

## Usage

The function is automatically called from `src/lib/email.ts` when using `sendEmail()`.

## Environment Variables

- `RESEND_API_KEY` (required): Your Resend API key
- `RESEND_FROM_EMAIL` (optional): Default from email address
