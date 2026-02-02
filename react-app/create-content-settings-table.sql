-- Create table for site content and SEO settings
-- This allows admins to customize text, fonts, sizes, colors, and SEO content

CREATE TABLE IF NOT EXISTS site_content_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_type TEXT NOT NULL, -- 'text', 'color', 'font_size', 'seo', 'description'
  page_path TEXT, -- Which page this setting applies to (e.g., '/', '/get-listed')
  category TEXT, -- 'hero', 'button', 'heading', 'meta', 'seo', etc.
  label TEXT NOT NULL, -- Human-readable label
  value TEXT NOT NULL, -- The actual value
  description TEXT, -- Help text for admins
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_content_settings_key ON site_content_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_site_content_settings_page ON site_content_settings(page_path);

-- Insert default values for key pages
INSERT INTO site_content_settings (setting_key, setting_type, page_path, category, label, value, description) VALUES
  -- Home Page
  ('home_hero_title', 'text', '/', 'hero', 'Home Hero Title', 'Tasmania''s Mental Health Directory - Connecting You to the Right Support', 'Main heading on homepage hero section'),
  ('home_hero_description', 'text', '/', 'hero', 'Home Hero Description', 'Search for trusted mental health professionals across Hobart, Launceston, and beyond - or list your practice for free to grow your visibility and connect with patients seeking mental health support in Tasmania.', 'Subheading text on homepage hero'),
  ('home_meta_title', 'seo', '/', 'meta', 'Home Meta Title', 'Tasmanian Mental Health Directory | Find Support or List Your Practice', 'SEO title tag for homepage'),
  ('home_meta_description', 'seo', '/', 'meta', 'Home Meta Description', 'Tasmanian Mental Health Directory - Find trusted mental health professionals across Hobart, Launceston, and beyond.', 'SEO meta description for homepage'),
  
  -- Get Listed Page
  ('get_listed_title', 'text', '/get-listed', 'hero', 'Get Listed Page Title', 'Join the Tasmanian Mental Health Directory', 'Main heading on Get Listed page'),
  ('get_listed_description', 'text', '/get-listed', 'hero', 'Get Listed Description', 'List your practice for free and connect with patients across Tasmania. Free directory listing for qualified mental health professionals.', 'Description text on Get Listed page'),
  
  -- Primary Colors
  ('primary_color', 'color', 'global', 'color', 'Primary Color', '#39B8A6', 'Main brand color (teal)'),
  ('primary_color_dark', 'color', 'global', 'color', 'Primary Color Dark', '#2E9385', 'Darker shade of primary color'),
  
  -- Font Sizes
  ('heading_size_h1', 'font_size', 'global', 'typography', 'H1 Font Size', 'text-xl sm:text-2xl md:text-3xl lg:text-4xl', 'Default H1 heading size classes'),
  ('heading_size_h2', 'font_size', 'global', 'typography', 'H2 Font Size', 'text-xl sm:text-2xl md:text-3xl lg:text-4xl', 'Default H2 heading size classes'),
  ('heading_size_h3', 'font_size', 'global', 'typography', 'H3 Font Size', 'text-lg sm:text-xl', 'Default H3 heading size classes'),
  
  -- Button Text
  ('button_list_practice', 'text', 'global', 'button', 'List Practice Button', 'List Your Practice Free', 'Text for main "List Practice" button'),
  ('button_find_professional', 'text', 'global', 'button', 'Find Professional Button', 'Find a Professional', 'Text for "Find Professional" button'),
  
  -- SEO Keywords
  ('seo_keywords', 'seo', 'global', 'seo', 'SEO Keywords', 'mental health Tasmania, psychologists Hobart, counsellors Launceston, therapy near me Tasmania', 'Comma-separated SEO keywords'),
  
  -- General Descriptions
  ('site_description', 'description', 'global', 'general', 'Site Description', 'Tasmania''s premier resource for mental wellbeing. Connecting those seeking help with dedicated mental health professionals.', 'General site description used in various places')
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_content_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_site_content_settings_timestamp
  BEFORE UPDATE ON site_content_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_content_settings_updated_at();

-- Grant permissions (adjust based on your RLS policies)
-- ALTER TABLE site_content_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read/write
-- CREATE POLICY "Admins can manage site content settings"
--   ON site_content_settings
--   FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM users
--       WHERE users.id = auth.uid()
--       AND users.role = 'admin'
--     )
--   );
