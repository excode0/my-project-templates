'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Globe } from 'lucide-react'
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
  tdClass,
  thClass,
} from '@/components/dashboard/ui'
import { cn } from '@/lib/utils'

interface DomainRow {
  id: string
  domain: string
  status: string
  verifiedAt: string | null
  expiresAt: string | null
  createdAt: string | null
  userEmail: string
  userName: string | null
  instanceId: string | null
  templateName: string | null
}

interface AdminDomainsClientProps {
  domains: DomainRow[]
  summary: {
    total: number
    verified: number
    pending: number
    attached: number
  }
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function AdminDomainsClient({
  domains,
  summary,
}: AdminDomainsClientProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return domains.filter((domain) => {
      const matchesStatus = status === 'all' || domain.status === status
      const matchesSearch =
        !term ||
        [domain.domain, domain.userEmail, domain.userName, domain.templateName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))

      return matchesStatus && matchesSearch
    })
  }, [domains, search, status])

  return (
    <PageShell>
      <PageHeader
        eyebrow="Control Center"
        title="Domains"
        description="Custom domain requests, DNS verification, and attached sites."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total domains" value={summary.total} tone="orange" />
        <StatCard
          label="Verified"
          value={summary.verified}
          hint="DNS confirmed"
          tone="emerald"
        />
        <StatCard
          label="Pending"
          value={summary.pending}
          hint="Awaiting verification"
          tone={summary.pending > 0 ? 'amber' : 'default'}
        />
        <StatCard
          label="Attached"
          value={summary.attached}
          hint="Connected to a site"
          tone="sky"
        />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900">
            Domain registry
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Showing {filtered.length} of {domains.length} domains.
          </p>
        </div>

        <TableShell>
          <Toolbar>
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search domain, owner, or template"
            />
            <SelectField
              label="Filter by status"
              value={status}
              onChange={setStatus}
            >
              <option value="all">All statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </SelectField>
          </Toolbar>

          <thead className="bg-slate-50/70">
            <tr>
              <th className={thClass}>Domain</th>
              <th className={thClass}>Owner</th>
              <th className={thClass}>Template</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Verified</th>
              <th className={thClass}>Expires</th>
              <th className={cn(thClass, 'text-right')}>Site</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    icon={Globe}
                    title="No domains match your filters"
                    description="Try a different search term or status."
                  />
                </td>
              </tr>
            ) : (
              filtered.map((domain) => (
                <tr key={domain.id} className="hover:bg-slate-50/60">
                  <td className={cn(tdClass, 'font-medium text-slate-900')}>
                    {domain.domain}
                  </td>
                  <td className={tdClass}>
                    <p className="text-slate-900">
                      {domain.userName || domain.userEmail.split('@')[0]}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {domain.userEmail}
                    </p>
                  </td>
                  <td className={cn(tdClass, 'text-slate-600')}>
                    {domain.templateName || (
                      <span className="text-slate-400">Not attached</span>
                    )}
                  </td>
                  <td className={cn(tdClass, 'whitespace-nowrap')}>
                    <StatusBadge status={domain.status} />
                  </td>
                  <td
                    className={cn(
                      tdClass,
                      'whitespace-nowrap text-xs text-slate-500'
                    )}
                  >
                    {formatDate(domain.verifiedAt)}
                  </td>
                  <td
                    className={cn(
                      tdClass,
                      'whitespace-nowrap text-xs text-slate-500'
                    )}
                  >
                    {formatDate(domain.expiresAt)}
                  </td>
                  <td className={cn(tdClass, 'whitespace-nowrap text-right')}>
                    {domain.instanceId ? (
                      <Link
                        href={`/sites/${domain.instanceId}` as any}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
                      >
                        View site
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
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
