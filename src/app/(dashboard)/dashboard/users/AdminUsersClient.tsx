'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import {
  EmptyState,
  PageHeader,
  PageShell,
  SearchField,
  SelectField,
  StatCard,
  TableShell,
  Toolbar,
  btnPrimaryClass,
  btnGhostClass,
  inputClass,
  tdClass,
  thClass,
} from '@/components/dashboard/ui'
import { cn } from '@/lib/utils'

interface User {
  id: string
  email: string
  username: string | null
  role: string
  status: string
  createdAt: string | null
  templateCount: number
  instanceCount: number
}

interface AdminUsersClientProps {
  users: User[]
  initialFilters: {
    role: string
    search: string
  }
}

const roleStyles: Record<string, string> = {
  user: 'bg-sky-50 text-sky-700 ring-sky-200',
  contributor: 'bg-violet-50 text-violet-700 ring-violet-200',
  admin: 'bg-orange-50 text-orange-700 ring-orange-200',
  super_admin: 'bg-red-50 text-red-700 ring-red-200',
}

const roleLabels: Record<string, string> = {
  user: 'User',
  contributor: 'Contributor',
  admin: 'Admin',
  super_admin: 'Super admin',
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
        roleStyles[role] || 'bg-slate-100 text-slate-600 ring-slate-200'
      )}
    >
      {roleLabels[role] || role}
    </span>
  )
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function initials(user: User) {
  return (user.username || user.email).slice(0, 2).toUpperCase()
}

export function AdminUsersClient({
  users,
  initialFilters,
}: AdminUsersClientProps) {
  const router = useRouter()
  const [filters, setFilters] = useState(initialFilters)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams()
      if (filters.role !== 'all') params.set('role', filters.role)
      if (filters.search.trim()) params.set('search', filters.search.trim())

      const query = params.toString()
      router.replace(
        (`/dashboard/users${query ? `?${query}` : ''}`) as any,
        { scroll: false }
      )
    }, 350)

    return () => clearTimeout(timer)
  }, [filters, router])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase()
    return users.filter((user) => {
      if (filters.role !== 'all' && user.role !== filters.role) return false
      if (
        term &&
        ![user.email, user.username]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
      ) {
        return false
      }
      return true
    })
  }, [users, filters])

  const stats = useMemo(
    () => ({
      total: users.length,
      users: users.filter((user) => user.role === 'user').length,
      contributors: users.filter((user) => user.role === 'contributor').length,
      admins: users.filter(
        (user) => user.role === 'admin' || user.role === 'super_admin'
      ).length,
    }),
    [users]
  )

  const openRoleModal = (user: User) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setError('')
  }

  const closeRoleModal = () => {
    if (loading) return
    setSelectedUser(null)
    setError('')
  }

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return

    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update role')
      }

      setNotice(`${selectedUser.email} is now ${roleLabels[newRole]}.`)
      setSelectedUser(null)
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Control Center"
        title="User management"
        description="Manage roles, access, and every account on the platform."
      />

      {notice ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          {notice}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total accounts" value={stats.total} tone="orange" />
        <StatCard label="Users" value={stats.users} tone="sky" />
        <StatCard
          label="Contributors"
          value={stats.contributors}
          tone="violet"
        />
        <StatCard label="Admins" value={stats.admins} tone="rose" />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900">
            Accounts
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Showing {filtered.length} of {users.length} accounts.
          </p>
        </div>

        <TableShell>
          <Toolbar>
            <SearchField
              value={filters.search}
              onChange={(value) => setFilter('search', value)}
              placeholder="Search by name or email"
            />
            <SelectField
              label="Filter by role"
              value={filters.role}
              onChange={(value) => setFilter('role', value)}
            >
              <option value="all">All roles</option>
              <option value="user">User</option>
              <option value="contributor">Contributor</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super admin</option>
            </SelectField>
          </Toolbar>

          <thead className="bg-slate-50/70">
            <tr>
              <th className={thClass}>Account</th>
              <th className={thClass}>Role</th>
              <th className={thClass}>Templates</th>
              <th className={thClass}>Sites</th>
              <th className={thClass}>Joined</th>
              <th className={cn(thClass, 'text-right')}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={Users}
                    title="No accounts match your filters"
                    description="Try a different search term or role."
                  />
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/60">
                  <td className={tdClass}>
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {initials(user)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {user.username || user.email.split('@')[0]}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={tdClass}>
                    <RoleBadge role={user.role} />
                  </td>
                  <td className={cn(tdClass, 'text-slate-600')}>
                    {user.templateCount}
                  </td>
                  <td className={cn(tdClass, 'text-slate-600')}>
                    {user.instanceCount}
                  </td>
                  <td
                    className={cn(
                      tdClass,
                      'whitespace-nowrap text-xs text-slate-500'
                    )}
                  >
                    {formatDate(user.createdAt)}
                  </td>
                  <td className={cn(tdClass, 'whitespace-nowrap text-right')}>
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/dashboard/sites?search=${encodeURIComponent(user.email)}` as any}
                        className={btnGhostClass}
                      >
                        Sites
                      </Link>
                      <Link
                        href={`/dashboard/templates?search=${encodeURIComponent(user.email)}` as any}
                        className={btnGhostClass}
                      >
                        Templates
                      </Link>
                      <button
                        type="button"
                        onClick={() => openRoleModal(user)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-orange-600 transition hover:bg-orange-50"
                      >
                        <UserCog className="h-3.5 w-3.5" />
                        Role
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </TableShell>
      </div>

      {selectedUser ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-dialog-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeRoleModal()
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <button
                type="button"
                onClick={closeRoleModal}
                disabled={loading}
                aria-label="Close role dialog"
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h2
              id="role-dialog-title"
              className="mt-4 font-display text-xl font-semibold text-slate-900"
            >
              Change role
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update access for{' '}
              <strong className="text-slate-700">{selectedUser.email}</strong>.
            </p>

            <div className="mt-5">
              <label
                htmlFor="role-select"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Role
              </label>
              <select
                id="role-select"
                value={newRole}
                onChange={(event) => setNewRole(event.target.value)}
                disabled={loading}
                className={inputClass}
              >
                <option value="user">User</option>
                <option value="contributor">Contributor</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super admin</option>
              </select>
            </div>

            {error ? (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeRoleModal}
                disabled={loading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleChangeRole}
                disabled={loading || newRole === selectedUser.role}
                className={btnPrimaryClass}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save role
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  )
}
