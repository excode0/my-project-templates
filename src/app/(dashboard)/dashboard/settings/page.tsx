import Link from 'next/link'
import {
  BadgeCheck,
  Banknote,
  Building2,
  Database,
  Globe2,
  Mail,
  ServerCog,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/guards'
import {
  PageHeader,
  PageShell,
  StatCard,
  btnSecondaryClass,
  cardClass,
} from '@/components/dashboard/ui'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Settings - Admin - KOREX',
  description: 'Platform configuration, environment, and system health',
}

export const dynamic = 'force-dynamic'

function maskValue(value: string | undefined, visible = 4) {
  if (!value) return 'Not set'
  if (value.length <= visible) return value
  return `${'•'.repeat(Math.max(4, value.length - visible))}${value.slice(-visible)}`
}

export default async function AdminSettingsPage() {
  await requireAdmin('/dashboard/settings')

  const counts = await db`
    SELECT
      (SELECT COUNT(*) FROM users)::int AS users,
      (SELECT COUNT(*) FROM templates)::int AS templates,
      (SELECT COUNT(*) FROM template_instances)::int AS sites,
      (SELECT COUNT(*) FROM template_purchases)::int AS purchases,
      (SELECT COUNT(*) FROM migrations)::int AS migrations
  `.then((rows: any[]) => rows[0])

  const migrations = await db`
    SELECT filename, executed_at
    FROM migrations
    ORDER BY executed_at DESC
    LIMIT 12
  `

  const paymentMode = (process.env.PAYMENT_MODE || 'mock').toLowerCase()
  const emailEnabled =
    process.env.EMAIL_ENABLED !== 'false' &&
    Boolean(process.env.SMTP_USER) &&
    Boolean(process.env.SMTP_PASSWORD)

  const settings = [
    {
      label: 'Platform fee',
      value: `${process.env.PLATFORM_FEE_PERCENTAGE || '30'}%`,
      hint: 'Contributor share is the remainder',
      icon: Banknote,
    },
    {
      label: 'Payment mode',
      value: paymentMode === 'midtrans' ? 'Midtrans Snap' : 'Mock (dev)',
      hint:
        paymentMode === 'midtrans'
          ? 'Real checkout enabled'
          : 'Purchases provision instantly',
      icon: Wallet,
    },
    {
      label: 'App URL',
      value: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      hint: 'Used in emails and payment callbacks',
      icon: Globe2,
    },
    {
      label: 'Domain suffix',
      value: process.env.DEFAULT_DOMAIN_SUFFIX || '.localhost.test',
      hint: 'Default subdomain suffix',
      icon: ServerCog,
    },
    {
      label: 'Email delivery',
      value: emailEnabled ? 'Enabled' : 'Disabled',
      hint: emailEnabled
        ? `SMTP user ${maskValue(process.env.SMTP_USER)}`
        : 'Set EMAIL_ENABLED=true and SMTP credentials',
      icon: Mail,
    },
    {
      label: 'Database',
      value: 'PostgreSQL connected',
      hint: `${counts?.migrations || 0} migrations applied`,
      icon: Database,
    },
  ]

  return (
    <PageShell>
      <PageHeader
        title="Platform settings"
        description="Environment configuration, platform economics, and system health."
        actions={
          <>
            <Link href={'/dashboard/company' as any} className={btnSecondaryClass}>
              <Building2 className="h-4 w-4" />
              Company identity
            </Link>
            <Link
              href={'/api/health' as any}
              target="_blank"
              rel="noopener noreferrer"
              className={btnSecondaryClass}
            >
              <BadgeCheck className="h-4 w-4" />
              Health check
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={counts?.users || 0} tone="orange" />
        <StatCard label="Templates" value={counts?.templates || 0} tone="violet" />
        <StatCard label="Sites" value={counts?.sites || 0} tone="sky" />
        <StatCard label="Purchases" value={counts?.purchases || 0} tone="emerald" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {settings.map((setting) => {
          const Icon = setting.icon
          return (
            <div key={setting.label} className={cn(cardClass, 'p-5')}>
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-orange-50 p-2.5 text-orange-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {setting.label}
                  </p>
                  <p className="mt-1 truncate text-lg font-semibold text-slate-900">
                    {setting.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{setting.hint}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className={cn(cardClass, 'p-5 xl:col-span-2')}>
          <h2 className="font-display text-xl font-semibold text-slate-900">
            Applied migrations
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest database migrations recorded in this environment.
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50/70 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Migration</th>
                  <th className="px-4 py-3 font-medium">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {migrations.map((migration: any) => (
                  <tr key={migration.filename}>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-700">
                      {migration.filename}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">
                      {new Date(migration.executed_at).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
            <div className="flex items-center gap-2 text-emerald-800">
              <ShieldCheck className="h-5 w-5" />
              <p className="text-sm font-semibold">Super admin access</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-emerald-800/80">
              Super admins can manage templates, create sites, open any site in
              the editor, review purchases, approve payouts, and verify domains.
            </p>
          </div>

          <div className={cn(cardClass, 'p-5')}>
            <p className="text-sm font-semibold text-slate-900">
              Setup commands
            </p>
            <div className="mt-3 space-y-2 text-xs">
              <code className="block rounded-lg bg-slate-900 px-3 py-2 font-mono text-slate-100">
                npm run db:setup
              </code>
              <code className="block rounded-lg bg-slate-900 px-3 py-2 font-mono text-slate-100">
                npm run dev
              </code>
              <code className="block rounded-lg bg-slate-900 px-3 py-2 font-mono text-slate-100">
                npx tsc --noEmit
              </code>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Use <code className="font-mono">npm run db:ensure-admin</code> to
              restore super admin access at any time.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
