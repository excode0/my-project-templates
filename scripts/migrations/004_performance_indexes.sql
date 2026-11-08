-- Migration 004: Performance Indexes
-- Date: 2026-11-06
-- Purpose: Add composite and specialized indexes for common query patterns

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Templates: Marketplace browsing (status + category + price)
CREATE INDEX IF NOT EXISTS idx_templates_marketplace 
  ON templates(status, category, price) 
  WHERE status = 'published';

-- Templates: Featured templates
CREATE INDEX IF NOT EXISTS idx_templates_featured
  ON templates(status, created_at DESC)
  WHERE status = 'published';

-- Template instances: User dashboard queries (user + status)
CREATE INDEX IF NOT EXISTS idx_instances_user_active
  ON template_instances(user_id, status, created_at DESC);

-- Template purchases: Purchase history with status
CREATE INDEX IF NOT EXISTS idx_purchases_user_status
  ON template_purchases(user_id, status, purchased_at DESC);

-- Earnings: Contributor earnings page
CREATE INDEX IF NOT EXISTS idx_earnings_contributor_status
  ON earnings(contributor_id, status, created_at DESC);

-- ============================================================================
-- JSONB INDEXES FOR CONFIG QUERIES
-- ============================================================================

-- Template instances: Fast JSONB config lookups
CREATE INDEX IF NOT EXISTS idx_instances_config_gin
  ON template_instances USING GIN (config);

-- Template pages: Schema searches
CREATE INDEX IF NOT EXISTS idx_pages_schema_gin
  ON template_pages USING GIN (page_schema);

-- Domains: DNS records searches
CREATE INDEX IF NOT EXISTS idx_domains_dns_gin
  ON domains USING GIN (dns_records);

-- ============================================================================
-- PARTIAL INDEXES FOR SPECIFIC CONDITIONS
-- ============================================================================

-- Active templates only (most queries filter by active)
CREATE INDEX IF NOT EXISTS idx_instances_active_only
  ON template_instances(user_id, created_at DESC)
  WHERE status = 'active';

-- Pending purchases (for payment processing)
CREATE INDEX IF NOT EXISTS idx_purchases_pending
  ON template_purchases(user_id, purchased_at DESC)
  WHERE status = 'pending';

-- Unpaid earnings (for payout processing)
CREATE INDEX IF NOT EXISTS idx_earnings_unpaid
  ON earnings(contributor_id, created_at DESC)
  WHERE status = 'pending';

-- Pending domains (for verification checks)
CREATE INDEX IF NOT EXISTS idx_domains_pending
  ON domains(domain, created_at DESC)
  WHERE status = 'pending';

-- ============================================================================
-- COVERING INDEXES (Include frequently accessed columns)
-- ============================================================================

-- Templates with preview image (reduce table lookups)
CREATE INDEX IF NOT EXISTS idx_templates_marketplace_cover
  ON templates(status, category, price)
  INCLUDE (name, slug, preview_image, description)
  WHERE status = 'published';

-- Users with role info (reduce auth lookups)
CREATE INDEX IF NOT EXISTS idx_users_email_cover
  ON users(email)
  INCLUDE (role, status);

-- ============================================================================
-- ADDITIONAL PERFORMANCE INDEXES
-- ============================================================================

-- Templates: Sort by popularity/created date
CREATE INDEX IF NOT EXISTS idx_templates_created_desc
  ON templates(created_at DESC)
  WHERE status = 'published';

-- Template reviews: Calculate average rating
CREATE INDEX IF NOT EXISTS idx_reviews_template_rating
  ON template_reviews(template_id, rating);

-- Domains: Expiration checks
CREATE INDEX IF NOT EXISTS idx_domains_expires
  ON domains(expires_at)
  WHERE expires_at IS NOT NULL AND status = 'verified';

-- Purchases: Revenue calculations
CREATE INDEX IF NOT EXISTS idx_purchases_total_price
  ON template_purchases(purchased_at, total_price)
  WHERE status = 'active';

-- ============================================================================
-- TEXT SEARCH INDEXES
-- ============================================================================

-- Templates: Full-text search on name and description
CREATE INDEX IF NOT EXISTS idx_templates_search
  ON templates USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================================================
-- MONITORING VIEWS
-- ============================================================================

-- View: Index usage statistics
CREATE OR REPLACE VIEW v_index_usage AS
SELECT 
    schemaname,
    relname AS tablename,
    indexrelname AS indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- View: Unused indexes (potential candidates for removal)
CREATE OR REPLACE VIEW v_unused_indexes AS
SELECT 
    schemaname,
    relname AS tablename,
    indexrelname AS indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'pg_%'
  AND indexrelname NOT LIKE '%_pkey';

-- View: Table bloat and index efficiency
CREATE OR REPLACE VIEW v_table_stats AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - 
                   pg_relation_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================================
-- ANALYZE TABLES (Update statistics for query planner)
-- ============================================================================

ANALYZE users;
ANALYZE templates;
ANALYZE template_purchases;
ANALYZE template_instances;
ANALYZE template_pages;
ANALYZE domains;
ANALYZE earnings;
ANALYZE template_reviews;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show newly created indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Show index sizes
SELECT 
    relname AS tablename,
    indexrelname AS indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexrelname LIKE 'idx_%'
ORDER BY pg_relation_size(indexrelid) DESC;
