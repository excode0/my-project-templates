import { db } from '@/lib/db'
import { AdminPurchasesClient } from './AdminPurchasesClient'

export const metadata = {
  title: 'Purchases - Admin - KOREX',
  description: 'Monitor all template purchases and payment statuses',
}

export const dynamic = 'force-dynamic'

export async function AdminPurchasesServer() {
  const summary = await db`
    SELECT
      COUNT(*)::int AS total,
      COALESCE(SUM(total_price), 0)::int AS revenue,
      COUNT(*) FILTER (WHERE status IN ('completed', 'active'))::int AS completed,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending
    FROM template_purchases
  `.then((rows: any[]) => rows[0])

  const purchases = await db`
    SELECT
      tp.id,
      tp.order_id,
      tp.status,
      tp.template_price,
      tp.domain_price,
      tp.total_price,
      tp.payment_method,
      tp.purchased_at,
      u.email AS user_email,
      u.username AS user_name,
      t.name AS template_name,
      t.slug AS template_slug,
      ti.id AS instance_id,
      ti.subdomain,
      ti.custom_domain
    FROM template_purchases tp
    JOIN users u ON u.id = tp.user_id
    JOIN templates t ON t.id = tp.template_id
    LEFT JOIN template_instances ti ON ti.purchase_id = tp.id
    ORDER BY tp.purchased_at DESC
    LIMIT 300
  `

  const data = purchases.map((row: any) => ({
    id: row.id,
    orderId: row.order_id,
    status: row.status,
    templatePrice: Number(row.template_price) || 0,
    domainPrice: Number(row.domain_price) || 0,
    totalPrice: Number(row.total_price) || 0,
    paymentMethod: row.payment_method || 'manual',
    purchasedAt: row.purchased_at ? new Date(row.purchased_at).toISOString() : null,
    userEmail: row.user_email,
    userName: row.user_name,
    templateName: row.template_name,
    templateSlug: row.template_slug,
    instanceId: row.instance_id,
    subdomain: row.subdomain,
    customDomain: row.custom_domain,
  }))

  return (
    <AdminPurchasesClient
      purchases={data}
      summary={{
        total: Number(summary?.total) || 0,
        revenue: Number(summary?.revenue) || 0,
        completed: Number(summary?.completed) || 0,
        pending: Number(summary?.pending) || 0,
      }}
    />
  )
}
