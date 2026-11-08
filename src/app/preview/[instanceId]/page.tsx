import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import { TemplateRenderer } from '@/lib/engines/template-engine/renderer'
import { auth } from '@/lib/auth'
import { isAdminRole, dashboardPathForRole } from '@/lib/auth/roles'
import { normalizeTemplateConfig } from '@/lib/engines/template-engine/config'
import { TemplateCanvas } from '@/components/template/TemplateCanvas'

interface PageProps {
  params: Promise<{
    instanceId: string
  }>
}

export default async function PreviewPage({ params }: PageProps) {
  const { instanceId } = await params

  const session = await auth()
  if (!session?.user) {
    redirect(`/login?callbackUrl=/preview/${instanceId}` as any)
  }

  // Fetch template instance
  const instance = await db`
    SELECT 
      ti.id,
      ti.user_id,
      ti.config,
      t.slug as template_slug
    FROM template_instances ti
    JOIN templates t ON t.id = ti.template_id
    WHERE ti.id = ${instanceId}
    LIMIT 1
  `.then((rows: any[]) => rows[0])

  if (!instance) {
    notFound()
  }

  if (
    instance.user_id !== session.user.id &&
    !isAdminRole(session.user.role)
  ) {
    redirect(dashboardPathForRole(session.user.role) as any)
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
