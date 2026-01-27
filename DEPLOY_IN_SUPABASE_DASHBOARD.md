# Deploy Edge Function in Supabase Dashboard

## Step-by-Step Instructions

### Step 1: Go to Edge Functions in Supabase Dashboard

1. Open your browser and go to: https://supabase.com/dashboard
2. Select your project: **Tasmanian Mental Health Directory**
3. In the left sidebar, click on **"Edge Functions"** (under "PROJECT" section)

### Step 2: Create New Function

1. Click the **"+ New Function"** button (usually top right)
2. Function name: `set-admin-password`
3. Click **"Create Function"**

### Step 3: Copy and Paste the Code

1. Delete any default code in the editor
2. Copy the ENTIRE code from `supabase/functions/set-admin-password/index.ts`
3. Paste it into the Supabase editor
4. The code should start with:
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
   ```

### Step 4: Deploy the Function

1. Click the **"Deploy"** button (usually top right of the editor)
2. Wait for deployment to complete (you'll see a success message)
3. The function URL will be: `https://azhurpnhsvoaczuktldw.supabase.co/functions/v1/set-admin-password`

### Step 5: Test the Function

You can test it using the HTML page (`set-password.html`) or the curl command below.

## Complete Code to Copy

Here's the full code to paste into Supabase Dashboard:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Find user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      throw userError
    }

    const user = userData.users.find(u => u.email === email)
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: `User with email ${email} not found` }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Update user password using admin API
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: password }
    )

    if (updateError) {
      console.error("Error updating password:", updateError)
      return new Response(
        JSON.stringify({ error: updateError.message || "Failed to update password" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    console.log("Password updated successfully for:", email)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Password updated successfully for ${email}`,
        userId: user.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error: any) {
    console.error("Function error:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error", stack: error.stack }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
```

## After Deployment

Once deployed, you can use the HTML page (`set-password.html`) which already has your anon key pre-filled, or use this curl command:

```bash
curl -X POST https://azhurpnhsvoaczuktldw.supabase.co/functions/v1/set-admin-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6aHVycG5oc3ZvYWN6dWt0bGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MTkwMzAsImV4cCI6MjA4MDM5NTAzMH0.qtrdEY7DudUsxe8Zyp14sm7yc4_f1Ek3NnufudM0PCA" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "info@tasmentalhealthdirectory.com.au",
    "password": "Tasmental@123"
  }'
```
