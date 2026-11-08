import { EditorClient } from './EditorClient'
import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import type { Route } from 'next'
import { auth } from '@/lib/auth'
import { isAdminRole, dashboardPathForRole } from '@/lib/auth/roles'
import {
  buildEditorConfig,
  resolveTemplateManifest,
} from '@/lib/engines/template-engine/editor-config'

interface PageProps {
  params: Promise<{
    instanceId: string
  }>
}

export default async function EditorPage({ params }: PageProps) {
  const { instanceId } = await params

  const session = await auth()
  if (!session?.user) {
    redirect(`/login?callbackUrl=/editor/${instanceId}` as any)
  }

  const instance = await db`
    SELECT
      ti.id,
      ti.user_id,
      ti.config,
      ti.subdomain,
      ti.custom_domain,
      t.slug as template_slug,
      t.name as template_name,
      t.description as template_description,
      t.features as template_features
    FROM template_instances ti
    JOIN templates t ON t.id = ti.template_id
    WHERE ti.id = ${instanceId}
    LIMIT 1
  `.then((rows: any[]) => rows[0])

  if (!instance) {
    notFound()
  }

  // Users may only edit their own instances; admins can edit any instance.
  const isOwner = instance.user_id === session.user.id
  if (!isOwner && !isAdminRole(session.user.role)) {
    redirect(dashboardPathForRole(session.user.role) as any)
  }

  // Load the template manifest. Templates without a hardcoded folder fall back
  // to the universal generic manifest so the editor still works.
  const resolved = await resolveTemplateManifest(instance.template_slug, {
    name: instance.template_name,
    description: instance.template_description,
    features: instance.template_features,
  })
  const manifest = resolved.manifest
  const initialConfig = buildEditorConfig(resolved, instance.config, {
    name: instance.template_name,
    description: instance.template_description,
    features: instance.template_features,
  })

  const siteLabel =
    instance.custom_domain || `${instance.subdomain}.korex.site`
  const backHref: Route = isAdminRole(session.user.role)
    ? '/dashboard/sites'
    : '/dashboard'

  return (
    <EditorClient
      resourceId={instance.id}
      saveEndpoint={`/api/instances/${instance.id}/config`}
      previewSrc={`/preview/${instance.id}`}
      previewHref={`/preview/${instance.id}`}
      templateSlug={instance.template_slug}
      templateName={instance.template_name}
      siteLabel={siteLabel}
      backHref={backHref}
      manifest={manifest}
      initialConfig={initialConfig}
    />
  )
}

export const dynamic = 'force-dynamic'
