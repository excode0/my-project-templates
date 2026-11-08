'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  ExternalLink,
  Globe,
  LayoutTemplate,
  MonitorSmartphone,
  Pencil,
  Plus,
  Receipt,
  Search,
  Trash2,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { ConfirmDialog } from '@/components/dashboard/ConfirmDialog'
import {
  EmptyState,
  PageHeader,
  PageShell,
  Panel,
  SectionHeader,
  StatCard,
  StatusBadge,
  btnPrimaryClass,
  btnSecondaryClass,
  cardClass,
  inputClass,
} from '@/components/dashboard/ui'
import { cn } from '@/lib/utils'

interface Instance {
  id: string
  custom_domain: string | null
  subdomain: string
  status: 'active' | 'suspended'
  created_at: Date
  updated_at: Date
  template_name: string
  template_slug: string
  preview_image: string | null
  category: string
}

interface Template {
  id: string
  name: string
  slug: string
  category: string
  price: number
  preview_image: string | null
  description: string | null
  requires_custom_domain: boolean
}

interface DashboardClientProps {
  instances: Instance[]
  availableTemplates: Template[]
  userId: string
  userEmail: string
  userRole: string
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function DashboardClient({
  instances,
  availableTemplates,
  userEmail,
}: DashboardClientProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [templateSearch, setTemplateSearch] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Instance | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const stats = useMemo(() => {
    return {
      total: instances.length,
      active: instances.filter((item) => item.status === 'active').length,
      suspended: instances.filter((item) => item.status === 'suspended').length,
      customDomains: instances.filter((item) => item.custom_domain).length,
    }
  }, [instances])

  const filteredTemplates = useMemo(() => {
    const term = templateSearch.trim().toLowerCase()
    if (!term) return availableTemplates
    return availableTemplates.filter((template) =>
      [template.name, template.slug, template.category, template.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    )
  }, [availableTemplates, templateSearch])

  const handleDelete = async () => {
    if (!pendingDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/instances/${pendingDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete site')
      }

      setPendingDelete(null)
      router.refresh()
    } catch (error) {
      console.error('Error deleting instance:', error)
      alert('Failed to delete site. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="My Workspace"
        title={`Welcome back, ${userEmail?.split('@')[0] || 'there'}`}
        description="Manage your sites, open the visual editor, and keep every page up to date."
        actions={
          <>
            <Link href="/dashboard/purchases" className={btnSecondaryClass}>
              <Receipt className="h-4 w-4" />
              Purchase history
            </Link>
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className={btnPrimaryClass}
            >
              <Plus className="h-4 w-4" />
              Create site
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total sites" value={stats.total} tone="orange" />
        <StatCard
          label="Active"
          value={stats.active}
          hint="Live and reachable"
          tone="emerald"
        />
        <StatCard
          label="Custom domains"
          value={stats.customDomains}
          hint="Connected domains"
          tone="sky"
        />
        <StatCard
          label="Suspended"
          value={stats.suspended}
          hint="Needs attention"
          tone={stats.suspended > 0 ? 'rose' : 'default'}
        />
      </div>

      <div className="space-y-4">
        <SectionHeader
          title="Your sites"
          description="Open a site in the editor or jump straight to the live page."
          action={
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
              {instances.length} site{instances.length === 1 ? '' : 's'}
            </span>
          }
        />

        {instances.length === 0 ? (
          <Panel>
            <EmptyState
              icon={MonitorSmartphone}
              title="No sites yet"
              description="Choose a template from the marketplace and launch your first site in minutes."
              action={
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className={btnPrimaryClass}
                >
                  <Plus className="h-4 w-4" />
                  Create your first site
                </button>
              }
            />
          </Panel>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {instances.map((instance) => {
              const address = instance.custom_domain
                ? instance.custom_domain
                : `${instance.subdomain}.korex.site`

              return (
                <article
                  key={instance.id}
                  className={cn(
                    cardClass,
                    'group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md'
                  )}
                >
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    {instance.preview_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={instance.preview_image}
                        alt={instance.template_name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-slate-400">
                        <LayoutTemplate className="h-8 w-8" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3">
                      <StatusBadge status={instance.status} />
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-base font-semibold text-slate-900">
                          {instance.template_name}
                        </h3>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-600">
                          {instance.category}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-500">
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        {address}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Updated {formatDate(new Date(instance.updated_at))}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/editor/${instance.id}` as any}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(btnPrimaryClass, 'px-3 py-2 text-xs')}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Open editor
                      </Link>
                      <Link
                        href={`/sites/${instance.id}` as any}
                        target="_blank"
                        className={cn(btnSecondaryClass, 'px-3 py-2 text-xs')}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View site
                      </Link>
                      <Link
                        href={`/dashboard/${instance.id}/domains` as any}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-orange-300 hover:text-orange-600"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Domain
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(instance)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {isCreating ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Choose a template"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsCreating(false)
          }}
        >
          <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-slate-900">
                  Choose a template
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Every template is fully customizable in the visual editor.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={templateSearch}
                    onChange={(event) => setTemplateSearch(event.target.value)}
                    placeholder="Search templates"
                    className={cn(inputClass, 'w-56 py-2 pl-9')}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close template picker"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid flex-1 gap-4 overflow-y-auto p-5 sm:grid-cols-2">
              {filteredTemplates.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    icon={LayoutTemplate}
                    title="No templates found"
                    description="Try a different search term."
                  />
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <Link
                    key={template.id}
                    href={`/marketplace/${template.slug}` as any}
                    className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 text-left transition hover:border-orange-300 hover:shadow-md"
                  >
                    <div className="h-36 bg-slate-100">
                      {template.preview_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={template.preview_image}
                          alt={template.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-slate-400">
                          <LayoutTemplate className="h-7 w-7" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {template.name}
                        </h3>
                        <span className="text-sm font-semibold text-slate-900">
                          {formatPrice(template.price)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {template.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-600">
                          {template.category}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600">
                          View details
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this site?"
        description={
          <>
            <strong className="text-slate-700">
              {pendingDelete?.template_name}
            </strong>{' '}
            will be removed together with its content and domain connection. This
            action cannot be undone.
          </>
        }
        confirmLabel={isDeleting ? 'Deleting…' : 'Delete site'}
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
