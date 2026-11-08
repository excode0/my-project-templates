import type { ReactNode } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/dashboard' as any)
  }

  return (
    <DashboardShell role={session.user.role} email={session.user.email}>
      {children}
    </DashboardShell>
  )
}
