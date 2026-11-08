#!/usr/bin/env node
/**
 * Ensure the platform super admin accounts exist and have the super_admin role.
 * Safe to run repeatedly. Existing passwords are preserved.
 */
import bcrypt from 'bcryptjs'
import postgres from 'postgres'

for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(file)
  } catch {
    // file not present
  }
}

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgres://postgres:admin@localhost:5432/template_marketplace'

const accounts = [
  { email: 'admin@korex.com', username: 'superadmin' },
  { email: 'admin@korek.com', username: 'superadmin_korek' },
]

const sql = postgres(DATABASE_URL, { max: 1, onnotice: () => {} })

try {
  const passwordHash = await bcrypt.hash('admin123', 10)

  for (const account of accounts) {
    await sql`
      INSERT INTO users (email, password_hash, role, status, username)
      VALUES (
        ${account.email},
        ${passwordHash},
        'super_admin',
        'active',
        ${account.username}
      )
      ON CONFLICT (email) DO UPDATE
      SET role = 'super_admin', status = 'active', updated_at = NOW()
    `
    console.log(`✅ ${account.email} is super_admin`)
  }

  const rows = await sql`
    SELECT email, role FROM users
    WHERE email IN ('admin@korex.com', 'admin@korek.com')
    ORDER BY email
  `
  console.table(rows)
} catch (error) {
  console.error('❌ Failed to ensure super admins:', error)
  process.exitCode = 1
} finally {
  await sql.end()
}
