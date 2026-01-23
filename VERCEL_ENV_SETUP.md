# Vercel Environment Variables Setup

Your Vercel deployment needs environment variables to connect to Supabase and Stripe.

## Required Environment Variables

You need to add these environment variables in Vercel:

### 1. Supabase Configuration
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

### 2. Stripe Configuration (Optional but recommended)
- `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key

## How to Add Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Find your project: `tasmentalhealth`
3. Click on it to open project settings

### Step 2: Navigate to Environment Variables
1. Click on **Settings** tab
2. Click on **Environment Variables** in the left sidebar

### Step 3: Add Each Variable
For each variable, click **Add New** and enter:

#### Variable 1: VITE_SUPABASE_URL
- **Key**: `VITE_SUPABASE_URL`
- **Value**: Your Supabase project URL (e.g., `https://azhurpnhsvoaczuktldw.supabase.co`)
- **Environment**: Select all (Production, Preview, Development)
- Click **Save**

#### Variable 2: VITE_SUPABASE_ANON_KEY
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: Your Supabase anonymous key (starts with `eyJ...`)
- **Environment**: Select all (Production, Preview, Development)
- Click **Save**

#### Variable 3: VITE_STRIPE_PUBLISHABLE_KEY
- **Key**: `VITE_STRIPE_PUBLISHABLE_KEY`
- **Value**: Your Stripe publishable key (starts with `pk_live_...` or `pk_test_...`)
- **Environment**: Select all (Production, Preview, Development)
- Click **Save**

### Step 4: Redeploy
After adding all variables:
1. Go to the **Deployments** tab
2. Find the latest deployment
3. Click the three dots (⋮) menu
4. Click **Redeploy**
5. Or push a new commit to trigger automatic redeploy

## Where to Find Your Values

### Supabase URL and Key
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_ANON_KEY`

### Stripe Publishable Key
1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Publishable key** (starts with `pk_`)

## Important Notes

- ⚠️ **Never commit** these values to git - they should only be in Vercel
- ✅ The `.env` file is already in `.gitignore` so it won't be committed
- 🔄 After adding variables, you **must redeploy** for them to take effect
- 🌍 Make sure to select **all environments** (Production, Preview, Development) when adding variables

## Verify Setup

After redeploying, visit your site and try to log in. The error message should be gone and authentication should work.
