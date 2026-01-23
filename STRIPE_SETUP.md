# Stripe Integration Setup Guide

This guide will help you set up Stripe payments for featured listings.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. A Supabase project with Edge Functions enabled

## Step 1: Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Publishable key** (starts with `pk_`)
3. Copy your **Secret key** (starts with `sk_`)

⚠️ **Important**: Use test keys for development, live keys for production.

## Step 2: Set Up Environment Variables

### Frontend (React App)

Create a `.env` file in the `react-app` directory:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Backend (Supabase Edge Functions)

1. Go to your Supabase Dashboard
2. Navigate to **Settings** > **Edge Functions** > **Secrets**
3. Add the following secrets:
   - `STRIPE_SECRET_KEY` = your Stripe secret key (starts with `sk_`)
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key (found in Settings > API)

Note: `SUPABASE_URL` is automatically available in Edge Functions.

## Step 3: Deploy Supabase Edge Functions

From the project root, deploy the Stripe functions:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the functions
supabase functions deploy stripe-create-checkout
supabase functions deploy stripe-create-portal
```

Or use the Supabase Dashboard:
1. Go to **Edge Functions** in your Supabase Dashboard
2. Create new functions and paste the code from:
   - `supabase/functions/stripe-create-checkout/index.ts`
   - `supabase/functions/stripe-create-portal/index.ts`

## Step 4: Set Up Stripe Webhook (Optional but Recommended)

To automatically update subscription status in your database:

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://your-project.supabase.co/functions/v1/stripe-webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret

Add the webhook secret to Supabase Edge Functions secrets:
- `STRIPE_WEBHOOK_SECRET` = your webhook signing secret

## Step 5: Update Database Schema

Run the migration SQL to add the `stripe_customer_id` column to the `users` table:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the SQL from `react-app/add-stripe-columns.sql`:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
```

Or execute the file directly in the SQL Editor.

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Log in to your dashboard
3. Create or approve a listing
4. Click "Upgrade to Featured"
5. Use Stripe test card: `4242 4242 4242 4242`
6. Complete the checkout flow

## Pricing

The current setup charges **$29 AUD per month** for featured listings. To change this:

1. Edit `supabase/functions/stripe-create-checkout/index.ts`
2. Change `unit_amount: 2900` (2900 cents = $29.00)
3. Redeploy the function

## Troubleshooting

### "Stripe publishable key not found"
- Make sure `VITE_STRIPE_PUBLISHABLE_KEY` is set in your `.env` file
- Restart your dev server after adding env variables

### "Failed to create checkout session"
- Check that Edge Functions are deployed
- Verify `STRIPE_SECRET_KEY` is set in Supabase secrets
- Check browser console for detailed error messages

### Subscription not updating after payment
- Set up the Stripe webhook (Step 4)
- Check webhook logs in Stripe Dashboard
- Verify webhook endpoint is accessible

## Support

For issues or questions:
- Stripe Docs: https://stripe.com/docs
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
