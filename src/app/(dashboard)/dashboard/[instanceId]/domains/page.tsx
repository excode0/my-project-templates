import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import { DomainSettingsClient } from './DomainSettingsClient'
import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth/roles'

interface DomainPageProps {
  params: Promise<{ instanceId: string }>
}

export default async function DomainPage({ params }: DomainPageProps) {
  const { instanceId } = await params

  // Check authentication
  const session = await auth()
  
  if (!session || !session.user) {
    redirect('/login?callbackUrl=/dashboard')
  }

  // Fetch instance
  const instance = await db`
    SELECT 
      ti.id,
      ti.user_id,
      ti.custom_domain,
      ti.subdomain,
      ti.status,
      t.name as template_name
    FROM template_instances ti
    JOIN templates t ON t.id = ti.template_id
    WHERE ti.id = ${instanceId}
    LIMIT 1
  `.then((rows: any[]) => rows[0])

  if (!instance) {
    notFound()
  }

  // Check ownership (admins can manage any site's domain)
  if (instance.user_id !== session.user.id && !isAdminRole(session.user.role)) {
    redirect('/dashboard')
  }

  return (
    <DomainSettingsClient
      instanceId={instance.id}
      templateName={instance.template_name}
      currentDomain={instance.custom_domain}
      subdomain={instance.subdomain}
      domainSuffix={process.env.DEFAULT_DOMAIN_SUFFIX || 'korex.site'}
      backHref={isAdminRole(session.user.role) ? '/dashboard/sites' : '/dashboard'}
    />
  )
}

export const dynamic = 'force-dynamic'
