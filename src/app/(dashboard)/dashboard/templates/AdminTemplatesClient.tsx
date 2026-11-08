'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Brush,
  Eye,
  ExternalLink,
  LayoutTemplate,
  PlusCircle,
  Sparkles,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import {
  EmptyState,
  PageHeader,
  PageShell,
  SearchField,
  SelectField,
  StatCard,
  StatusBadge,
  TableShell,
  Toolbar,
  btnPrimaryClass,
  btnSecondaryClass,
  btnGhostClass,
  tdClass,
  thClass,
} from '@/components/dashboard/ui'
import { cn } from '@/lib/utils'

interface Template {
  id: string
  name: string
  slug: string
  category: string
  status: string
  type: 'editor' | 'hardcode'
  price: number
  isFeatured: boolean
  previewImage: string | null
  createdAt: string | null
  updatedAt: string | null
  ownerEmail: string
  ownerUsername: string | null
  instanceCount: number
}

interface AdminTemplatesClientProps {
  templates: Template[]
  categories: string[]
  initialFilters: {
    status: string
    category: string
    search: string
  }
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function AdminTemplatesClient({
  templates,
  categories,
  initialFilters,
}: AdminTemplatesClientProps) {
  const router = useRouter()
  const [filters, setFilters] = useState(initialFilters)

  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  // Keep filters shareable without hammering the server on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.set('status', filters.status)
      if (filters.category !== 'all') params.set('category', filters.category)
      if (filters.search.trim()) params.set('search', filters.search.trim())

      const query = params.toString()
      router.replace(
        (`/dashboard/templates${query ? `?${query}` : ''}`) as any,
        { scroll: false }
      )
    }, 350)

    return () => clearTimeout(timer)
  }, [filters, router])

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase()

    return templates.filter((template) => {
      if (filters.status !== 'all' && template.status !== filters.status) {
        return false
      }
      if (filters.category !== 'all' && template.category !== filters.category) {
        return false
      }
      if (
        term &&
        ![template.name, template.slug, template.ownerEmail, template.ownerUsername]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
      ) {
        return false
      }
      return true
    })
  }, [templates, filters])

  const stats = useMemo(
    () => ({
      total: templates.length,
      pending: templates.filter(
        (template) => template.status === 'pending' || template.status === 'review'
      ).length,
      approved: templates.filter(
        (template) =>
          template.status === 'approved' || template.status === 'published'
      ).length,
      featured: templates.filter((template) => template.isFeatured).length,
    }),
    [templates]
  )

  return (
    <PageShell>
      <PageHeader
        eyebrow="Control Center"
        title="Template management"
        description="Review submissions, manage pricing, and keep the marketplace catalog healthy."
        actions={
          <Link href="/dashboard/templates/new" className={btnPrimaryClass}>
            <PlusCircle className="h-4 w-4" />
            Create template
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total templates" value={stats.total} tone="orange" />
        <StatCard
          label="Pending review"
          value={stats.pending}
          hint="Awaiting approval"
          tone={stats.pending > 0 ? 'amber' : 'default'}
        />
        <StatCard
          label="Live"
          value={stats.approved}
          hint="Approved or published"
          tone="emerald"
        />
        <StatCard
          label="Featured"
          value={stats.featured}
          hint="Highlighted in the marketplace"
          tone="violet"
        />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900">
            Catalog
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Showing {filtered.length} of {templates.length} templates.
          </p>
        </div>

        <TableShell>
          <Toolbar>
            <SearchField
              value={filters.search}
              onChange={(value) => setFilter('search', value)}
              placeholder="Search name, slug, or owner"
            />
            <SelectField
              label="Filter by status"
              value={filters.status}
              onChange={(value) => setFilter('status', value)}
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="review">In review</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </SelectField>
            <SelectField
              label="Filter by category"
              value={filters.category}
              onChange={(value) => setFilter('category', value)}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </SelectField>
          </Toolbar>

          <thead className="bg-slate-50/70">
            <tr>
              <th className={thClass}>Template</th>
              <th className={thClass}>Owner</th>
              <th className={thClass}>Category</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Price</th>
              <th className={thClass}>Sites</th>
              <th className={thClass}>Created</th>
              <th className={cn(thClass, 'text-right')}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    icon={LayoutTemplate}
                    title="No templates match your filters"
                    description="Try a different search term, status, or category."
                  />
                </td>
              </tr>
            ) : (
              filtered.map((template) => (
                <tr key={template.id} className="hover:bg-slate-50/60">
                  <td className={tdClass}>
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                        {template.previewImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={template.previewImage}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <LayoutTemplate className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-medium text-slate-900">
                            {template.name}
                          </p>
                          {template.isFeatured ? (
                            <Sparkles
                              className="h-3.5 w-3.5 shrink-0 text-amber-500"
                              aria-label="Featured"
                            />
                          ) : null}
                        </div>
                        <p className="flex items-center gap-1.5 truncate text-xs font-mono text-slate-400">
                          <span>{template.slug}</span>
                          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                            {template.type === 'editor' ? 'Editor' : 'Hardcode'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={tdClass}>
                    <p className="text-slate-900">
                      {template.ownerUsername || '—'}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {template.ownerEmail}
                    </p>
                  </td>
                  <td className={cn(tdClass, 'capitalize text-slate-600')}>
                    {template.category}
                  </td>
                  <td className={cn(tdClass, 'whitespace-nowrap')}>
                    <StatusBadge status={template.status} />
                  </td>
                  <td className={cn(tdClass, 'whitespace-nowrap text-slate-900')}>
                    {formatCurrency(template.price)}
                  </td>
                  <td className={cn(tdClass, 'whitespace-nowrap text-slate-600')}>
                    {template.instanceCount}
                  </td>
                  <td
                    className={cn(
                      tdClass,
                      'whitespace-nowrap text-xs text-slate-500'
                    )}
                  >
                    {formatDate(template.createdAt)}
                  </td>
                  <td className={cn(tdClass, 'whitespace-nowrap text-right')}>
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/dashboard/templates/${template.id}/review` as any}
                        className={cn(btnPrimaryClass, 'px-3 py-1.5 text-xs')}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Review
                      </Link>
                      <Link
                        href={`/editor/template/${template.id}` as any}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(btnSecondaryClass, 'px-3 py-1.5 text-xs')}
                      >
                        <Brush className="h-3.5 w-3.5" />
                        Design
                      </Link>
                      <Link
                        href={`/dashboard/templates/${template.id}/edit` as any}
                        className={cn(btnGhostClass, 'px-2 py-1.5')}
                        aria-label={`Edit details for ${template.name}`}
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/demo/${template.slug}` as any}
                        target="_blank"
                        className={cn(btnGhostClass, 'px-2 py-1.5')}
                        aria-label={`Preview ${template.name}`}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </TableShell>
      </div>
    </PageShell>
  )
}
