-- Migration 008: Super admin role and demo links
-- Adds the super_admin role, promotes the primary admin account, and ensures
-- every approved template exposes a working /demo/{slug} URL.

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('user', 'contributor', 'admin', 'super_admin'));

UPDATE users
SET role = 'super_admin', status = 'active', username = 'superadmin'
WHERE email IN ('admin@korex.com', 'admin@korek.com');

UPDATE templates SET status = 'approved' WHERE status = 'published';

UPDATE templates
SET demo_url = '/demo/' || slug
WHERE status = 'approved' AND (demo_url IS NULL OR demo_url = '');
