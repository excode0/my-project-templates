import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { DashboardClient } from './DashboardClient'
import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth/roles'
import { AdminDashboardServer } from '@/components/admin/AdminDashboardServer'
import { ContributorDashboardServer } from '@/components/contributor/ContributorDashboardServer'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/dashboard' as any)
  }

  if (isAdminRole(session.user.role)) {
    return <AdminDashboardServer />
  }

  if (session.user.role === 'contributor') {
    return <ContributorDashboardServer />
  }

  const userId = session.user.id

  const instances = await db`
    SELECT
      ti.id,
      ti.custom_domain,
      ti.subdomain,
      ti.status,
      ti.created_at,
      ti.updated_at,
      t.name as template_name,
      t.slug as template_slug,
      t.preview_image,
      t.category
    FROM template_instances ti
    JOIN templates t ON t.id = ti.template_id
    WHERE ti.user_id = ${userId}
    ORDER BY ti.updated_at DESC
  `.then((rows: any[]) => rows)

  const availableTemplates = await db`
    SELECT
      id,
      name,
      slug,
      category,
      price,
      preview_image,
      description,
      requires_custom_domain
    FROM templates
    WHERE status IN ('approved', 'published')
    ORDER BY name ASC
  `.then((rows: any[]) => rows)

  return (
    <DashboardClient
      instances={instances}
      availableTemplates={availableTemplates}
      userId={userId}
      userEmail={session.user.email}
      userRole={session.user.role}
    />
  )
}
