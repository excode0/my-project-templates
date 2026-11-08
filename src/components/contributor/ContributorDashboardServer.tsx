import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { ContributorDashboardClient } from './ContributorDashboardClient'

export const metadata = {
  title: 'Contributor Dashboard - Template Marketplace',
  description: 'Manage your templates and earnings',
}

export async function ContributorDashboardServer() {
  const session = await auth()
  
  if (!session || !session.user) {
    redirect('/login?callbackUrl=/contributor')
  }

  const userId = session.user.id

  // Fetch contributor's templates
  const templates = await db`
    SELECT 
      t.id,
      t.name,
      t.slug,
      t.category,
      t.price,
      t.status,
      t.preview_image,
      t.description,
      t.created_at,
      t.updated_at,
      COUNT(DISTINCT tp.id) as purchase_count,
      COALESCE(SUM(tp.template_price), 0) as total_revenue
    FROM templates t
    LEFT JOIN template_purchases tp ON tp.template_id = t.id
    WHERE t.contributor_id = ${userId}
    GROUP BY t.id
    ORDER BY t.updated_at DESC
  `.then((rows: any[]) => rows)

  // Fetch earnings summary
  const earnings = await db`
    SELECT 
      COALESCE(SUM(e.amount), 0) as total_earnings,
      COALESCE(SUM(CASE WHEN e.status = 'pending' THEN e.amount ELSE 0 END), 0) as pending_earnings,
      COALESCE(SUM(CASE WHEN e.status = 'paid' THEN e.amount ELSE 0 END), 0) as paid_earnings
    FROM earnings e
    WHERE e.contributor_id = ${userId}
  `.then((rows: any[]) => rows[0])

  // Fetch recent earnings history
  const earningsHistory = await db`
    SELECT 
      e.id,
      e.amount,
      e.status,
      e.created_at,
      t.name as template_name,
      u.email as buyer_email
    FROM earnings e
    JOIN templates t ON t.id = e.template_id
    JOIN template_purchases tp ON tp.id = e.purchase_id
    JOIN users u ON u.id = tp.user_id
    WHERE e.contributor_id = ${userId}
    ORDER BY e.created_at DESC
    LIMIT 10
  `.then((rows: any[]) => rows)

  return (
    <ContributorDashboardClient
      templates={templates}
      earnings={earnings}
      earningsHistory={earningsHistory}
      userId={userId}
      userEmail={session.user.email}
      userRole={session.user.role}
    />
  )
}

export const dynamic = 'force-dynamic'
