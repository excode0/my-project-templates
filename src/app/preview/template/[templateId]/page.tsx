import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import { TemplateRenderer } from '@/lib/engines/template-engine/renderer'
import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth/roles'
import { TemplateCanvas } from '@/components/template/TemplateCanvas'
import {
  buildEditorConfig,
  resolveTemplateManifest,
} from '@/lib/engines/template-engine/editor-config'

interface PageProps {
  params: Promise<{ templateId: string }>
}

export default async function TemplatePreviewPage({ params }: PageProps) {
  const { templateId } = await params

  const session = await auth()
  if (!session?.user) {
    redirect(`/login?callbackUrl=/preview/template/${templateId}` as any)
  }

  if (!isAdminRole(session.user.role)) {
    redirect('/dashboard' as any)
  }

  const template = await db`
    SELECT
      id,
      name,
      slug,
      description,
      features,
      config,
      status
    FROM templates
    WHERE id = ${templateId}
    LIMIT 1
  `.then((rows: any[]) => rows[0])

  if (!template) {
    notFound()
  }

  const meta = {
    name: template.name,
    description: template.description,
    features: template.features,
  }
  const resolved = await resolveTemplateManifest(template.slug, meta)
  const config = buildEditorConfig(resolved, template.config, meta)

  return (
    <TemplateCanvas config={config}>
      <TemplateRenderer
        templateSlug={resolved.renderSlug}
        instanceId={`template-${template.id}`}
        config={config}
        isPreview
      />
    </TemplateCanvas>
  )
}

export const dynamic = 'force-dynamic'
