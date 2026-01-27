# Deploy Edge Function in Supabase Dashboard

## Step-by-Step Instructions

### Step 1: Go to Edge Functions in Supabase Dashboard

1. Open your browser and go to: https://supabase.com/dashboard
2. Select your project: **Tasmanian Mental Health Directory**
3. In the left sidebar, click **"Edge Functions"** (under "PROJECT" section)

### Step 2: Create New Function

1. Click the **"+ New Function"** button (usually top right)
2. Function name: `set-admin-password`
3. Click **"Create Function"**

### Step 3: Copy the Code

1. You'll see a code editor with a template
2. **Delete all the template code**
3. Copy the entire code from `supabase/functions/set-admin-password/index.ts`
4. Paste it into the editor

### Step 4: Deploy

1. Click the **"Deploy"** button (top right of the editor)
2. Wait for deployment to complete (you'll see a success message)

### Step 5: Test the Function

After deployment, you can test it using the HTML page or curl command below.

## Your Project Details

- **Project Reference**: `azhurpnhsvoaczuktldw`
- **Function URL**: `https://azhurpnhsvoaczuktldw.supabase.co/functions/v1/set-admin-password`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6aHVycG5oc3ZvYWN6dWt0bGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MTkwMzAsImV4cCI6MjA4MDM5NTAzMH0.qtrdEY7DudUsxe8Zyp14sm7yc4_f1Ek3NnufudM0PCA`

## Quick Test After Deployment

Open `set-password.html` in your browser - it already has your anon key pre-filled!

Or use curl:
```bash
curl -X POST https://azhurpnhsvoaczuktldw.supabase.co/functions/v1/set-admin-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6aHVycG5oc3ZvYWN6dWt0bGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MTkwMzAsImV4cCI6MjA4MDM5NTAzMH0.qtrdEY7DudUsxe8Zyp14sm7yc4_f1Ek3NnufudM0PCA" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "info@tasmentalhealthdirectory.com.au",
    "password": "Tasmental@123"
  }'
```
