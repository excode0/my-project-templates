import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/guards'
import { AdminUsersClient } from './AdminUsersClient'

export const metadata = {
  title: 'Users - Admin - KOREX',
  description: 'Manage roles, access, and accounts',
}

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; search?: string }>
}) {
  await requireAdmin('/dashboard/users')

  const resolvedSearchParams = await searchParams

  const rows = await db`
    SELECT
      u.id,
      u.email,
      u.username,
      u.role,
      u.status,
      u.created_at,
      COALESCE(
        (SELECT COUNT(*) FROM templates t WHERE t.contributor_id = u.id),
        0
      )::int as template_count,
      COALESCE(
        (SELECT COUNT(*) FROM template_instances ti WHERE ti.user_id = u.id),
        0
      )::int as instance_count
    FROM users u
    ORDER BY u.created_at DESC
  `

  const users = rows.map((row: any) => ({
    id: row.id,
    email: row.email,
    username: row.username,
    role: row.role,
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    templateCount: row.template_count,
    instanceCount: row.instance_count,
  }))

  return (
    <AdminUsersClient
      users={users}
      initialFilters={{
        role: resolvedSearchParams.role || 'all',
        search: resolvedSearchParams.search || '',
      }}
    />
  )
}
