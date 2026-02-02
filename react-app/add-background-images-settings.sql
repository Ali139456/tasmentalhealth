-- ============================================
-- Background Images Management System
-- ============================================
-- Adds background image settings for pages and panels
-- ============================================

-- Insert background image settings for different pages and sections
INSERT INTO site_content_settings (setting_key, setting_type, page_path, category, label, value, description) VALUES
  -- Home Page Background Images
  ('home_hero_background', 'image_url', '/', 'background', 'Home Hero Background Image', '', 'Background image for the hero section on the home page'),
  ('home_directory_background', 'image_url', '/', 'background', 'Directory Section Background', '', 'Background image for the directory/search section'),
  ('home_about_background', 'image_url', '/', 'background', 'About Section Background', '', 'Background image for the about section'),
  ('home_resources_background', 'image_url', '/', 'background', 'Resources Section Background', '', 'Background image for the resources section'),
  
  -- Crisis Support Page Background Images
  ('crisis_hero_background', 'image_url', '/crisis-support', 'background', 'Crisis Support Hero Background', '', 'Background image for the hero section on the crisis support page'),
  ('crisis_safety_plan_background', 'image_url', '/crisis-support', 'background', 'Safety Plan Section Background', '', 'Background image for the safety plan section'),
  
  -- Resources Page Background Images
  ('resources_hero_background', 'image_url', '/resources', 'background', 'Resources Hero Background', '', 'Background image for the hero section on the resources page'),
  ('resources_content_background', 'image_url', '/resources', 'background', 'Resources Content Background', '', 'Background image for the main content area'),
  
  -- Events Page Background Images
  ('events_hero_background', 'image_url', '/events', 'background', 'Events Hero Background', '', 'Background image for the hero section on the events page'),
  ('events_list_background', 'image_url', '/events', 'background', 'Events List Background', '', 'Background image for the events list section'),
  
  -- Get Listed Page Background Images
  ('get_listed_hero_background', 'image_url', '/get-listed', 'background', 'Get Listed Hero Background', '', 'Background image for the hero section on the get listed page'),
  ('get_listed_form_background', 'image_url', '/get-listed', 'background', 'Get Listed Form Background', '', 'Background image for the form section'),
  
  -- Global Background Images
  ('global_header_background', 'image_url', 'global', 'background', 'Header Background', '', 'Background image for the site header'),
  ('global_footer_background', 'image_url', 'global', 'background', 'Footer Background', '', 'Background image for the site footer')
ON CONFLICT (setting_key) DO NOTHING;
