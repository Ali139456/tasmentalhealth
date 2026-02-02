-- ============================================
-- Events Management Table
-- ============================================
-- Stores community events, workshops, and seminars
-- ============================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_end_date TIMESTAMP WITH TIME ZONE,
  location TEXT NOT NULL,
  location_address TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('workshop', 'seminar', 'support_group', 'conference', 'training', 'other')),
  organizer_name TEXT,
  organizer_email TEXT,
  organizer_phone TEXT,
  registration_url TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  max_attendees INTEGER,
  cost TEXT, -- e.g., "Free", "$50", "Donation"
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(location);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

-- Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public can view published events
CREATE POLICY "Public can view published events"
  ON events
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage events"
  ON events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
