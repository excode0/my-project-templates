-- Migration 005: Add Featured Column to Templates
-- This allows marking templates as featured for homepage/marketplace showcase

-- Add is_featured column
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create index for faster featured queries
CREATE INDEX IF NOT EXISTS idx_templates_is_featured ON templates(is_featured) WHERE is_featured = true;

-- Optional: Mark the most recent published template as featured for testing
UPDATE templates 
SET is_featured = true 
WHERE id = (
  SELECT id FROM templates
  WHERE status = 'published'
    AND is_featured IS NOT TRUE
  ORDER BY created_at DESC
  LIMIT 1
);

-- Add comment
COMMENT ON COLUMN templates.is_featured IS 'Whether template is featured on homepage/marketplace';
