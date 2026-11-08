import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { TemplateRenderer } from '@/lib/engines/template-engine/renderer'
import { normalizeTemplateConfig } from '@/lib/engines/template-engine/config'
import { TemplateCanvas } from '@/components/template/TemplateCanvas'

interface PageProps {
  params: Promise<{
    instanceId: string
  }>
}

export default async function PublicSitePage({ params }: PageProps) {
  const { instanceId } = await params

  // Fetch template instance
  const instance = await db`
    SELECT 
      ti.id,
      ti.config,
      ti.status,
      t.slug as template_slug
    FROM template_instances ti
    JOIN templates t ON t.id = ti.template_id
    WHERE ti.id = ${instanceId}
    AND ti.status = 'active'
    LIMIT 1
  `.then((rows: any[]) => rows[0])

  if (!instance) {
    notFound()
  }

  // Check if instance is suspended
  if (instance.status === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Site Suspended</h1>
          <p className="text-slate-600">
            This site has been temporarily suspended. Please contact support.
          </p>
        </div>
      </div>
    )
  }

  const config = normalizeTemplateConfig(instance.config)

  return (
    <TemplateCanvas config={config}>
      <TemplateRenderer
        templateSlug={instance.template_slug}
        instanceId={instance.id}
        config={config}
      />
    </TemplateCanvas>
  )
}

export const dynamic = 'force-dynamic'
