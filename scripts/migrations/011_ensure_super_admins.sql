-- Migration 011: Ensure the platform super admins are promoted
-- Idempotent guard for environments where the accounts were created after 008.

UPDATE users
SET role = 'super_admin', status = 'active', updated_at = NOW()
WHERE email IN ('admin@korex.com', 'admin@korek.com');
