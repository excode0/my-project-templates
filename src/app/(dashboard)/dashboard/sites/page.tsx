import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/guards'
import { AdminSitesClient } from './AdminSitesClient'

export const metadata = {
  title: 'Sites - Admin - KOREX',
  description: 'Manage every provisioned site and open it in the visual editor',
}

export const dynamic = 'force-dynamic'

export default async function AdminSitesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  await requireAdmin('/dashboard/sites')

  const resolvedSearchParams = await searchParams
  const summary = await db`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'active')::int AS active,
      COUNT(*) FILTER (WHERE status = 'suspended')::int AS suspended,
      COUNT(*) FILTER (WHERE custom_domain IS NOT NULL)::int AS custom_domains
    FROM template_instances
  `.then((rows: any[]) => rows[0])

  const sites = await db`
    SELECT
      ti.id,
      ti.subdomain,
      ti.custom_domain,
      ti.status,
      ti.created_at,
      ti.updated_at,
      u.email AS user_email,
      u.username AS user_name,
      t.name AS template_name,
      t.slug AS template_slug,
      t.preview_image,
      tp.status AS purchase_status
    FROM template_instances ti
    JOIN users u ON u.id = ti.user_id
    JOIN templates t ON t.id = ti.template_id
    LEFT JOIN template_purchases tp ON tp.id = ti.purchase_id
    ORDER BY ti.created_at DESC
    LIMIT 500
  `

  const templates = await db`
    SELECT slug, name FROM templates
    WHERE status IN ('approved', 'published')
    ORDER BY name
  `

  return (
    <AdminSitesClient
      sites={sites.map((row: any) => ({
        id: row.id,
        subdomain: row.subdomain,
        customDomain: row.custom_domain,
        status: row.status,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
        userEmail: row.user_email,
        userName: row.user_name,
        templateName: row.template_name,
        templateSlug: row.template_slug,
        previewImage: row.preview_image,
        purchaseStatus: row.purchase_status,
      }))}
      templates={templates.map((row: any) => ({
        slug: row.slug,
        name: row.name,
      }))}
      summary={{
        total: Number(summary?.total) || 0,
        active: Number(summary?.active) || 0,
        suspended: Number(summary?.suspended) || 0,
        customDomains: Number(summary?.custom_domains) || 0,
      }}
      initialSearch={resolvedSearchParams.search || ''}
    />
  )
}
