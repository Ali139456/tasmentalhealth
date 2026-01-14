# Tasmanian Mental Health Directory

A modern React application for managing a mental health professional directory with admin and lister dashboards, Stripe subscriptions, and email notifications.

## Features

- ✅ **Public Directory**: Search and filter mental health professionals
- ✅ **Crisis Support**: Digital safety planning tool
- ✅ **Resources**: Mental health guides and articles
- ✅ **User Authentication**: Email verification and password reset
- ✅ **Lister Dashboard**: Manage listings and view status
- ✅ **Admin Dashboard**: Approve/reject listings, manage users
- ✅ **Email Notifications**: Automated emails via Resend
- ✅ **Stripe Integration**: Featured listing subscriptions
- ✅ **Real-time Sync**: Dashboard status updates automatically

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: Resend
- **Payments**: Stripe
- **Routing**: React Router v6

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
3. Get your project URL and anon key from Settings > API

### 3. Set Up Resend

1. Create an account at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Configure your domain for sending emails (SPF, DKIM, DMARC)

### 4. Set Up Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Get your publishable key from the dashboard
3. Set up webhook endpoints for subscription events

### 5. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RESEND_API_KEY=your_resend_api_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 6. Run Development Server

```bash
npm run dev
```

## Project Structure

```
src/
├── components/       # Reusable components (Header, Footer, Layout)
├── contexts/        # React contexts (AuthContext)
├── lib/            # Utilities (supabase, email, stripe, constants)
├── pages/           # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── GetListed.tsx
│   ├── CrisisSupport.tsx
│   ├── Resources.tsx
│   ├── Dashboard.tsx
│   └── Admin.tsx
├── types/          # TypeScript type definitions
└── App.tsx         # Main app component with routing
```

## Database Schema

The application uses the following main tables:

- `users` - User accounts with roles (admin, lister, public)
- `listings` - Professional listings with status tracking
- `subscriptions` - Stripe subscription data
- `safety_plans` - User safety plans (crisis support)
- `resources` - Articles and guides

See `supabase-schema.sql` for the complete schema with RLS policies.

## Key Features Explained

### Admin & Lister Dashboard Sync

When an admin approves/rejects a listing:
1. Database is updated immediately
2. Email is sent to the lister automatically
3. Lister's dashboard refreshes to show new status
4. No manual updates required

### Email System

All emails are sent via Resend with professional templates:
- Signup verification
- Password reset
- Listing approved/rejected/needs changes
- Subscription confirmation

### Stripe Subscriptions

- Listers can subscribe to featured listings
- Automatic status tracking (active, cancelled, past due)
- Featured listings appear higher in search results
- Subscription management in dashboard

### Security

- Row Level Security (RLS) policies in Supabase
- Protected admin routes
- Rate limiting on authentication
- Secure session management

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel/Netlify

1. Connect your repository
2. Add environment variables
3. Deploy

The build output will be in the `dist/` folder.

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |
| `VITE_RESEND_API_KEY` | Your Resend API key | Yes |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key | Yes |

## Support

For issues or questions, contact: info@tasmentalhealthdirectory.com.au

## License

© 2026 Tasmanian Mental Health Directory
