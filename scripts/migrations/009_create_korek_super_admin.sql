-- Migration 009: Create the admin@korek.com super admin alias
-- Ensures the requested admin@korek.com account exists with super admin access.
-- It reuses the password hash from admin@korex.com when available.

INSERT INTO users (email, password_hash, role, status, username)
SELECT
  'admin@korek.com',
  password_hash,
  'super_admin',
  'active',
  'superadmin_korek'
FROM users
WHERE email = 'admin@korex.com'
ON CONFLICT (email) DO UPDATE
SET role = 'super_admin', status = 'active';
