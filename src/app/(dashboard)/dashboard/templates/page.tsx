import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/guards'
import { AdminTemplatesClient } from './AdminTemplatesClient'

export const metadata = {
  title: 'Templates - Admin - KOREX',
  description: 'Manage every template across the platform',
}

export const dynamic = 'force-dynamic'

export default async function AdminTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; search?: string }>
}) {
  await requireAdmin('/dashboard/templates')

  const resolvedSearchParams = await searchParams

  const rows = await db`
    SELECT
      t.id,
      t.name,
      t.slug,
      t.category,
      t.status,
      t.type,
      t.price,
      t.is_featured,
      t.preview_image,
      t.created_at,
      t.updated_at,
      u.email as owner_email,
      u.username as owner_username,
      COALESCE(
        (SELECT COUNT(*) FROM template_instances ti WHERE ti.template_id = t.id),
        0
      )::int as instance_count
    FROM templates t
    JOIN users u ON t.contributor_id = u.id
    ORDER BY t.created_at DESC
  `

  const templates = rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    status: row.status,
    type: row.type,
    price: Number(row.price) || 0,
    isFeatured: Boolean(row.is_featured),
    previewImage: row.preview_image,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    ownerEmail: row.owner_email,
    ownerUsername: row.owner_username,
    instanceCount: row.instance_count,
  }))

  const categoriesResult = await db`
    SELECT DISTINCT category FROM templates ORDER BY category
  `
  const categories = categoriesResult.map((row: any) => row.category)

  return (
    <AdminTemplatesClient
      templates={templates}
      categories={categories}
      initialFilters={{
        status: resolvedSearchParams.status || 'all',
        category: resolvedSearchParams.category || 'all',
        search: resolvedSearchParams.search || '',
      }}
    />
  )
}
