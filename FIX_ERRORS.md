# Fixing Dashboard Errors

## Error 1: CORS Error on Stripe Functions

**Error:** `Access to fetch at 'https://azhurpnhsvoaczuktldw.supabase.co/functions/v1/stripe-create-checkout' from origin 'https://tasmentalhealth.vercel.app' has been blocked by CORS policy`

**Solution:** Deploy the Stripe Edge Functions to Supabase

### Steps to Deploy:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/azhurpnhsvoaczuktldw
   - Click on **Edge Functions** in the left sidebar

2. **Deploy `stripe-create-checkout` function:**
   - Click **Create a new function**
   - Name: `stripe-create-checkout`
   - Copy the entire code from: `supabase/functions/stripe-create-checkout/index.ts`
   - Paste it into the function editor
   - Click **Deploy**

3. **Deploy `stripe-create-portal` function:**
   - Click **Create a new function**
   - Name: `stripe-create-portal`
   - Copy the entire code from: `supabase/functions/stripe-create-portal/index.ts`
   - Paste it into the function editor
   - Click **Deploy**

4. **Verify deployment:**
   - Both functions should appear in the Edge Functions list
   - They should show as "Active"

## Error 2: 406 Error on Subscriptions Query

**Error:** `Failed to load resource: the server responded with a status of 406 ()` on subscriptions endpoint

**Solution:** Fixed in code - changed `.single()` to `.maybeSingle()` to handle cases where no subscription exists.

**Status:** ✅ Already fixed in the latest code. You need to push and redeploy.

## After Fixing:

1. **Push the code fix:**
   ```bash
   git add -A
   git commit -m "Fix subscriptions query to handle no results"
   git push origin main
   ```

2. **Deploy Edge Functions** (see Error 1 above)

3. **Redeploy on Vercel** (should happen automatically after git push)

4. **Test the dashboard** - both errors should be resolved

## Quick Checklist:

- [ ] Deploy `stripe-create-checkout` Edge Function
- [ ] Deploy `stripe-create-portal` Edge Function  
- [ ] Push code fix for subscriptions query
- [ ] Wait for Vercel to redeploy
- [ ] Test "Upgrade to Featured" button
