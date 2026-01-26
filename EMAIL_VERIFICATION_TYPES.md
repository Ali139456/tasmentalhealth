# Email Verification Types in Supabase

## 📧 Two Different Email Types

### 1. **Signup Verification** (`type: 'signup'`)
- Used when: **New user is registering**
- Sent: Automatically by Supabase when user signs up
- Purpose: Verify email for newly created account
- When to use: During initial account creation

### 2. **Email Verification** (`type: 'email'`)
- Used when: **Existing user needs to verify their email**
- Sent: When user clicks "Resend Email" or needs to verify
- Purpose: Verify email for existing account
- When to use: For users who already have an account but unverified email

## 🔧 The Fix

The `send-verification-email` function was using `type: 'signup'` which caused the error:
> "A user with this email address has already been registered"

**Solution:** Changed to `type: 'email'` for existing users who need verification.

## ✅ Updated Code

```typescript
// OLD (caused error for existing users):
supabase.auth.admin.generateLink({
  type: 'signup',  // ❌ Only for new signups
  email: email,
})

// NEW (works for existing users):
supabase.auth.admin.generateLink({
  type: 'email',  // ✅ For existing users
  email: email,
  options: {
    emailRedirectTo: `${APP_URL}/dashboard`,
  }
})
```

## 📋 What You Need to Do

1. **Update the code** - I've already fixed it in the file
2. **Redeploy the function** in Supabase Dashboard:
   - Go to Edge Functions → `send-verification-email`
   - Click "Deploy" or update the code
   - The updated code is in: `supabase/functions/send-verification-email/index.ts`

## 🎯 Result

- ✅ Signup emails: Use `type: 'signup'` (handled by Supabase automatically)
- ✅ Verification emails: Use `type: 'email'` (our Edge Function)
- ✅ No more "already registered" errors
- ✅ Works for existing users who need to verify
