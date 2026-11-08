-- Remove seed-only template records.
--
-- These rows were inserted by older seed scripts but never had a matching
-- src/templates/{slug} folder. They cannot be rendered by the template engine
-- and only polluted the admin catalog with fake hardcoded templates.
DELETE FROM templates
WHERE slug IN (
  'company-modern',
  'landing-startup',
  'business-corporate',
  'restaurant-menu',
  'landing-page-pro'
);

-- Keep the two templates that actually exist in src/templates aligned with
-- their implementation type.
UPDATE templates
SET type = 'hardcode', updated_at = NOW()
WHERE slug IN ('wedding-elegant', 'portfolio-creative');
