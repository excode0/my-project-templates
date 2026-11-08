import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/guards'
import { EditorClient } from '@/app/editor/[instanceId]/EditorClient'
import {
  buildEditorConfig,
  resolveTemplateManifest,
} from '@/lib/engines/template-engine/editor-config'

interface PageProps {
  params: Promise<{ templateId: string }>
}

interface TemplateEditorRow {
  id: string
  name: string
  slug: string
  description: string | null
  features: string[] | null
  config: unknown
  type: 'editor' | 'hardcode'
  status: string
}

export const metadata = {
  title: 'Template editor',
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = 'force-dynamic'

export default async function TemplateEditorPage({ params }: PageProps) {
  const { templateId } = await params
  await requireAdmin(`/editor/template/${templateId}`)

  const template = await db`
    SELECT
      id,
      name,
      slug,
      description,
      features,
      config,
      type,
      status
    FROM templates
    WHERE id = ${templateId}
    LIMIT 1
  `.then((rows: TemplateEditorRow[]) => rows[0])

  if (!template) {
    notFound()
  }

  const meta = {
    name: template.name,
    description: template.description,
    features: template.features,
  }
  const resolved = await resolveTemplateManifest(template.slug, meta)
  const initialConfig = buildEditorConfig(resolved, template.config, meta)

  return (
    <EditorClient
      resourceId={template.id}
      saveEndpoint={`/api/admin/templates/${template.id}/config`}
      previewSrc={`/preview/template/${template.id}`}
      previewHref={`/preview/template/${template.id}`}
      previewLabel="Open preview"
      templateSlug={template.slug}
      templateName={template.name}
      siteLabel={`Template · ${template.type === 'editor' ? 'Visual editor' : 'Hardcoded'}`}
      backHref="/dashboard/editor"
      manifest={resolved.manifest}
      initialConfig={initialConfig}
    />
  )
}
