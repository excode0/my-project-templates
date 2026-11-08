import { db } from '@/lib/db'
import { AdminEarningsClient } from './AdminEarningsClient'

export const metadata = {
  title: 'Earnings - Admin - KOREX',
  description: 'Track contributor earnings, platform fees, and payouts',
}

export const dynamic = 'force-dynamic'

export async function AdminEarningsServer() {
  const summary = await db`
    SELECT
      COUNT(*)::int AS total,
      COALESCE(SUM(amount), 0)::int AS gross,
      COALESCE(SUM(platform_fee), 0)::int AS fees,
      COALESCE(SUM(net_amount), 0)::int AS net,
      COALESCE(SUM(net_amount) FILTER (WHERE status = 'pending'), 0)::int AS pending,
      COALESCE(SUM(net_amount) FILTER (WHERE status = 'paid'), 0)::int AS paid
    FROM earnings
  `.then((rows: any[]) => rows[0])

  const earnings = await db`
    SELECT
      e.id,
      e.amount,
      e.platform_fee,
      e.net_amount,
      e.status,
      e.created_at,
      e.paid_at,
      u.email AS contributor_email,
      u.username AS contributor_name,
      t.name AS template_name,
      tp.order_id
    FROM earnings e
    JOIN users u ON u.id = e.contributor_id
    JOIN templates t ON t.id = e.template_id
    LEFT JOIN template_purchases tp ON tp.id = e.purchase_id
    ORDER BY e.created_at DESC
    LIMIT 300
  `

  const data = earnings.map((row: any) => ({
    id: row.id,
    amount: Number(row.amount) || 0,
    platformFee: Number(row.platform_fee) || 0,
    netAmount: Number(row.net_amount) || 0,
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    paidAt: row.paid_at ? new Date(row.paid_at).toISOString() : null,
    contributorEmail: row.contributor_email,
    contributorName: row.contributor_name,
    templateName: row.template_name,
    orderId: row.order_id,
  }))

  return (
    <AdminEarningsClient
      earnings={data}
      summary={{
        total: Number(summary?.total) || 0,
        gross: Number(summary?.gross) || 0,
        fees: Number(summary?.fees) || 0,
        net: Number(summary?.net) || 0,
        pending: Number(summary?.pending) || 0,
        paid: Number(summary?.paid) || 0,
      }}
    />
  )
}
