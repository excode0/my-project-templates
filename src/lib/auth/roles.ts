import type { UserRole } from '@/types'

export const ADMIN_ROLES: UserRole[] = ['admin', 'super_admin']

export function isAdminRole(role?: string | null): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function isSuperAdminRole(role?: string | null): boolean {
  return role === 'super_admin'
}

export function isContributorRole(role?: string | null): boolean {
  return role === 'contributor'
}

export function canManageTemplates(role?: string | null): boolean {
  return role === 'contributor' || isAdminRole(role)
}

export function roleLabel(role?: string | null): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin'
    case 'admin':
      return 'Admin'
    case 'contributor':
      return 'Contributor'
    default:
      return 'User'
  }
}

export function dashboardPathForRole(role?: string | null): string {
  if (isAdminRole(role)) return '/admin-dashboard'
  if (role === 'contributor') return '/contributor-dashboard'
  return '/dashboard'
}
