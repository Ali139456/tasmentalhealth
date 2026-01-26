-- Event subscriptions table
CREATE TABLE IF NOT EXISTS event_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  unsubscribed_at TIMESTAMPTZ,
  UNIQUE(email)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_email ON event_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_active ON event_subscriptions(is_active);

-- Row Level Security (RLS) Policies
ALTER TABLE event_subscriptions ENABLE ROW LEVEL SECURITY;

-- Public can insert their own subscriptions (no auth required)
CREATE POLICY "Public can subscribe to events" ON event_subscriptions
  FOR INSERT WITH CHECK (true);

-- Public can view their own subscription status
CREATE POLICY "Public can view subscription by email" ON event_subscriptions
  FOR SELECT USING (true);

-- Public can update their own subscription (for unsubscribing)
CREATE POLICY "Public can update their own subscription" ON event_subscriptions
  FOR UPDATE USING (true);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON event_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
