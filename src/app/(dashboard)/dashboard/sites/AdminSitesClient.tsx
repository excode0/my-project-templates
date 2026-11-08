'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ExternalLink,
  Globe2,
  LayoutTemplate,
  MonitorSmartphone,
  Pencil,
  PlusCircle,
} from 'lucide-react'
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
  tdClass,
  thClass,
} from '@/components/dashboard/ui'
import { cn } from '@/lib/utils'

interface SiteRow {
  id: string
  subdomain: string
  customDomain: string | null
  status: string
  createdAt: string | null
  updatedAt: string | null
  userEmail: string
  userName: string | null
  templateName: string
  templateSlug: string
  previewImage: string | null
  purchaseStatus: string | null
}

interface AdminSitesClientProps {
  sites: SiteRow[]
  templates: { slug: string; name: string }[]
  summary: {
    total: number
    active: number
    suspended: number
    customDomains: number
  }
  initialSearch?: string
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function AdminSitesClient({
  sites,
  templates,
  summary,
  initialSearch = '',
}: AdminSitesClientProps) {
  const [search, setSearch] = useState(initialSearch)
  const [status, setStatus] = useState('all')
  const [template, setTemplate] = useState('all')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return sites.filter((site) => {
      const matchesStatus = status === 'all' || site.status === status
      const matchesTemplate =
        template === 'all' || site.templateSlug === template
      const matchesSearch =
        !term ||
        [
          site.subdomain,
          site.customDomain,
          site.userEmail,
          site.userName,
          site.templateName,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))

      return matchesStatus && matchesTemplate && matchesSearch
    })
  }, [sites, search, status, template])

  return (
    <PageShell>
      <PageHeader
        eyebrow="Control Center"
        title="Sites"
        description="Every provisioned site in one place. Open the visual editor, view the live page, or manage its domain."
        actions={
          <Link href="/dashboard/sites/new" className={btnPrimaryClass}>
            <PlusCircle className="h-4 w-4" />
            Create site
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total sites" value={summary.total} tone="orange" />
        <StatCard
          label="Active"
          value={summary.active}
          hint="Live and reachable"
          tone="emerald"
        />
        <StatCard
          label="Suspended"
          value={summary.suspended}
          hint="Needs attention"
          tone={summary.suspended > 0 ? 'rose' : 'default'}
        />
        <StatCard
          label="Custom domains"
          value={summary.customDomains}
          hint="Connected domains"
          tone="sky"
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              All sites
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Showing {filtered.length} of {sites.length} sites.
            </p>
          </div>
        </div>

        <TableShell>
          <Toolbar>
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search domain, owner, or template"
            />
            <SelectField
              label="Filter by template"
              value={template}
              onChange={setTemplate}
            >
              <option value="all">All templates</option>
              {templates.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Filter by status"
              value={status}
              onChange={setStatus}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </SelectField>
          </Toolbar>

          <thead className="bg-slate-50/70">
            <tr>
              <th className={thClass}>Site</th>
              <th className={thClass}>Owner</th>
              <th className={thClass}>Template</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Created</th>
              <th className={cn(thClass, 'text-right')}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={MonitorSmartphone}
                    title="No sites match your filters"
                    description="Try a different search term, template, or status."
                  />
                </td>
              </tr>
            ) : (
              filtered.map((site) => (
                <tr key={site.id} className="hover:bg-slate-50/60">
                  <td className={tdClass}>
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-sky-50 text-sky-600">
                        {site.previewImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={site.previewImage}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <MonitorSmartphone className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {site.customDomain || `${site.subdomain}.korex.site`}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {site.customDomain
                            ? `${site.subdomain}.korex.site`
                            : 'Subdomain'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={tdClass}>
                    <p className="text-slate-900">
                      {site.userName || site.userEmail.split('@')[0]}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {site.userEmail}
                    </p>
                  </td>
                  <td className={tdClass}>
                    <p className="text-slate-900">{site.templateName}</p>
                    <p className="text-xs font-mono text-slate-400">
                      {site.templateSlug}
                    </p>
                  </td>
                  <td className={cn(tdClass, 'whitespace-nowrap')}>
                    <StatusBadge status={site.status} />
                  </td>
                  <td
                    className={cn(
                      tdClass,
                      'whitespace-nowrap text-xs text-slate-500'
                    )}
                  >
                    {formatDate(site.createdAt)}
                  </td>
                  <td className={cn(tdClass, 'whitespace-nowrap text-right')}>
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/editor/${site.id}` as any}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(btnPrimaryClass, 'px-3 py-1.5 text-xs')}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <Link
                        href={`/sites/${site.id}` as any}
                        target="_blank"
                        className={cn(btnSecondaryClass, 'px-3 py-1.5 text-xs')}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </Link>
                      <Link
                        href={`/dashboard/${site.id}/domains` as any}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-orange-300 hover:text-orange-600"
                        title="Domain settings"
                      >
                        <Globe2 className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/marketplace/${site.templateSlug}` as any}
                        target="_blank"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-orange-300 hover:text-orange-600"
                        title="Template detail"
                      >
                        <LayoutTemplate className="h-3.5 w-3.5" />
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
