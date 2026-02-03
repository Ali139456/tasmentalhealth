-- Add Header and Footer Management Tables
-- Run this in Supabase SQL Editor

-- Table for footer links
CREATE TABLE IF NOT EXISTS footer_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL, -- 'find_support', 'information', 'custom'
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT, -- Optional icon name
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for custom pages
CREATE TABLE IF NOT EXISTS custom_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT,
  is_published BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add header/footer content settings to site_content_settings
INSERT INTO site_content_settings (setting_key, setting_type, page_path, category, label, value, description) VALUES
  -- Header Settings
  ('header_search_placeholder', 'text', 'global', 'header', 'Search Placeholder', 'Search entire site...', 'Placeholder text for header search bar'),
  ('header_nav_home', 'text', 'global', 'header', 'Home Navigation Label', 'Home', 'Label for home navigation link'),
  ('header_nav_resources', 'text', 'global', 'header', 'Resources Navigation Label', 'Resources', 'Label for resources navigation link'),
  ('header_nav_events', 'text', 'global', 'header', 'Events Navigation Label', 'Events', 'Label for events navigation link'),
  
  -- Footer Settings
  ('footer_description', 'text', 'global', 'footer', 'Footer Description', 'The trusted directory connecting Tasmanians with verified psychologists, counsellors, and mental health social workers. Find support in Hobart, Launceston, Devonport, Burnie and rural Tasmania.', 'Main description text in footer'),
  ('footer_copyright', 'text', 'global', 'footer', 'Copyright Text', '© 2026 Tasmanian Mental Health Directory. All rights reserved.', 'Copyright text in footer'),
  ('footer_tagline', 'text', 'global', 'footer', 'Footer Tagline', 'Made with care for Tasmania', 'Tagline text in footer'),
  ('footer_email', 'text', 'global', 'footer', 'Footer Email', 'info@tasmentalhealthdirectory.com.au', 'Email address displayed in footer'),
  ('footer_find_support_title', 'text', 'global', 'footer', 'Find Support Section Title', 'Find Support', 'Title for Find Support section in footer'),
  ('footer_information_title', 'text', 'global', 'footer', 'Information Section Title', 'Information', 'Title for Information section in footer')
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_footer_links_section ON footer_links(section);
CREATE INDEX IF NOT EXISTS idx_footer_links_order ON footer_links(order_index);
CREATE INDEX IF NOT EXISTS idx_custom_pages_slug ON custom_pages(slug);
CREATE INDEX IF NOT EXISTS idx_custom_pages_published ON custom_pages(is_published);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_footer_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_custom_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_footer_links_timestamp
  BEFORE UPDATE ON footer_links
  FOR EACH ROW
  EXECUTE FUNCTION update_footer_links_updated_at();

CREATE TRIGGER update_custom_pages_timestamp
  BEFORE UPDATE ON custom_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_pages_updated_at();

-- Insert default footer links
INSERT INTO footer_links (section, label, url, order_index) VALUES
  ('find_support', 'Find a Clinician', '/', 1),
  ('find_support', 'Crisis Support & Safety Plan', '/crisis-support', 2),
  ('find_support', 'Resources & Guides', '/resources', 3),
  ('find_support', 'List Your Practice', '/get-listed', 4),
  ('find_support', 'Featured Clinician Listings', '/featured-listings', 5),
  ('information', 'Privacy Policy', '/privacy-policy', 1),
  ('information', 'Terms of Service', '/terms-of-service', 2),
  ('information', 'Site Map', '/sitemap', 3),
  ('information', 'Admin Login', '/admin-login', 4)
ON CONFLICT DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read, admin write
CREATE POLICY "Public can read footer links"
  ON footer_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage footer links"
  ON footer_links FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Public can read published custom pages"
  ON custom_pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage custom pages"
  ON custom_pages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
