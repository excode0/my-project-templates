import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isAdminRole } from '@/lib/auth/roles'
import { AdminEarningsServer } from '@/components/admin/AdminEarningsServer'
import { ContributorEarningsServer } from '@/components/contributor/EarningsServer'

export const metadata = {
  title: 'Earnings - Dashboard - KOREX',
  description: 'Track earnings, platform fees, and payouts',
}

export const dynamic = 'force-dynamic'

export default async function EarningsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/earnings' as any)
  }

  if (isAdminRole(session.user.role)) {
    return <AdminEarningsServer />
  }

  if (session.user.role === 'contributor') {
    return <ContributorEarningsServer />
  }

  redirect('/dashboard' as any)
}
