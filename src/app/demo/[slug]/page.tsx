import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { TemplateRenderer } from '@/lib/engines/template-engine/renderer'
import { TemplateCanvas } from '@/components/template/TemplateCanvas'
import {
  buildEditorConfig,
  resolveTemplateManifest,
} from '@/lib/engines/template-engine/editor-config'

interface DemoPageProps {
  params: Promise<{ slug: string }>
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { slug } = await params

  const template = await db`
    SELECT name, slug, category, description, features, config, preview_image, status
    FROM templates
    WHERE slug = ${slug} AND status IN ('approved', 'published')
    LIMIT 1
  `.then((rows: any[]) => rows[0])

  if (!template) {
    notFound()
  }

  const resolved = await resolveTemplateManifest(slug, {
    name: template.name,
    description: template.description,
    features: template.features,
  })
  const config = buildEditorConfig(resolved, template.config, {
    name: template.name,
    description: template.description,
    features: template.features,
  })

  return (
    <TemplateCanvas config={config}>
      <TemplateRenderer
        templateSlug={resolved.renderSlug}
        instanceId={`demo-${slug}`}
        config={config}
        isPreview
      />
    </TemplateCanvas>
  )
}

export const dynamic = 'force-dynamic'
