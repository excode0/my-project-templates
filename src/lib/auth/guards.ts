import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { canManageTemplates, isAdminRole } from '@/lib/auth/roles'

export async function requireAdmin(callbackUrl = '/dashboard') {
  const session = await auth()

  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}` as any)
  }

  if (!isAdminRole(session.user.role)) {
    redirect('/dashboard' as any)
  }

  return session
}

export async function requireTemplateManager(callbackUrl = '/dashboard') {
  const session = await auth()

  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}` as any)
  }

  if (!canManageTemplates(session.user.role)) {
    redirect('/dashboard' as any)
  }

  return session
}
