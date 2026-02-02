-- ============================================
-- Expanded Content & SEO Management System
-- ============================================
-- This script adds ALL headings, descriptions, and button colors
-- Run this AFTER the initial SETUP_CONTENT_MANAGEMENT.sql
-- ============================================

-- Insert all page headings, descriptions, and button colors
INSERT INTO site_content_settings (setting_key, setting_type, page_path, category, label, value, description) VALUES
  -- ============================================
  -- HOME PAGE - All Headings & Descriptions
  -- ============================================
  ('home_heading_find_support', 'text', '/', 'heading', 'Find Mental Health Support Heading', 'Find Mental Health Support in Tasmania', 'Main heading in directory section'),
  ('home_description_find_support', 'text', '/', 'description', 'Find Support Description', 'Use the filters below to find psychologists, counsellors, and other specialists in your area.', 'Description text below directory heading'),
  ('home_heading_people_support', 'text', '/', 'heading', 'For People Seeking Support', 'For People Seeking Support', 'Heading for people seeking support section'),
  ('home_description_people_support', 'text', '/', 'description', 'People Support Description', 'Navigating mental health care can be overwhelming. We make it easier to find compassionate help. Whether you are looking for psychologists in Hobart, need anxiety counselling in Tasmania, or want to find a social worker in Tasmania, our directory connects you with verified local experts.', 'Description for people seeking support'),
  ('home_heading_professionals', 'text', '/', 'heading', 'For Professionals & Clinics', 'For Professionals & Clinics', 'Heading for professionals section'),
  ('home_description_professionals', 'text', '/', 'description', 'Professionals Description', 'Are you ready to grow your private practice in Hobart or statewide? Join Tasmania''s dedicated online directory for mental health professionals. List your practice for free and advertise psychology services in Tasmania effectively to patients actively seeking care.', 'Description for professionals section'),
  ('home_heading_connecting', 'text', '/', 'heading', 'Connecting You Heading', 'Connecting You with Mental Health Professionals Across Tasmania', 'Heading in about section'),
  ('home_description_connecting', 'text', '/', 'description', 'Connecting Description', 'Welcome to Tasmania''s premier resource for mental wellbeing. Our mission is to bridge the gap between those seeking help and the dedicated professionals who provide it. Whether you are searching for experienced psychologists in Hobart, compassionate counsellors in Tasmania, or specialised psychiatrists in Launceston, our directory is designed to help you find the right support close to home.', 'Description in about section'),
  ('home_heading_comprehensive', 'text', '/', 'heading', 'Comprehensive Support Heading', 'Comprehensive Support for Every Need', 'Subheading in about section'),
  ('home_description_comprehensive', 'text', '/', 'description', 'Comprehensive Support Description', 'We understand that mental health needs are diverse. That''s why we list a wide range of professionals. From sleep therapy in Hobart for those struggling with insomnia, to anxiety counselling in Tasmania for stress management, and trauma-informed care for deeper healing. You can also find a social worker in Tasmania who specialises in complex case management and family support.', 'Description for comprehensive support'),
  ('home_heading_clinicians', 'text', '/', 'heading', 'For Clinicians Heading', 'For Clinicians: Grow Your Practice', 'Subheading for clinicians'),
  ('home_description_clinicians', 'text', '/', 'description', 'Clinicians Description', 'If you are a practitioner, visibility is key to helping more people. By choosing to list your mental health practice in Tasmania on our platform, you join a trusted community of providers. We help you advertise psychology services in Tasmania directly to the people who are actively searching for them.', 'Description for clinicians section'),
  ('home_heading_resources', 'text', '/', 'heading', 'Mental Health Insights Heading', 'Mental Health Insights & Resources', 'Heading for resources section'),
  ('home_description_resources', 'text', '/', 'description', 'Resources Description', 'Expert guides on finding support and growing your practice in Tasmania.', 'Description for resources section'),
  
  -- ============================================
  -- CRISIS SUPPORT PAGE
  -- ============================================
  ('crisis_hero_title', 'text', '/crisis-support', 'hero', 'Crisis Support Hero Title', 'Support When You Need It', 'Main hero heading on crisis support page'),
  ('crisis_hero_description', 'text', '/crisis-support', 'hero', 'Crisis Support Hero Description', 'Immediate help, hospital contacts, and personal safety planning.', 'Hero description on crisis support page'),
  ('crisis_hero_subdescription', 'text', '/crisis-support', 'hero', 'Crisis Support Hero Sub Description', 'A safe, private space to organise your resources.', 'Sub description on crisis support page'),
  ('crisis_heading_safety_plan', 'text', '/crisis-support', 'heading', 'My Safety Plan Heading', 'My Safety Plan', 'Heading for safety plan section'),
  ('crisis_heading_emergency', 'text', '/crisis-support', 'heading', 'In an Emergency Heading', 'In an Emergency?', 'Heading for emergency section'),
  ('crisis_heading_helplines', 'text', '/crisis-support', 'heading', 'National Helplines Heading', 'National 24/7 Support Lines', 'Heading for helplines section'),
  ('crisis_heading_state_resources', 'text', '/crisis-support', 'heading', 'State Resources Heading', 'State & Territory Resources', 'Heading for state resources section'),
  
  -- ============================================
  -- RESOURCES PAGE
  -- ============================================
  ('resources_hero_title', 'text', '/resources', 'hero', 'Resources Hero Title', 'Mental Health Insights & Resources', 'Main hero heading on resources page'),
  ('resources_hero_description', 'text', '/resources', 'hero', 'Resources Hero Description', 'Expert guides to help you navigate the mental health system in Tasmania, whether you are seeking support, supporting a loved one, or running a practice.', 'Hero description on resources page'),
  ('resources_heading_personalized', 'text', '/resources', 'heading', 'Need Personalized Support Heading', 'Need personalised support?', 'Heading for personalized support section'),
  
  -- ============================================
  -- EVENTS PAGE
  -- ============================================
  ('events_hero_title', 'text', '/events', 'hero', 'Events Hero Title', 'Community Events', 'Main hero heading on events page'),
  ('events_hero_description', 'text', '/events', 'hero', 'Events Hero Description', 'Discover workshops, support groups, and mental health seminars happening across Tasmania.', 'Hero description on events page'),
  ('events_heading_partner', 'text', '/events', 'heading', 'Partner with Us Heading', 'Partner with Us', 'Heading for partner section'),
  
  -- ============================================
  -- FEATURED LISTINGS PAGE
  -- ============================================
  ('featured_hero_title', 'text', '/featured-listings', 'hero', 'Featured Listings Hero Title', 'Grow Your Tasmanian Practice with Featured Listings', 'Main hero heading on featured listings page'),
  ('featured_hero_description', 'text', '/featured-listings', 'hero', 'Featured Listings Hero Description', 'Connect with more patients seeking therapy near me Tasmania. List your practice for free or upgrade to featured. We help psychologists Hobart and counsellors Launceston find new clients with free directory listing.', 'Hero description on featured listings page'),
  ('featured_heading_benefits', 'text', '/featured-listings', 'heading', 'How It Works Heading', 'How It Works', 'Heading for how it works section'),
  
  -- ============================================
  -- BUTTON COLORS
  -- ============================================
  ('button_color_primary', 'color', 'global', 'button', 'Primary Button Background', '#39B8A6', 'Background color for primary buttons (teal)'),
  ('button_color_primary_hover', 'color', 'global', 'button', 'Primary Button Hover', '#2E9385', 'Hover color for primary buttons'),
  ('button_color_primary_text', 'color', 'global', 'button', 'Primary Button Text', '#FFFFFF', 'Text color for primary buttons'),
  ('button_color_secondary', 'color', 'global', 'button', 'Secondary Button Background', '#FFFFFF', 'Background color for secondary buttons'),
  ('button_color_secondary_border', 'color', 'global', 'button', 'Secondary Button Border', '#39B8A6', 'Border color for secondary buttons'),
  ('button_color_secondary_text', 'color', 'global', 'button', 'Secondary Button Text', '#39B8A6', 'Text color for secondary buttons'),
  ('button_color_featured', 'color', 'global', 'button', 'Featured Button Background', '#F59E0B', 'Background color for featured/upgrade buttons (yellow)'),
  ('button_color_featured_hover', 'color', 'global', 'button', 'Featured Button Hover', '#D97706', 'Hover color for featured buttons'),
  ('button_color_featured_text', 'color', 'global', 'button', 'Featured Button Text', '#FFFFFF', 'Text color for featured buttons'),
  ('button_color_admin', 'color', 'global', 'button', 'Admin Button Background', '#DC2626', 'Background color for admin buttons (red)'),
  ('button_color_admin_hover', 'color', 'global', 'button', 'Admin Button Hover', '#B91C1C', 'Hover color for admin buttons'),
  ('button_color_admin_text', 'color', 'global', 'button', 'Admin Button Text', '#FFFFFF', 'Text color for admin buttons'),
  
  -- ============================================
  -- BUTTON TEXT (Additional)
  -- ============================================
  ('button_start_search', 'text', 'global', 'button', 'Start Your Search Button', 'Start Your Search', 'Text for "Start Your Search" button'),
  ('button_view_featured', 'text', 'global', 'button', 'View Featured Plans Button', 'View Featured Plans', 'Text for "View Featured Plans" button'),
  ('button_get_listed_free', 'text', 'global', 'button', 'Get Listed Free Button', 'Get Listed Free', 'Text for "Get Listed Free" button'),
  ('button_upgrade_now', 'text', 'global', 'button', 'Upgrade Now Button', 'Upgrade Now - $29/month', 'Text for upgrade button'),
  
  -- ============================================
  -- ADDITIONAL SEO & META
  -- ============================================
  ('meta_keywords_crisis', 'seo', '/crisis-support', 'meta', 'Crisis Support Keywords', 'crisis support Tasmania, mental health emergency, suicide prevention, safety plan', 'SEO keywords for crisis support page'),
  ('meta_keywords_resources', 'seo', '/resources', 'meta', 'Resources Keywords', 'mental health resources Tasmania, therapy guides, mental health information', 'SEO keywords for resources page'),
  ('meta_keywords_events', 'seo', '/events', 'meta', 'Events Keywords', 'mental health events Tasmania, workshops, support groups, seminars', 'SEO keywords for events page'),
  ('meta_keywords_get_listed', 'seo', '/get-listed', 'meta', 'Get Listed Keywords', 'list practice free, mental health directory listing, join directory Tasmania', 'SEO keywords for get listed page'),
  
  -- ============================================
  -- ADDITIONAL DESCRIPTIONS
  -- ============================================
  ('description_featured_benefits', 'description', '/featured-listings', 'description', 'Featured Listings Benefits', 'Get top placement, verified badge, enhanced profile, and priority support for just $29/month', 'Description of featured listings benefits'),
  ('description_standard_listing', 'description', '/featured-listings', 'description', 'Standard Listing Description', 'Basic Profile Listing, Searchable by Location, Contact Details, Standard Support', 'Description of standard listing features')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- Verification Query
-- ============================================
-- Run this to see all settings:
-- SELECT setting_key, label, category, page_path FROM site_content_settings ORDER BY page_path, category, label;
-- 
-- Expected: Should have many more settings now (50+)
-- ============================================
