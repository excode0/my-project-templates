import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/guards'
import { AdminDomainsClient } from './AdminDomainsClient'

export const metadata = {
  title: 'Domains - Admin - KOREX',
  description: 'Manage custom domains and DNS verification',
}

export const dynamic = 'force-dynamic'

export default async function AdminDomainsPage() {
  await requireAdmin('/dashboard/domains')

  const summary = await db`
    SELECT
      (SELECT COUNT(*) FROM domains)::int AS total,
      (SELECT COUNT(*) FROM domains WHERE status = 'verified')::int AS verified,
      (SELECT COUNT(*) FROM domains WHERE status = 'pending')::int AS pending,
      (SELECT COUNT(*) FROM template_instances WHERE custom_domain IS NOT NULL)::int AS attached
  `.then((rows: any[]) => rows[0])

  const domains = await db`
    SELECT
      d.id,
      d.domain,
      d.status,
      d.verified_at,
      d.expires_at,
      d.created_at,
      u.email AS user_email,
      u.username AS user_name,
      ti.id AS instance_id,
      t.name AS template_name
    FROM domains d
    JOIN users u ON u.id = d.user_id
    LEFT JOIN template_instances ti ON ti.custom_domain = d.domain
    LEFT JOIN templates t ON t.id = ti.template_id
    ORDER BY d.created_at DESC
    LIMIT 300
  `

  const data = domains.map((row: any) => ({
    id: row.id,
    domain: row.domain,
    status: row.status,
    verifiedAt: row.verified_at
      ? new Date(row.verified_at).toISOString()
      : null,
    expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    userEmail: row.user_email,
    userName: row.user_name,
    instanceId: row.instance_id,
    templateName: row.template_name,
  }))

  return (
    <AdminDomainsClient
      domains={data}
      summary={{
        total: Number(summary?.total) || 0,
        verified: Number(summary?.verified) || 0,
        pending: Number(summary?.pending) || 0,
        attached: Number(summary?.attached) || 0,
      }}
    />
  )
}
