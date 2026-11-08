'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface EarningRow {
  id: string
  amount: number
  platformFee: number
  netAmount: number
  status: string
  createdAt: string | null
  paidAt: string | null
  contributorEmail: string
  contributorName: string | null
  templateName: string
  orderId: string | null
}

interface AdminEarningsClientProps {
  earnings: EarningRow[]
  summary: {
    total: number
    gross: number
    fees: number
    net: number
    pending: number
    paid: number
  }
}

export function AdminEarningsClient({
  earnings,
  summary,
}: AdminEarningsClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [payingId, setPayingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return earnings.filter((earning) => {
      const matchesStatus = status === 'all' || earning.status === status
      const matchesSearch =
        !term ||
        [
          earning.contributorEmail,
          earning.contributorName,
          earning.templateName,
          earning.orderId,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))

      return matchesStatus && matchesSearch
    })
  }, [earnings, search, status])

  const handlePayout = async (id: string) => {
    if (!confirm('Mark this earning as paid?')) return

    setPayingId(id)
    try {
      const response = await fetch(`/api/admin/earnings/${id}/payout`, {
        method: 'PATCH',
      })
      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to update earning')
      }

      router.refresh()
    } catch (error: any) {
      alert(error?.message || 'Failed to update earning')
    } finally {
      setPayingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">
            Management
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">
            Earnings &amp; Payouts
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Contributor revenue, platform fees, and pending payouts.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Wallet className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-500">{filtered.length} shown</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Gross sales', value: summary.gross },
          { label: 'Platform fees', value: summary.fees },
          { label: 'Pending payout', value: summary.pending },
          { label: 'Paid out', value: summary.paid },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatCurrency(card.value)}
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
              placeholder="Search contributor, template, or order"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50/70 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Contributor</th>
                <th className="px-4 py-3 font-medium">Template</th>
                <th className="px-4 py-3 font-medium">Gross</th>
                <th className="px-4 py-3 font-medium">Fee</th>
                <th className="px-4 py-3 font-medium">Net</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    No earnings match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((earning) => (
                  <tr key={earning.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {earning.contributorName ||
                          earning.contributorEmail.split('@')[0]}
                      </p>
                      <p className="text-xs text-slate-500">
                        {earning.contributorEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {earning.templateName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatCurrency(earning.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {formatCurrency(earning.platformFee)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                      {formatCurrency(earning.netAmount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${
                          earning.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                            : 'bg-amber-50 text-amber-700 ring-amber-200'
                        }`}
                      >
                        {earning.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {earning.createdAt
                        ? new Date(earning.createdAt).toLocaleDateString(
                            'id-ID',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            }
                          )
                        : '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {earning.status === 'pending' ? (
                        <button
                          type="button"
                          onClick={() => handlePayout(earning.id)}
                          disabled={payingId === earning.id}
                          className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {payingId === earning.id ? 'Saving...' : 'Mark paid'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">
                          {earning.paidAt
                            ? new Date(earning.paidAt).toLocaleDateString('id-ID')
                            : 'Paid'}
                        </span>
                      )}
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
