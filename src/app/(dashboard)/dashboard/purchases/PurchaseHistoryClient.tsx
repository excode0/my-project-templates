'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ExternalLink,
  Loader2,
  Pencil,
  Receipt,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import {
  EmptyState,
  PageHeader,
  PageShell,
  Panel,
  StatCard,
  StatusBadge,
  btnPrimaryClass,
  btnSecondaryClass,
  cardClass,
} from '@/components/dashboard/ui'
import { cn } from '@/lib/utils'

interface Purchase {
  purchaseId: string
  price: number
  paymentMethod: string
  status: string
  purchasedAt: string
  template: {
    id: string
    name: string
    slug: string
    category: string
    previewImage: string | null
  }
  instance: {
    id: string
    name: string
    status: string
  } | null
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function PurchaseHistoryClient() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPurchases = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/purchases')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to load purchases')
      }

      setPurchases(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchases')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPurchases()
  }, [])

  const stats = useMemo(
    () => ({
      count: purchases.length,
      spent: purchases
        .filter((purchase) =>
          ['completed', 'active'].includes(purchase.status)
        )
        .reduce((sum, purchase) => sum + purchase.price, 0),
      active: purchases.filter(
        (purchase) => purchase.instance?.status === 'active'
      ).length,
    }),
    [purchases]
  )

  if (loading) {
    return (
      <PageShell>
        <PageHeader
          eyebrow="My Workspace"
          title="Purchase history"
          description="Every template you own, with quick access to its site."
        />
        <Panel>
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
            <p className="mt-3 text-sm text-slate-500">Loading purchases…</p>
          </div>
        </Panel>
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell>
        <PageHeader
          eyebrow="My Workspace"
          title="Purchase history"
          description="Every template you own, with quick access to its site."
        />
        <Panel>
          <EmptyState
            icon={Receipt}
            title="We couldn't load your purchases"
            description={error}
            action={
              <button type="button" onClick={loadPurchases} className={btnPrimaryClass}>
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            }
          />
        </Panel>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="My Workspace"
        title="Purchase history"
        description="Every template you own, with quick access to its live site."
        actions={
          <Link href="/marketplace" className={btnPrimaryClass}>
            <ShoppingBag className="h-4 w-4" />
            Browse templates
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Purchases" value={stats.count} tone="orange" />
        <StatCard
          label="Total spent"
          value={formatCurrency(stats.spent)}
          hint="Completed and active orders"
          tone="violet"
        />
        <StatCard
          label="Active sites"
          value={stats.active}
          hint="Live instances"
          tone="emerald"
        />
      </div>

      {purchases.length === 0 ? (
        <Panel>
          <EmptyState
            icon={ShoppingBag}
            title="No purchases yet"
            description="Browse the marketplace to find a template and launch your first site."
            action={
              <Link href="/marketplace" className={btnPrimaryClass}>
                Browse templates
              </Link>
            }
          />
        </Panel>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <article
              key={purchase.purchaseId}
              className={cn(cardClass, 'overflow-hidden')}
            >
              <div className="flex flex-col md:flex-row">
                <div className="relative h-36 w-full shrink-0 bg-slate-100 md:h-auto md:w-56">
                  {purchase.template.previewImage ? (
                    <Image
                      src={purchase.template.previewImage}
                      alt={purchase.template.name}
                      fill
                      className="object-cover"
                      sizes="224px"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xs text-slate-400">
                      No preview
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {purchase.template.name}
                      </h3>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="capitalize">
                          {purchase.template.category}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>{formatDateTime(purchase.purchasedAt)}</span>
                      </p>
                    </div>
                    <StatusBadge status={purchase.status} />
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Price paid
                        </p>
                        <p className="mt-0.5 text-lg font-semibold text-slate-900">
                          {formatCurrency(purchase.price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Payment
                        </p>
                        <p className="mt-0.5 text-sm capitalize text-slate-700">
                          {purchase.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {purchase.instance ? (
                        <>
                          <Link
                            href={`/editor/${purchase.instance.id}` as any}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(btnPrimaryClass, 'px-3 py-2 text-xs')}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Open editor
                          </Link>
                          {purchase.instance.status === 'active' ? (
                            <Link
                              href={`/sites/${purchase.instance.id}` as any}
                              target="_blank"
                              className={cn(
                                btnSecondaryClass,
                                'px-3 py-2 text-xs'
                              )}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              View live
                            </Link>
                          ) : null}
                        </>
                      ) : (
                        <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                          No instance provisioned
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  )
}
