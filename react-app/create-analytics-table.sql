-- ============================================
-- Analytics & Insights Tracking System
-- ============================================
-- Tracks user behavior: page views, search queries, filters, clicks, referrers
-- ============================================

-- Main analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'page_view', 'search', 'filter', 'listing_click', 'link_click', 'time_on_page'
  page_path TEXT NOT NULL, -- Which page the event occurred on
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional: logged-in user
  session_id TEXT, -- Browser session identifier
  referrer TEXT, -- Where the user came from
  user_agent TEXT, -- Browser/device info
  ip_address TEXT, -- IP address (for location analysis)
  
  -- Event-specific data (stored as JSONB for flexibility)
  event_data JSONB, -- Flexible data structure for different event types
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page ON analytics_events(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_data ON analytics_events USING GIN(event_data);

-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert analytics events (for tracking)
CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read analytics
CREATE POLICY "Admins can read analytics events"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- Helper function to get session ID
-- ============================================
-- This will be generated client-side, but we can use it for grouping

-- ============================================
-- Sample queries for analytics dashboard:
-- ============================================

-- Top pages by views
-- SELECT page_path, COUNT(*) as views 
-- FROM analytics_events 
-- WHERE event_type = 'page_view' 
-- GROUP BY page_path 
-- ORDER BY views DESC;

-- Top search queries
-- SELECT event_data->>'query' as query, COUNT(*) as searches
-- FROM analytics_events 
-- WHERE event_type = 'search' 
-- GROUP BY query 
-- ORDER BY searches DESC 
-- LIMIT 20;

-- Most used filters
-- SELECT event_data->>'filter_type' as filter_type, event_data->>'filter_value' as filter_value, COUNT(*) as uses
-- FROM analytics_events 
-- WHERE event_type = 'filter' 
-- GROUP BY filter_type, filter_value 
-- ORDER BY uses DESC;

-- Top referrers
-- SELECT referrer, COUNT(*) as visits
-- FROM analytics_events 
-- WHERE event_type = 'page_view' AND referrer IS NOT NULL
-- GROUP BY referrer 
-- ORDER BY visits DESC 
-- LIMIT 20;

-- Most clicked listings
-- SELECT event_data->>'listing_id' as listing_id, event_data->>'listing_name' as listing_name, COUNT(*) as clicks
-- FROM analytics_events 
-- WHERE event_type = 'listing_click' 
-- GROUP BY listing_id, listing_name 
-- ORDER BY clicks DESC 
-- LIMIT 20;

-- Average time on page
-- SELECT page_path, AVG((event_data->>'duration')::numeric) as avg_seconds
-- FROM analytics_events 
-- WHERE event_type = 'time_on_page' 
-- GROUP BY page_path 
-- ORDER BY avg_seconds DESC;
