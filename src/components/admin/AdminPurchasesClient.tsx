'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Receipt, Search } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface PurchaseRow {
  id: string
  orderId: string | null
  status: string
  templatePrice: number
  domainPrice: number
  totalPrice: number
  paymentMethod: string
  purchasedAt: string | null
  userEmail: string
  userName: string | null
  templateName: string
  templateSlug: string
  instanceId: string | null
  subdomain: string | null
  customDomain: string | null
}

interface AdminPurchasesClientProps {
  purchases: PurchaseRow[]
  summary: {
    total: number
    revenue: number
    completed: number
    pending: number
  }
}

const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  failed: 'bg-red-50 text-red-700 ring-red-200',
  expired: 'bg-slate-100 text-slate-600 ring-slate-200',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
  refunded: 'bg-sky-50 text-sky-700 ring-sky-200',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${
        statusStyles[status] || 'bg-slate-100 text-slate-600 ring-slate-200'
      }`}
    >
      {status}
    </span>
  )
}

export function AdminPurchasesClient({
  purchases,
  summary,
}: AdminPurchasesClientProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return purchases.filter((purchase) => {
      const matchesStatus = status === 'all' || purchase.status === status
      const matchesSearch =
        !term ||
        [
          purchase.orderId,
          purchase.userEmail,
          purchase.userName,
          purchase.templateName,
          purchase.subdomain,
          purchase.customDomain,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))

      return matchesStatus && matchesSearch
    })
  }, [purchases, search, status])

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">
            Management
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">
            Purchases
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Every template order, payment status, and provisioned site.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Receipt className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-500">{filtered.length} shown</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total orders', value: summary.total, money: false },
          { label: 'Gross revenue', value: summary.revenue, money: true },
          { label: 'Completed', value: summary.completed, money: false },
          { label: 'Pending', value: summary.pending, money: false },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {card.money ? formatCurrency(card.value) : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, buyer, template, or domain"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50/70 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Buyer</th>
                <th className="px-4 py-3 font-medium">Template</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    No purchases match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="font-mono text-xs text-slate-700">
                        {purchase.orderId || purchase.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">
                        {purchase.paymentMethod}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {purchase.userName || purchase.userEmail.split('@')[0]}
                      </p>
                      <p className="text-xs text-slate-500">{purchase.userEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/marketplace/${purchase.templateSlug}` as any}
                        className="font-medium text-slate-900 hover:text-orange-600"
                      >
                        {purchase.templateName}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {formatCurrency(purchase.totalPrice)}
                      </p>
                      {purchase.domainPrice > 0 && (
                        <p className="text-xs text-slate-400">
                          incl. {formatCurrency(purchase.domainPrice)} domain
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={purchase.status} />
                    </td>
                    <td className="px-4 py-3">
                      {purchase.instanceId ? (
                        <Link
                          href={`/sites/${purchase.instanceId}` as any}
                          className="text-xs font-medium text-orange-600 hover:text-orange-700"
                        >
                          {purchase.customDomain ||
                            `${purchase.subdomain}.korex.site`}
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400">Not created</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {purchase.purchasedAt
                        ? new Date(purchase.purchasedAt).toLocaleDateString(
                            'id-ID',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            }
                          )
                        : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
