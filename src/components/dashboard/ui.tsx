import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Shared dashboard UI primitives.
 *
 * One visual language for every dashboard page: KOREX fire accents on a calm,
 * neutral surface. Keeping these here avoids the drift that produced several
 * slightly different card/table/header styles across the dashboard.
 */

export const cardClass =
  'rounded-2xl border border-slate-200/80 bg-white shadow-sm'

export const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'

export const selectClass =
  'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100'

export const thClass =
  'whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500'

export const tdClass = 'px-4 py-3 align-middle'

export const btnPrimaryClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-900/20 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

export const btnSecondaryClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-60'

export const btnGhostClass =
  'inline-flex items-center justify-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300'

export const btnDangerClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60'

/* -------------------------------------------------------------------------- */
/* Layout                                                                      */
/* -------------------------------------------------------------------------- */

export function PageShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  )
}

export function PageHeader({
  eyebrow = 'Control Center',
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn(cardClass, className)}>{children}</div>
}

export function SectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-3',
        className
      )}
    >
      <div>
        <h2 className="font-display text-xl font-semibold text-slate-900">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Stats                                                                       */
/* -------------------------------------------------------------------------- */

const statTones = {
  default: {
    card: '',
    value: 'text-slate-900',
    label: 'text-slate-500',
    icon: 'bg-slate-100 text-slate-600',
  },
  orange: {
    card: '',
    value: 'text-slate-900',
    label: 'text-slate-500',
    icon: 'bg-orange-50 text-orange-600',
  },
  emerald: {
    card: '',
    value: 'text-slate-900',
    label: 'text-slate-500',
    icon: 'bg-emerald-50 text-emerald-600',
  },
  amber: {
    card: '',
    value: 'text-slate-900',
    label: 'text-slate-500',
    icon: 'bg-amber-50 text-amber-600',
  },
  sky: {
    card: '',
    value: 'text-slate-900',
    label: 'text-slate-500',
    icon: 'bg-sky-50 text-sky-600',
  },
  violet: {
    card: '',
    value: 'text-slate-900',
    label: 'text-slate-500',
    icon: 'bg-violet-50 text-violet-600',
  },
  rose: {
    card: '',
    value: 'text-slate-900',
    label: 'text-slate-500',
    icon: 'bg-rose-50 text-rose-600',
  },
} as const

export type StatTone = keyof typeof statTones

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: ReactNode
  hint?: string
  icon?: LucideIcon
  tone?: StatTone
}) {
  const styles = statTones[tone]

  return (
    <div className={cn(cardClass, 'p-5', styles.card)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.12em]',
              styles.label
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              'mt-2 truncate text-2xl font-semibold tabular-nums',
              styles.value
            )}
          >
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-slate-500">{hint}</p>
          ) : null}
        </div>
        {Icon ? (
          <span className={cn('rounded-xl p-2.5', styles.icon)}>
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Status & empty states                                                       */
/* -------------------------------------------------------------------------- */

const statusTones: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  verified: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  review: 'bg-amber-50 text-amber-700 ring-amber-200',
  draft: 'bg-slate-100 text-slate-600 ring-slate-200',
  suspended: 'bg-red-50 text-red-700 ring-red-200',
  failed: 'bg-red-50 text-red-700 ring-red-200',
  rejected: 'bg-red-50 text-red-700 ring-red-200',
  refunded: 'bg-sky-50 text-sky-700 ring-sky-200',
  expired: 'bg-slate-100 text-slate-600 ring-slate-200',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset',
        statusTones[status] || 'bg-slate-100 text-slate-600 ring-slate-200'
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {Icon ? (
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <Icon className="h-6 w-6" />
        </span>
      ) : null}
      <p className="mt-4 text-sm font-semibold text-slate-900">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Tables & filters                                                            */
/* -------------------------------------------------------------------------- */

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <Panel className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          {children}
        </table>
      </div>
    </Panel>
  )
}

export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
      {children}
    </div>
  )
}

export function SearchField({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}) {
  return (
    <div className={cn('relative flex-1', className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      >
        <circle cx="9" cy="9" r="6" />
        <path d="m13.5 13.5 3 3" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(inputClass, 'pl-9')}
      />
    </div>
  )
}

export function SelectField({
  value,
  onChange,
  label,
  children,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  children: ReactNode
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={selectClass}
    >
      {children}
    </select>
  )
}
