-- Company Identity and Settings
-- Migration 007: Add company identity tables

-- Company identity table
CREATE TABLE IF NOT EXISTS company_identity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(500),
  description TEXT,
  logo_url VARCHAR(500),
  favicon_url VARCHAR(500),
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  accent_color VARCHAR(7),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  website VARCHAR(255),
  founded_year INTEGER,
  team_size VARCHAR(50),
  mission TEXT,
  values TEXT,
  about_image_url VARCHAR(500),
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social media links structure example:
-- {
--   "twitter": "https://twitter.com/...",
--   "linkedin": "https://linkedin.com/...",
--   "instagram": "https://instagram.com/...",
--   "github": "https://github.com/..."
-- }

-- Template pricing strategies
CREATE TABLE IF NOT EXISTS template_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  tier_name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  includes_updates BOOLEAN DEFAULT true,
  includes_support BOOLEAN DEFAULT false,
  commercial_use BOOLEAN DEFAULT true,
  max_domains INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pricing_tiers_template ON template_pricing_tiers(template_id);

-- Template features/capabilities
CREATE TABLE IF NOT EXISTS template_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  feature_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_features_template ON template_features(template_id);

-- Update trigger for company_identity
CREATE TRIGGER update_company_identity_updated_at BEFORE UPDATE ON company_identity
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create default company identity entry
INSERT INTO company_identity (
  name,
  tagline,
  description,
  primary_color,
  secondary_color,
  accent_color,
  email,
  phone,
  website,
  mission,
  values
) VALUES (
  'Korex',
  'Premium Template Marketplace',
  'A curated marketplace of professionally crafted, fully customizable website templates',
  '#FF6B35',
  '#004E89',
  '#F7931E',
  'hello@korex.studio',
  '+62-XXX-XXXX',
  'https://korex.studio',
  'Empower creators and entrepreneurs with beautiful, professional templates that launch businesses.',
  'Quality, Transparency, Community'
) ON CONFLICT DO NOTHING;
