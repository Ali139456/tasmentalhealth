# Stripe Payment Setup Verification

## ✅ Current Setup Status

### 1. Edge Functions
- ✅ `stripe-create-checkout` - Creates checkout sessions
- ✅ `stripe-webhook` - Handles webhook events
- ✅ `stripe-create-portal` - Manages customer portal

### 2. Database Schema
- ✅ `subscriptions` table exists with all required fields
- ⚠️ **IMPORTANT**: Check if `users` table has `stripe_customer_id` column

### 3. Required Environment Variables

**Supabase Edge Function Secrets:**
1. `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_`)
2. `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (starts with `whsec_`)
3. `SUPABASE_URL` - Your Supabase project URL
4. `SUPABASE_SERVICE_ROLE_KEY` - Service role key

## 🔍 Verification Steps

### Step 1: Check Database Schema
Run this in Supabase SQL Editor to check if `stripe_customer_id` column exists:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'stripe_customer_id';
```

**If it doesn't exist, add it:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
```

### Step 2: Verify Edge Function Secrets
Go to Supabase Dashboard → Edge Functions → Secrets

Check that these are set:
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET` (optional for testing, required for production)
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Deploy Edge Functions
Make sure all three functions are deployed:
1. `stripe-create-checkout`
2. `stripe-webhook`
3. `stripe-create-portal`

### Step 4: Configure Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://[your-project].supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret
5. Add it to Supabase Edge Function secrets as `STRIPE_WEBHOOK_SECRET`

## 🧪 Testing Payment Flow

### Test as a Lister:
1. Sign in as a lister
2. Go to Dashboard
3. Click "Upgrade to Featured" on a listing
4. You should be redirected to Stripe Checkout
5. Use Stripe test card: `4242 4242 4242 4242`
6. Complete payment
7. After payment, you should be redirected back to dashboard
8. Listing should be marked as "featured"

### What Should Happen:
1. ✅ Checkout session created
2. ✅ User redirected to Stripe
3. ✅ Payment processed
4. ✅ Webhook received
5. ✅ Listing marked as featured
6. ✅ Subscription record created in database

## ⚠️ Common Issues

### Issue: "Failed to create checkout session"
**Solution:**
- Check `STRIPE_SECRET_KEY` is set in Edge Function secrets
- Verify function is deployed
- Check browser console for errors

### Issue: Payment succeeds but listing not featured
**Solution:**
- Check webhook is configured correctly
- Verify `STRIPE_WEBHOOK_SECRET` is set
- Check Supabase logs for webhook errors
- Verify webhook endpoint URL is correct

### Issue: "stripe_customer_id column doesn't exist"
**Solution:**
- Run the ALTER TABLE command above
- The function will create customers automatically

## 📋 Checklist Before Going Live

- [ ] `stripe_customer_id` column exists in `users` table
- [ ] All Edge Functions deployed
- [ ] All secrets configured
- [ ] Webhook endpoint configured in Stripe
- [ ] Webhook secret added to Supabase
- [ ] Test payment completed successfully
- [ ] Webhook events being received
- [ ] Subscriptions table being updated
- [ ] Listings being marked as featured
