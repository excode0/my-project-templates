-- Migration 012: Template-level visual editor config + index cleanup
--
-- The visual editor previously only stored values on template_instances.
-- Super admins need to design a template itself, before any site is created.
-- New instances inherit this config through buildInitialConfig().

ALTER TABLE templates
  ADD COLUMN IF NOT EXISTS config JSONB NOT NULL
  DEFAULT '{"slots":{},"pages":[]}'::jsonb;

COMMENT ON COLUMN templates.config IS
  'Default visual editor values for this template; copied into new instances.';

-- ---------------------------------------------------------------------------
-- Redundant indexes
--
-- Several indexes either duplicate a UNIQUE constraint or repeat the leading
-- columns of a wider composite index. Removing them lowers write cost and
-- keeps the planner from choosing between identical alternatives.
-- ---------------------------------------------------------------------------

-- users.email already has users_email_key.
DROP INDEX IF EXISTS idx_users_email;
-- Duplicate of the unique email index (the INCLUDE columns are not needed).
DROP INDEX IF EXISTS idx_users_email_cover;

-- templates.slug already has templates_slug_key.
DROP INDEX IF EXISTS idx_templates_slug;
-- Same keys and predicate as idx_templates_marketplace_cover.
DROP INDEX IF EXISTS idx_templates_marketplace;
-- Covered by idx_templates_featured (status equality + created_at ordering).
DROP INDEX IF EXISTS idx_templates_created_desc;

-- custom_domain / subdomain already have UNIQUE indexes.
DROP INDEX IF EXISTS idx_instances_custom_domain;
DROP INDEX IF EXISTS idx_instances_subdomain;
-- idx_instances_user_active starts with user_id.
DROP INDEX IF EXISTS idx_instances_user;
-- Active-only variant is a subset of idx_instances_user_active.
DROP INDEX IF EXISTS idx_instances_active_only;

-- domains.domain already has domains_domain_key.
DROP INDEX IF EXISTS idx_domains_domain;

-- idx_earnings_contributor_status starts with contributor_id.
DROP INDEX IF EXISTS idx_earnings_contributor;

-- idx_reviews_template_rating starts with template_id.
DROP INDEX IF EXISTS idx_reviews_template;

-- idx_purchases_user_status starts with user_id.
DROP INDEX IF EXISTS idx_purchases_user;
