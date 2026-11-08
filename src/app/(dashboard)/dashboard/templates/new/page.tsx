import Link from 'next/link'
import { requireTemplateManager } from '@/lib/auth/guards'
import { CreateTemplateForm } from './CreateTemplateForm'
import {
  PageHeader,
  PageShell,
  cardClass,
} from '@/components/dashboard/ui'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Create Template - Dashboard - KOREX',
  description: 'Create a new template',
}

export default async function CreateTemplatePage() {
  await requireTemplateManager('/dashboard/templates/new')

  return (
    <PageShell className="max-w-4xl">
      <Link
        href="/dashboard/templates"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-orange-600"
      >
        ← Back to templates
      </Link>

      <PageHeader
        eyebrow="Template Studio"
        title="Create new template"
        description="Fill in the details below. You can define editable slots later."
      />

      <div className={cn(cardClass, 'p-6 sm:p-8')}>
        <CreateTemplateForm />
      </div>
    </PageShell>
  )
}
