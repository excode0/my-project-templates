-- Seed test users for development
-- Passwords are hashed with bcrypt (password: "password123")

-- Insert test user (user role)
INSERT INTO users (id, email, password_hash, role, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'user@test.com',
  '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u',
  'user',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Insert test contributor
INSERT INTO users (id, email, password_hash, role, status)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'contributor@test.com',
  '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u',
  'contributor',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Insert test admin
INSERT INTO users (id, email, password_hash, role, status)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'admin@test.com',
  '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u',
  'admin',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Note: All test accounts use password: "password123"
-- In production, these users should be removed or have strong passwords
