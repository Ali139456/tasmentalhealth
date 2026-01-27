# Set Password for info@tasmentalhealthdirectory.com.au

## Option 1: Using Supabase Dashboard (Easiest)

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Search for `info@tasmentalhealthdirectory.com.au`
3. Click on the user
4. Click **"Reset Password"** or **"Send Password Reset Email"**
5. Check the email inbox for `info@tasmentalhealthdirectory.com.au`
6. Click the reset link and set password to: `Tasmental@123`

## Option 2: Using Edge Function (Programmatic)

### Step 1: Deploy the Edge Function

The Edge Function is already created at `supabase/functions/set-admin-password/index.ts`

Deploy it using:
```bash
supabase functions deploy set-admin-password
```

### Step 2: Call the Function

After deployment, you can call it via:

**Using curl:**
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/set-admin-password \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "info@tasmentalhealthdirectory.com.au",
    "password": "Tasmental@123"
  }'
```

**Or create a simple HTML page:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Set Admin Password</title>
</head>
<body>
  <button onclick="setPassword()">Set Password</button>
  <div id="result"></div>
  
  <script>
    async function setPassword() {
      const response = await fetch('https://YOUR_PROJECT_REF.supabase.co/functions/v1/set-admin-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_ANON_KEY'
        },
        body: JSON.stringify({
          email: 'info@tasmentalhealthdirectory.com.au',
          password: 'Tasmental@123'
        })
      });
      
      const result = await response.json();
      document.getElementById('result').textContent = JSON.stringify(result, null, 2);
    }
  </script>
</body>
</html>
```

## Option 3: Direct SQL (Not Recommended - For Emergency Only)

Supabase doesn't allow direct password updates via SQL for security reasons. Passwords are hashed and stored securely.

If you absolutely need to do this via SQL, you would need to:
1. Generate a password reset link using `auth.admin.generateLink`
2. Or use the Supabase Admin API

## Recommended: Use Option 1 (Supabase Dashboard)

The easiest and most secure way is to use the Supabase Dashboard to reset the password.
