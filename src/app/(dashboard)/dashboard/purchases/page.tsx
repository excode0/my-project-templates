import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { isAdminRole } from '@/lib/auth/roles'
import { AdminPurchasesServer } from '@/components/admin/AdminPurchasesServer'
import { PurchaseHistoryClient } from './PurchaseHistoryClient'

export const metadata = {
  title: 'Purchases - Dashboard - KOREX',
  description: 'Monitor template purchases and payment statuses',
}

export const dynamic = 'force-dynamic'

export default async function PurchasesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/purchases' as any)
  }

  if (isAdminRole(session.user.role)) {
    return <AdminPurchasesServer />
  }

  return <PurchaseHistoryClient />
}
