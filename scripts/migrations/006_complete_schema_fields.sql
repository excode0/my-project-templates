-- Migration 006: Complete Missing Schema Fields
-- Add missing fields for proper template showcase

-- Add username to users table (for display)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;

-- Add is_featured to templates
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add demo_url to templates
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS demo_url VARCHAR(500);

-- Add tags/features to templates (for showcase)
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';

-- Add template_reviews table if not exists
CREATE TABLE IF NOT EXISTS template_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(template_id, user_id)
);

-- Add earnings table if not exists
CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  purchase_id UUID NOT NULL REFERENCES template_purchases(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_templates_is_featured ON templates(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_reviews_template ON template_reviews(template_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON template_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_earnings_contributor ON earnings(contributor_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Allow the status values used by the application
ALTER TABLE templates DROP CONSTRAINT IF EXISTS templates_status_check;
ALTER TABLE templates ADD CONSTRAINT templates_status_check
  CHECK (status IN ('draft', 'review', 'pending', 'published', 'approved', 'rejected'));

-- Update existing templates to have status 'approved' if they're published
UPDATE templates SET status = 'approved' WHERE status = 'published';

-- Insert super admin if not exists
INSERT INTO users (email, password_hash, role, status, username)
VALUES (
  'admin@korex.com',
  '$2a$10$YourHashedPasswordHere', -- Password: admin123 (hash this properly)
  'admin',
  'active',
  'superadmin'
) ON CONFLICT (email) DO NOTHING;

COMMENT ON COLUMN templates.is_featured IS 'Featured templates shown on homepage';
COMMENT ON COLUMN templates.demo_url IS 'Live demo URL for preview';
COMMENT ON COLUMN templates.features IS 'Array of feature tags for showcase';
COMMENT ON COLUMN users.username IS 'Display name for contributors';
