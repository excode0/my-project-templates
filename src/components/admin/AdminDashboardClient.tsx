'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Clock3,
  Globe2,
  LayoutTemplate,
  MonitorSmartphone,
  PlusCircle,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface AdminStats {
  totalUsers: number
  totalContributors: number
  totalTemplates: number
  publishedTemplates: number
  pendingReview: number
  totalSites: number
  totalPurchases: number
  totalRevenue: number
  pendingPayouts: number
  totalDomains: number
  verifiedDomains: number
}

interface PendingTemplate {
  id: string
  name: string
  slug: string
  category: string
  price: number
  previewImage: string | null
  updatedAt: string | null
  contributorEmail: string
}

interface RecentPurchase {
  id: string
  status: string
  totalPrice: number
  purchasedAt: string | null
  userEmail: string
  templateName: string
  templateSlug: string
}

interface RecentSite {
  id: string
  subdomain: string
  customDomain: string | null
  status: string
  createdAt: string | null
  userEmail: string
  templateName: string
  templateSlug: string
}

interface RecentUser {
  id: string
  email: string
  username: string | null
  role: string
  status: string
  createdAt: string | null
}

interface AdminDashboardClientProps {
  stats: AdminStats
  revenueSeries: { date: string; amount: number }[]
  pendingTemplates: PendingTemplate[]
  recentPurchases: RecentPurchase[]
  recentSites: RecentSite[]
  recentUsers: RecentUser[]
  userEmail: string
  userRole: string
}

const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  failed: 'bg-red-50 text-red-700 ring-red-200',
  expired: 'bg-slate-100 text-slate-600 ring-slate-200',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
  refunded: 'bg-sky-50 text-sky-700 ring-sky-200',
  suspended: 'bg-red-50 text-red-700 ring-red-200',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset ${
        statusStyles[status] || 'bg-slate-100 text-slate-600 ring-slate-200'
      }`}
    >
      {status}
    </span>
  )
}

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDay(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'short',
  })
}

export function AdminDashboardClient({
  stats,
  revenueSeries,
  pendingTemplates,
  recentPurchases,
  recentSites,
  recentUsers,
  userEmail,
  userRole,
}: AdminDashboardClientProps) {
  const displayName = userEmail?.split('@')[0] || 'Admin'
  const maxRevenue = Math.max(
    1,
    ...revenueSeries.map((point) => point.amount)
  )
  const revenue7d = revenueSeries.reduce((sum, point) => sum + point.amount, 0)

  const statCards = [
    {
      label: 'Total revenue',
      value: formatCurrency(stats.totalRevenue),
      hint: `${stats.totalPurchases} purchases`,
      icon: Banknote,
      tone: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Active sites',
      value: stats.totalSites,
      hint: 'Provisioned instances',
      icon: MonitorSmartphone,
      tone: 'bg-orange-50 text-orange-600',
    },
    {
      label: 'Templates',
      value: stats.totalTemplates,
      hint: `${stats.publishedTemplates} live`,
      icon: LayoutTemplate,
      tone: 'bg-violet-50 text-violet-600',
    },
    {
      label: 'Users',
      value: stats.totalUsers,
      hint: `${stats.totalContributors} contributors`,
      icon: Users,
      tone: 'bg-sky-50 text-sky-600',
    },
    {
      label: 'Pending review',
      value: stats.pendingReview,
      hint: 'Templates awaiting approval',
      icon: Clock3,
      tone: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Pending payouts',
      value: formatCurrency(stats.pendingPayouts),
      hint: 'Contributor balance',
      icon: Wallet,
      tone: 'bg-rose-50 text-rose-600',
    },
  ]

  const quickActions = [
    {
      label: 'Create template',
      description: 'Add a new template to the marketplace',
      href: '/dashboard/templates/new',
      icon: PlusCircle,
    },
    {
      label: 'Review queue',
      description: `${stats.pendingReview} template(s) waiting`,
      href: '/dashboard/templates?status=pending',
      icon: Clock3,
    },
    {
      label: 'Sites & editor',
      description: 'Open any site in the visual editor',
      href: '/dashboard/sites',
      icon: MonitorSmartphone,
    },
    {
      label: 'Purchases',
      description: 'Track orders and payment status',
      href: '/dashboard/purchases',
      icon: Receipt,
    },
    {
      label: 'Earnings',
      description: 'Approve contributor payouts',
      href: '/dashboard/earnings',
      icon: Wallet,
    },
    {
      label: 'Domains',
      description: `${stats.verifiedDomains}/${stats.totalDomains} verified`,
      href: '/dashboard/domains',
      icon: Globe2,
    },
    {
      label: 'Users',
      description: 'Roles, access, and accounts',
      href: '/dashboard/users',
      icon: Users,
    },
    {
      label: 'Settings',
      description: 'Platform configuration and health',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">
            Control Center
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
            Platform overview
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Revenue, templates, sites, contributors, and operations in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/templates/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-900/20 transition hover:brightness-110"
          >
            <PlusCircle className="h-4 w-4" />
            Create template
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600"
          >
            Marketplace
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-red-50/60 p-6 text-slate-900 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              {userRole === 'super_admin' ? 'Super Admin' : 'Administrator'}
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
              Welcome back, {displayName}.
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              You have full control over templates, sites, users, payments, and
              domains. Everything is one click away.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/dashboard/sites"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                <MonitorSmartphone className="h-4 w-4" />
                Open site editor
              </Link>
              <Link
                href="/dashboard/earnings"
                className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
              >
                <Wallet className="h-4 w-4" />
                Review payouts
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[440px]">
            {[
              {
                label: 'Revenue (7d)',
                value: formatCurrency(revenue7d),
                icon: Sparkles,
              },
              {
                label: 'Orders',
                value: stats.totalPurchases,
                icon: ShoppingBag,
              },
              {
                label: 'Live sites',
                value: stats.totalSites,
                icon: Globe2,
              },
            ].map((metric) => {
              const Icon = metric.icon
              return (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"
                >
                  <Icon className="h-4 w-4 text-orange-600" />
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {metric.value}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
                </div>
                <span className={`rounded-xl p-2.5 ${card.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900">
                Revenue trend
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Completed purchases over the last 7 days.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              {formatCurrency(revenue7d)}
            </span>
          </div>

          <div className="mt-6 flex h-44 items-end gap-2 sm:gap-3">
            {revenueSeries.map((point) => {
              const height = Math.max(
                6,
                Math.round((point.amount / maxRevenue) * 100)
              )
              return (
                <div
                  key={point.date}
                  className="group flex flex-1 flex-col items-center gap-2"
                  title={`${point.date}: ${formatCurrency(point.amount)}`}
                >
                  <div className="flex h-36 w-full items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-orange-500 to-red-500 transition group-hover:from-orange-400 group-hover:to-red-400"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    {formatDay(point.date)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-slate-900">
            Quick actions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Everything a super admin needs.
          </p>
          <div className="mt-4 grid gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href as any}
                  className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-orange-200 hover:bg-orange-50/60"
                >
                  <span className="rounded-lg bg-slate-50 p-2 text-slate-500 transition group-hover:bg-white group-hover:text-orange-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-900">
                      {action.label}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {action.description}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-orange-500" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900">
                Review queue
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Templates waiting for approval.
              </p>
            </div>
            <Link
              href={'/dashboard/templates?status=pending' as any}
              className="text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              View all
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {pendingTemplates.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
                <p className="mt-3 text-sm font-medium text-slate-900">
                  All caught up
                </p>
                <p className="text-xs text-slate-500">
                  No templates are waiting for review.
                </p>
              </div>
            ) : (
              pendingTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                >
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {template.previewImage ? (
                      <img
                        src={template.previewImage}
                        alt={template.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-slate-400">
                        <LayoutTemplate className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {template.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {template.category} · {template.contributorEmail}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Updated {formatDate(template.updatedAt)}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/templates/${template.id}/review` as any}
                    className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-100"
                  >
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900">
                Recent purchases
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest orders across the marketplace.
              </p>
            </div>
            <Link
              href="/dashboard/purchases"
              className="text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              View all
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {recentPurchases.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">
                No purchases yet.
              </p>
            ) : (
              recentPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="rounded-lg bg-orange-50 p-2 text-orange-600">
                    <Receipt className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {purchase.templateName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {purchase.userEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(purchase.totalPrice)}
                    </p>
                    <div className="mt-1 flex justify-end">
                      <StatusBadge status={purchase.status} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900">
                Recent sites
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Open any site directly in the editor.
              </p>
            </div>
            <Link
              href="/dashboard/sites"
              className="text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              View all
            </Link>
          </div>

          <div className="mt-4 space-y-2">
            {recentSites.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">
                No sites created yet.
              </p>
            ) : (
              recentSites.map((site) => (
                <div
                  key={site.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                >
                  <span className="rounded-lg bg-sky-50 p-2 text-sky-600">
                    <MonitorSmartphone className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {site.customDomain || `${site.subdomain}.korex.site`}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {site.templateName} · {site.userEmail}
                    </p>
                  </div>
                  <StatusBadge status={site.status} />
                  <Link
                    href={`/editor/${site.id}` as any}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600"
                  >
                    Edit
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900">
                New users
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest accounts and roles.
              </p>
            </div>
            <Link
              href="/dashboard/users"
              className="text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              Manage users
            </Link>
          </div>

          <div className="mt-4 space-y-2">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-semibold uppercase text-slate-600">
                  {(user.username || user.email).slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {user.username || user.email.split('@')[0]}
                  </p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium capitalize text-slate-600">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50/70 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <BadgeCheck className="h-5 w-5 text-orange-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Super admin access
            </p>
            <p className="text-xs text-slate-600">
              You can manage templates, sites, editor, users, purchases, earnings,
              domains, and platform settings.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-orange-700 ring-1 ring-orange-200 transition hover:bg-orange-100"
        >
          <Settings className="h-4 w-4" />
          Platform settings
        </Link>
      </div>
    </div>
  )
}
