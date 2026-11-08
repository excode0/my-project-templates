import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import { isAdminRole } from '@/lib/auth/roles'
import { EditTemplateForm } from './EditTemplateForm'
import {
  PageHeader,
  PageShell,
  cardClass,
} from '@/components/dashboard/ui'
import { cn } from '@/lib/utils'

interface EditTemplatePageProps {
  params: Promise<{ id: string }>
}

export default async function EditTemplatePage({
  params,
}: EditTemplatePageProps) {
  const { id } = await params

  const session = await auth()
  if (!session || !session.user) {
    redirect(`/login?callbackUrl=/dashboard/templates/${id}/edit` as any)
  }

  const template = await db`
    SELECT *
    FROM templates
    WHERE id = ${id}
    LIMIT 1
  `.then((rows: any[]) => rows[0])

  if (!template) {
    notFound()
  }

  const isAdmin = isAdminRole(session.user.role)
  if (template.contributor_id !== session.user.id && !isAdmin) {
    redirect('/dashboard' as any)
  }

  const backHref = isAdmin ? '/dashboard/templates' : '/dashboard'

  return (
    <PageShell className="max-w-4xl">
      <Link
        href={backHref as any}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-orange-600"
      >
        ← Back to {isAdmin ? 'templates' : 'dashboard'}
      </Link>

      <PageHeader
        eyebrow="Template Studio"
        title="Edit template"
        description="Update your template details and submit it for review when ready."
      />

      <div className={cn(cardClass, 'p-6 sm:p-8')}>
        <EditTemplateForm template={template} />
      </div>
    </PageShell>
  )
}

export const dynamic = 'force-dynamic'
