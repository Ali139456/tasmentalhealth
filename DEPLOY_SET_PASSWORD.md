# Deploy and Use Set Admin Password Function

## Your Project Details
- **Project Reference**: `azhurpnhsvoaczuktldw`
- **Project URL**: `https://azhurpnhsvoaczuktldw.supabase.co`

## Step-by-Step Deployment

### Step 1: Deploy the Edge Function

Open your terminal and run:

```bash
cd /Users/mac/Documents/tasmentalhealth

# Deploy the function
supabase functions deploy set-admin-password
```

**If you don't have Supabase CLI installed:**
```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (if not already linked)
supabase link --project-ref azhurpnhsvoaczuktldw
```

### Step 2: Get Your Anon Key

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Copy the **`anon` `public`** key (not the service_role key)
3. Save it - you'll need it in Step 3

### Step 3: Call the Function

**Option A: Using the HTML page (Easiest)**

1. Open the file `set-password.html` in your browser
2. Enter your anon key when prompted
3. Click "Set Password"
4. Check the result

**Option B: Using curl command**

Replace `YOUR_ANON_KEY` with your actual anon key:

```bash
curl -X POST https://azhurpnhsvoaczuktldw.supabase.co/functions/v1/set-admin-password \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "info@tasmentalhealthdirectory.com.au",
    "password": "Tasmental@123"
  }'
```

**Option C: Using the provided script**

Run the `set-password.sh` script (make it executable first):

```bash
chmod +x set-password.sh
./set-password.sh YOUR_ANON_KEY
```

## Step 4: Verify

1. Go to `/admin-login`
2. Email: `info@tasmentalhealthdirectory.com.au`
3. Password: `Tasmental@123`
4. You should be able to log in!

## Troubleshooting

If you get "Function not found":
- Make sure you deployed the function: `supabase functions deploy set-admin-password`
- Check that you're using the correct project reference

If you get "Unauthorized":
- Make sure you're using the `anon` key, not the `service_role` key
- The anon key should start with `eyJ...`

If you get "User not found":
- Make sure you ran the SQL script to make `info@` an admin first
- Check that `info@tasmentalhealthdirectory.com.au` exists in Supabase Auth → Users
