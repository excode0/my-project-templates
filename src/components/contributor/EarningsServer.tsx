import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { EarningsClient } from './EarningsClient'

export const metadata = {
  title: 'Earnings - Contributor Dashboard',
  description: 'View your earnings and transaction history',
}

export async function ContributorEarningsServer() {
  const session = await auth()
  
  if (!session || !session.user) {
    redirect('/login?callbackUrl=/contributor/earnings' as any)
  }

  const userId = session.user.id

  // Fetch earnings summary
  const summary = await db`
    SELECT 
      COALESCE(SUM(e.amount), 0) as total_earnings,
      COALESCE(SUM(CASE WHEN e.status = 'pending' THEN e.amount ELSE 0 END), 0) as pending_earnings,
      COALESCE(SUM(CASE WHEN e.status = 'paid' THEN e.amount ELSE 0 END), 0) as paid_earnings,
      COUNT(*) as total_transactions
    FROM earnings e
    WHERE e.contributor_id = ${userId}
  `.then((rows: any[]) => rows[0])

  // Fetch all earnings history
  const earnings = await db`
    SELECT 
      e.id,
      e.amount,
      e.status,
      e.created_at,
      t.name as template_name,
      t.slug as template_slug,
      u.email as buyer_email
    FROM earnings e
    JOIN templates t ON t.id = e.template_id
    JOIN template_purchases tp ON tp.id = e.purchase_id
    JOIN users u ON u.id = tp.user_id
    WHERE e.contributor_id = ${userId}
    ORDER BY e.created_at DESC
  `.then((rows: any[]) => rows)

  // Fetch earnings by template
  const byTemplate = await db`
    SELECT 
      t.id,
      t.name,
      t.slug,
      COUNT(e.id) as sale_count,
      COALESCE(SUM(e.amount), 0) as total_earned
    FROM templates t
    LEFT JOIN earnings e ON e.template_id = t.id
    WHERE t.contributor_id = ${userId}
    GROUP BY t.id, t.name, t.slug
    ORDER BY total_earned DESC
  `.then((rows: any[]) => rows)

  return (
    <EarningsClient
      summary={summary}
      earnings={earnings}
      byTemplate={byTemplate}
      userEmail={session.user.email}
      userRole={session.user.role}
    />
  )
}

export const dynamic = 'force-dynamic'
