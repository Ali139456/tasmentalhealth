# Deploy Stripe Edge Functions

The CORS error you're seeing is because the Edge Functions haven't been deployed yet. Follow these steps:

## Option 1: Deploy via Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions** in the left sidebar
3. Click **Create a new function**
4. For each function:

### Function 1: `stripe-create-checkout`
- **Function name**: `stripe-create-checkout`
- **Copy and paste** the code from: `supabase/functions/stripe-create-checkout/index.ts`
- Click **Deploy**

### Function 2: `stripe-create-portal`
- **Function name**: `stripe-create-portal`
- **Copy and paste** the code from: `supabase/functions/stripe-create-portal/index.ts`
- Click **Deploy**

### Function 3: `stripe-webhook` (Optional, for automatic subscription updates)
- **Function name**: `stripe-webhook`
- **Copy and paste** the code from: `supabase/functions/stripe-webhook/index.ts`
- Click **Deploy**

## Option 2: Deploy via Supabase CLI

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (get project ref from Supabase Dashboard URL)
supabase link --project-ref azhurpnhsvoaczuktldw

# Deploy the functions
supabase functions deploy stripe-create-checkout
supabase functions deploy stripe-create-portal
supabase functions deploy stripe-webhook
```

## Verify Deployment

After deploying, test the function by:
1. Going to your Dashboard
2. Clicking "Upgrade to Featured"
3. The CORS error should be gone and you should be redirected to Stripe Checkout

## Troubleshooting

If you still see CORS errors after deployment:
1. Make sure the function names match exactly: `stripe-create-checkout` and `stripe-create-portal`
2. Check that all environment variables are set in Supabase Dashboard > Settings > Edge Functions > Secrets
3. Verify the function is deployed (should show in Edge Functions list)
4. Check the function logs in Supabase Dashboard for any errors
