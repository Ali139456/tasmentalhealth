# Deploy Admin Delete User Edge Function

The `admin-delete-user` Edge Function must be deployed to Supabase for the delete user feature to work.

## Quick Deploy via Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Navigate to your project: https://supabase.com/dashboard
   - Select your project

2. **Open Edge Functions**
   - Click on "Edge Functions" in the left sidebar
   - Or go directly to: `https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/functions`

3. **Create New Function**
   - Click "Create a new function" button
   - Name it: `admin-delete-user`

4. **Copy the Code**
   - Open the file: `supabase/functions/admin-delete-user/index.ts`
   - Copy ALL the code
   - Paste it into the Supabase function editor

5. **Deploy**
   - Click "Deploy" button
   - Wait for deployment to complete (usually takes 30-60 seconds)

6. **Verify**
   - The function should appear in your functions list
   - Status should be "Active"

## Deploy via CLI (Alternative)

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy admin-delete-user
```

## Environment Variables

The function uses these environment variables (should be auto-configured):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (for admin operations)

These are automatically available in Supabase Edge Functions, so you don't need to set them manually.

## Testing

After deployment, try deleting a user from the Admin Dashboard. You should see:
- ✅ Success toast: "User deleted successfully!"
- ❌ Error toast: If there's an issue, it will show a clear error message

## Troubleshooting

### CORS Error
If you see CORS errors:
1. Make sure the function is deployed
2. Check that the OPTIONS method returns 200 status
3. Verify CORS headers are set correctly in the function

### Function Not Found (404)
- The function hasn't been deployed yet
- Check the function name matches exactly: `admin-delete-user`
- Verify you're using the correct Supabase project

### Permission Denied
- Ensure the user making the request has `admin` role
- Check that the service role key is configured correctly
