# Event Subscription Setup

## Database Setup

To enable event subscriptions, you need to create the `event_subscriptions` table in your Supabase database.

### Steps:

1. **Open Supabase Dashboard**
   - Go to your project dashboard
   - Navigate to **SQL Editor**

2. **Run the SQL Script**
   - Copy the contents of `create-event-subscriptions-table.sql`
   - Paste into the SQL Editor
   - Click **Run** to execute

3. **Verify Table Creation**
   - Go to **Table Editor**
   - You should see `event_subscriptions` table
   - It should have columns: `id`, `email`, `subscribed_at`, `is_active`, `unsubscribed_at`

## Features

- ✅ Users can subscribe to event notifications
- ✅ Prevents duplicate subscriptions (checks if email already exists)
- ✅ Reactivates previously unsubscribed emails
- ✅ Sends confirmation email to subscriber
- ✅ Sends notification email to admin
- ✅ Loading states and error handling
- ✅ Success/error messages displayed to user

## Email Templates

The system uses the `event_subscription` email template which includes:
- Welcome message
- Information about upcoming events
- Link to events page

## Testing

1. Go to `/events` page
2. Enter an email address
3. Click "Notify Me"
4. Check:
   - Success message appears
   - Email is saved in database
   - Confirmation email is sent
   - Admin notification is sent

## Admin Access

Admins can view all subscriptions in the database through:
- Supabase Dashboard → Table Editor → `event_subscriptions`
- Or create an admin page to view/manage subscriptions
