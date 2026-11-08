'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  DollarSign,
  LayoutTemplate,
  Pencil,
  Plus,
  Trash2,
  Wallet,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import {
  EmptyState,
  PageHeader,
  PageShell,
  Panel,
  SectionHeader,
  StatCard,
  StatusBadge,
  TableShell,
  btnPrimaryClass,
  btnSecondaryClass,
  cardClass,
  tdClass,
  thClass,
} from '@/components/dashboard/ui'
import { cn } from '@/lib/utils'

interface Template {
  id: string
  name: string
  slug: string
  category: string
  price: number
  status: 'draft' | 'review' | 'pending' | 'published' | 'approved' | 'rejected'
  preview_image: string | null
  description: string | null
  created_at: Date
  updated_at: Date
  purchase_count: number
  total_revenue: number
}

interface Earnings {
  total_earnings: number
  pending_earnings: number
  paid_earnings: number
}

interface EarningHistory {
  id: string
  amount: number
  status: string
  created_at: Date
  template_name: string
  buyer_email: string
}

interface ContributorDashboardClientProps {
  templates: Template[]
  earnings: Earnings
  earningsHistory: EarningHistory[]
  userId: string
  userEmail: string
  userRole: string
}

export function ContributorDashboardClient({
  templates,
  earnings,
  earningsHistory,
  userEmail,
}: ContributorDashboardClientProps) {
  const router = useRouter()
  const [pendingDelete, setPendingDelete] = useState<Template | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const approved = templates.filter(
    (template) =>
      template.status === 'approved' || template.status === 'published'
  ).length
  const inReview = templates.filter(
    (template) => template.status === 'pending' || template.status === 'review'
  ).length

  const handleDelete = async () => {
    if (!pendingDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/templates/${pendingDelete.slug}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete template')
      }

      setPendingDelete(null)
      router.refresh()
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Failed to delete template. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Contributor Workspace"
        title={`Hi, ${userEmail?.split('@')[0] || 'creator'}`}
        description="Publish templates, track how they perform, and keep an eye on your earnings."
        actions={
          <>
            <Link href="/dashboard/earnings" className={btnSecondaryClass}>
              <Wallet className="h-4 w-4" />
              Earnings
            </Link>
            <Link href="/dashboard/templates/new" className={btnPrimaryClass}>
              <Plus className="h-4 w-4" />
              New template
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total earnings"
          value={formatCurrency(earnings.total_earnings)}
          hint="All-time net revenue"
          icon={DollarSign}
          tone="emerald"
        />
        <StatCard
          label="Pending"
          value={formatCurrency(earnings.pending_earnings)}
          hint="Awaiting payout"
          icon={Wallet}
          tone="amber"
        />
        <StatCard
          label="Templates"
          value={templates.length}
          hint={`${approved} live · ${inReview} in review`}
          icon={LayoutTemplate}
          tone="orange"
        />
        <StatCard
          label="Paid out"
          value={formatCurrency(earnings.paid_earnings)}
          hint="Settled earnings"
          tone="sky"
        />
      </div>

      <div className="space-y-4">
        <SectionHeader
          title="Your templates"
          description="Open a template to edit its details or submit it for review."
          action={
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
              {templates.length} template{templates.length === 1 ? '' : 's'}
            </span>
          }
        />

        {templates.length === 0 ? (
          <Panel>
            <EmptyState
              icon={LayoutTemplate}
              title="No templates yet"
              description="Create your first template and start earning from the marketplace."
              action={
                <Link href="/dashboard/templates/new" className={btnPrimaryClass}>
                  <Plus className="h-4 w-4" />
                  Create a template
                </Link>
              }
            />
          </Panel>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <article
                key={template.id}
                className={cn(cardClass, 'flex flex-col overflow-hidden')}
              >
                <div className="h-40 bg-slate-100">
                  {template.preview_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={template.preview_image}
                      alt={template.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-slate-400">
                      <LayoutTemplate className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-slate-900">
                        {template.name}
                      </h3>
                      <p className="mt-0.5 truncate text-xs font-medium capitalize text-slate-500">
                        {template.category} · {formatCurrency(template.price)}
                      </p>
                    </div>
                    <StatusBadge status={template.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
                    <div>
                      <p className="text-slate-500">Sales</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-900">
                        {template.purchase_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Revenue</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-900">
                        {formatCurrency(template.total_revenue)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Link
                      href={`/dashboard/templates/${template.id}/edit` as any}
                      className={cn(btnSecondaryClass, 'flex-1 px-3 py-2 text-xs')}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <Link
                      href={`/demo/${template.slug}` as any}
                      target="_blank"
                      className={cn(btnSecondaryClass, 'flex-1 px-3 py-2 text-xs')}
                    >
                      Preview
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(template)}
                      aria-label={`Delete ${template.name}`}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <SectionHeader
          title="Recent earnings"
          description="The latest sales attributed to your templates."
          action={
            <Link
              href="/dashboard/earnings"
              className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />

        <TableShell>
          <thead className="bg-slate-50/70">
            <tr>
              <th className={thClass}>Date</th>
              <th className={thClass}>Template</th>
              <th className={thClass}>Buyer</th>
              <th className={thClass}>Amount</th>
              <th className={thClass}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {earningsHistory.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No earnings recorded yet.
                </td>
              </tr>
            ) : (
              earningsHistory.map((earning) => (
                <tr key={earning.id} className="hover:bg-slate-50/60">
                  <td className={cn(tdClass, 'whitespace-nowrap text-slate-500')}>
                    {formatDate(new Date(earning.created_at))}
                  </td>
                  <td className={cn(tdClass, 'font-medium text-slate-900')}>
                    {earning.template_name}
                  </td>
                  <td className={cn(tdClass, 'text-slate-600')}>
                    {earning.buyer_email}
                  </td>
                  <td className={cn(tdClass, 'font-semibold text-slate-900')}>
                    {formatCurrency(earning.amount)}
                  </td>
                  <td className={tdClass}>
                    <StatusBadge status={earning.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </TableShell>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this template?"
        description={
          <>
            <strong className="text-slate-700">{pendingDelete?.name}</strong> will
            be removed from your workspace. This action cannot be undone.
          </>
        }
        confirmLabel={isDeleting ? 'Deleting…' : 'Delete template'}
        destructive
        loading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => {
          if (!isDeleting) setPendingDelete(null)
        }}
      />
    </PageShell>
  )
}
