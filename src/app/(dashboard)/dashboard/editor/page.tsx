import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/guards'
import { AdminEditorClient } from './AdminEditorClient'

export const metadata = {
  title: 'Template Editor - Admin - KOREX',
  description: 'Design templates visually before publishing them',
}

export const dynamic = 'force-dynamic'

export default async function AdminEditorPage() {
  await requireAdmin('/dashboard/editor')

  const rows = await db`
    SELECT
      t.id,
      t.name,
      t.slug,
      t.type,
      t.status,
      t.category,
      t.preview_image,
      t.updated_at,
      COALESCE(
        (SELECT COUNT(*) FROM template_instances ti WHERE ti.template_id = t.id),
        0
      )::int AS instance_count,
      COALESCE(
        (SELECT COUNT(*) FROM jsonb_object_keys(t.config->'slots')),
        0
      )::int AS slot_count
    FROM templates t
    ORDER BY t.updated_at DESC
  `

  const templates = rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type as 'editor' | 'hardcode',
    status: row.status,
    category: row.category,
    previewImage: row.preview_image,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    instanceCount: Number(row.instance_count) || 0,
    slotCount: Number(row.slot_count) || 0,
  }))

  return <AdminEditorClient templates={templates} />
}
