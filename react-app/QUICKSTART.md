# Quick Start Guide

## Prerequisites

- Node.js 18+ (20+ recommended)
- npm or yarn
- Supabase account
- Resend account
- Stripe account

## Step-by-Step Setup

### 1. Clone and Install

```bash
cd react-app
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (takes ~2 minutes)
3. Go to SQL Editor and run the contents of `supabase-schema.sql`
4. Go to Settings > API and copy:
   - Project URL
   - `anon` `public` key

### 3. Set Up Resend

1. Go to [resend.com](https://resend.com) and sign up
2. Get your API key from the dashboard
3. Add and verify your domain (for production)
4. Configure SPF, DKIM, and DMARC records

### 4. Set Up Stripe

1. Go to [stripe.com](https://stripe.com) and create an account
2. Get your publishable key from the dashboard
3. Set up a product for "Featured Listing" subscription
4. Configure webhooks (see BACKEND_SETUP.md)

### 5. Create Environment File

Create `.env` in the `react-app` directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_RESEND_API_KEY=re_your_api_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 6. Set Up Backend (Required for Email)

Choose one option:

**Option A: Supabase Edge Functions (Easiest)**
- See `BACKEND_SETUP.md` for instructions
- Deploy the `send-email` function

**Option B: Express.js API**
- See `BACKEND_SETUP.md` for instructions
- Run `npm start` in the server directory

### 7. Create First Admin User

1. Sign up through the app (creates a lister account)
2. Go to Supabase Dashboard > Table Editor > `users`
3. Find your user and change `role` to `'admin'`

### 8. Run the App

```bash
npm run dev
```

Visit `http://localhost:5173`

## Testing the Application

### Test User Flow

1. **Public User:**
   - Visit homepage
   - Search for listings
   - View crisis support page
   - Browse resources

2. **Lister:**
   - Click "Get Listed"
   - Fill out the form
   - Check email for verification
   - Log in to dashboard
   - View listing status

3. **Admin:**
   - Log in as admin
   - Go to Admin dashboard
   - Approve/reject listings
   - Manage users

### Test Email Flow

1. Sign up a new user
2. Check email for verification link
3. Admin approves a listing
4. Check lister's email for notification

## Common Issues

### "Missing Supabase environment variables"
- Make sure `.env` file exists in `react-app/` directory
- Check that variable names start with `VITE_`
- Restart the dev server after adding variables

### "Email not sending"
- Check that backend API is set up (see BACKEND_SETUP.md)
- Verify Resend API key is correct
- Check browser console for errors

### "Can't access admin dashboard"
- Make sure your user role is set to 'admin' in Supabase
- Check that you're logged in
- Refresh the page

### "Listings not showing"
- Check that listings have status 'approved'
- Verify RLS policies are set up correctly
- Check browser console for errors

## Next Steps

1. Customize the design (colors, fonts, etc.)
2. Add more resource articles
3. Set up production domain
4. Configure email domain properly
5. Set up Stripe webhooks
6. Add analytics
7. Set up error tracking (Sentry, etc.)

## Production Deployment

1. Build the app: `npm run build`
2. Deploy to Vercel/Netlify
3. Add environment variables in hosting platform
4. Set up custom domain
5. Configure email domain DNS records
6. Test all functionality

## Support

For detailed documentation, see:
- `README.md` - Full documentation
- `BACKEND_SETUP.md` - Backend API setup
- `supabase-schema.sql` - Database schema
