'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  ArrowUpRight,
  Brush,
  Building2,
  LayoutDashboard,
  Store,
  Receipt,
  Layers,
  PlusCircle,
  Wallet,
  Users,
  Globe,
  Settings,
  MonitorSmartphone,
  Menu,
  X,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { isAdminRole, roleLabel } from '@/lib/auth/roles'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  exact?: boolean
}

interface NavSection {
  label: string
  items: NavItem[]
}

interface DashboardShellProps {
  role: string
  email: string
  children: React.ReactNode
}

function getNavSections(role: string): NavSection[] {
  if (isAdminRole(role)) {
    return [
      {
        label: 'Control Center',
        items: [
          {
            label: 'Overview',
            href: '/dashboard',
            icon: LayoutDashboard,
            exact: true,
          },
          { label: 'Templates', href: '/dashboard/templates', icon: Layers },
          {
            label: 'Template Editor',
            href: '/dashboard/editor',
            icon: Brush,
          },
          { label: 'Sites', href: '/dashboard/sites', icon: MonitorSmartphone },
        ],
      },
      {
        label: 'Commerce',
        items: [
          { label: 'Purchases', href: '/dashboard/purchases', icon: Receipt },
          { label: 'Earnings', href: '/dashboard/earnings', icon: Wallet },
          { label: 'Domains', href: '/dashboard/domains', icon: Globe },
        ],
      },
      {
        label: 'Platform',
        items: [
          { label: 'Users', href: '/dashboard/users', icon: Users },
          {
            label: 'Company identity',
            href: '/dashboard/company',
            icon: Building2,
          },
          { label: 'Settings', href: '/dashboard/settings', icon: Settings },
        ],
      },
    ]
  }

  if (role === 'contributor') {
    return [
      {
        label: 'Workspace',
        items: [
          {
            label: 'Overview',
            href: '/dashboard',
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: 'Create Template',
            href: '/dashboard/templates/new',
            icon: PlusCircle,
          },
          { label: 'Earnings', href: '/dashboard/earnings', icon: Wallet },
        ],
      },
      {
        label: 'Discover',
        items: [{ label: 'Marketplace', href: '/marketplace', icon: Store }],
      },
    ]
  }

  return [
    {
      label: 'My Workspace',
      items: [
        {
          label: 'My Sites',
          href: '/dashboard',
          icon: LayoutDashboard,
          exact: true,
        },
        { label: 'Purchases', href: '/dashboard/purchases', icon: Receipt },
      ],
    },
    {
      label: 'Discover',
      items: [{ label: 'Marketplace', href: '/marketplace', icon: Store }],
    },
  ]
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/templates': 'Templates',
  '/dashboard/templates/new': 'Create template',
  '/dashboard/editor': 'Template Editor',
  '/dashboard/sites': 'Sites',
  '/dashboard/sites/new': 'Create site',
  '/dashboard/purchases': 'Purchases',
  '/dashboard/earnings': 'Earnings',
  '/dashboard/domains': 'Domains',
  '/dashboard/users': 'Users',
  '/dashboard/company': 'Company identity',
  '/dashboard/settings': 'Settings',
}

function resolvePageTitle(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname]
  const match = Object.keys(pageTitles)
    .filter((key) => key !== '/dashboard' && pathname.startsWith(`${key}/`))
    .sort((a, b) => b.length - a.length)[0]
  return match ? pageTitles[match] : 'Dashboard'
}

export function DashboardShell({ role, email, children }: DashboardShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navSections = getNavSections(role)
  const canCreateTemplate = isAdminRole(role) || role === 'contributor'
  const pageTitle = resolvePageTitle(pathname)
  const displayName = email?.split('@')[0] || 'Account'
  const initials = displayName.slice(0, 2).toUpperCase()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`)

  const sidebar = (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
        <Link href="/" className="group inline-flex items-center gap-3">
          <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-50 to-orange-100 ring-1 ring-orange-200">
            <Image
              src="/logo1.png"
              alt="KOREX"
              width={36}
              height={36}
              className="h-8 w-8 object-contain"
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-wide text-slate-900">
              KOREX
            </span>
            <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.3em] text-slate-500">
              {isAdminRole(role) ? 'Control Center' : 'Workspace'}
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {canCreateTemplate ? (
        <div className="px-4 pt-5">
          <Link
            href="/dashboard/templates/new"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <PlusCircle className="h-4 w-4" />
            New template
          </Link>
        </div>
      ) : null}

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              {section.label}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon
              const active = isActive(item)

              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400',
                    active
                      ? 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {active ? (
                    <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                  ) : null}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-xs font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-slate-500">{email}</p>
          </div>
        </div>
        <div className="flex items-center justify-between px-1">
          <span className="inline-flex rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-700">
            {roleLabel(role)}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
        {sidebar}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] shadow-2xl">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-lg text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex items-center gap-2 text-sm">
              <li className="hidden text-slate-400 sm:block">
                {isAdminRole(role) ? 'Control Center' : 'Workspace'}
              </li>
              <li className="hidden text-slate-300 sm:block">/</li>
              <li className="truncate font-medium text-slate-900">
                {pageTitle}
              </li>
            </ol>
          </nav>

          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-orange-300 hover:text-orange-600"
          >
            Marketplace
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </header>

        <main>{children}</main>
      </div>
    </div>
  )
}
