import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { AdminDashboardClient } from './AdminDashboardClient'

export const metadata = {
  title: 'Control Center - KOREX',
  description: 'Platform overview, revenue, templates, sites, and operations',
}

export const dynamic = 'force-dynamic'

export async function AdminDashboardServer() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard' as any)
  }

  const stats = await db`
    SELECT
      (SELECT COUNT(*) FROM users)::int AS total_users,
      (SELECT COUNT(*) FROM users WHERE role = 'contributor')::int AS total_contributors,
      (SELECT COUNT(*) FROM templates)::int AS total_templates,
      (SELECT COUNT(*) FROM templates WHERE status IN ('approved', 'published'))::int AS published_templates,
      (SELECT COUNT(*) FROM templates WHERE status IN ('pending', 'review'))::int AS pending_review,
      (SELECT COUNT(*) FROM template_instances)::int AS total_sites,
      (SELECT COUNT(*) FROM template_purchases)::int AS total_purchases,
      (SELECT COALESCE(SUM(total_price), 0) FROM template_purchases WHERE status IN ('completed', 'active'))::int AS total_revenue,
      (SELECT COALESCE(SUM(net_amount), 0) FROM earnings WHERE status = 'pending')::int AS pending_payouts,
      (SELECT COUNT(*) FROM domains)::int AS total_domains,
      (SELECT COUNT(*) FROM domains WHERE status = 'verified')::int AS verified_domains
  `.then((rows: any[]) => rows[0])

  const revenueSeries = await db`
    SELECT
      to_char(d.day, 'YYYY-MM-DD') AS date,
      COALESCE(SUM(tp.total_price), 0)::int AS amount
    FROM generate_series(
      CURRENT_DATE - INTERVAL '6 days',
      CURRENT_DATE,
      INTERVAL '1 day'
    ) AS d(day)
    LEFT JOIN template_purchases tp
      ON DATE(tp.purchased_at) = d.day
      AND tp.status IN ('completed', 'active')
    GROUP BY d.day
    ORDER BY d.day
  `

  const pendingTemplates = await db`
    SELECT
      t.id,
      t.name,
      t.slug,
      t.category,
      t.price,
      t.preview_image,
      t.updated_at,
      u.email AS contributor_email
    FROM templates t
    JOIN users u ON u.id = t.contributor_id
    WHERE t.status IN ('pending', 'review')
    ORDER BY t.updated_at ASC
    LIMIT 5
  `

  const recentPurchases = await db`
    SELECT
      tp.id,
      tp.status,
      tp.total_price,
      tp.purchased_at,
      u.email AS user_email,
      t.name AS template_name,
      t.slug AS template_slug
    FROM template_purchases tp
    JOIN users u ON u.id = tp.user_id
    JOIN templates t ON t.id = tp.template_id
    ORDER BY tp.purchased_at DESC
    LIMIT 6
  `

  const recentSites = await db`
    SELECT
      ti.id,
      ti.subdomain,
      ti.custom_domain,
      ti.status,
      ti.created_at,
      u.email AS user_email,
      t.name AS template_name,
      t.slug AS template_slug
    FROM template_instances ti
    JOIN users u ON u.id = ti.user_id
    JOIN templates t ON t.id = ti.template_id
    ORDER BY ti.created_at DESC
    LIMIT 6
  `

  const recentUsers = await db`
    SELECT id, email, username, role, status, created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT 6
  `

  return (
    <AdminDashboardClient
      stats={{
        totalUsers: Number(stats?.total_users) || 0,
        totalContributors: Number(stats?.total_contributors) || 0,
        totalTemplates: Number(stats?.total_templates) || 0,
        publishedTemplates: Number(stats?.published_templates) || 0,
        pendingReview: Number(stats?.pending_review) || 0,
        totalSites: Number(stats?.total_sites) || 0,
        totalPurchases: Number(stats?.total_purchases) || 0,
        totalRevenue: Number(stats?.total_revenue) || 0,
        pendingPayouts: Number(stats?.pending_payouts) || 0,
        totalDomains: Number(stats?.total_domains) || 0,
        verifiedDomains: Number(stats?.verified_domains) || 0,
      }}
      revenueSeries={revenueSeries.map((row: any) => ({
        date: row.date,
        amount: Number(row.amount) || 0,
      }))}
      pendingTemplates={pendingTemplates.map((row: any) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        category: row.category,
        price: Number(row.price) || 0,
        previewImage: row.preview_image,
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
        contributorEmail: row.contributor_email,
      }))}
      recentPurchases={recentPurchases.map((row: any) => ({
        id: row.id,
        status: row.status,
        totalPrice: Number(row.total_price) || 0,
        purchasedAt: row.purchased_at
          ? new Date(row.purchased_at).toISOString()
          : null,
        userEmail: row.user_email,
        templateName: row.template_name,
        templateSlug: row.template_slug,
      }))}
      recentSites={recentSites.map((row: any) => ({
        id: row.id,
        subdomain: row.subdomain,
        customDomain: row.custom_domain,
        status: row.status,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
        userEmail: row.user_email,
        templateName: row.template_name,
        templateSlug: row.template_slug,
      }))}
      recentUsers={recentUsers.map((row: any) => ({
        id: row.id,
        email: row.email,
        username: row.username,
        role: row.role,
        status: row.status,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
      }))}
      userEmail={session.user.email}
      userRole={session.user.role}
    />
  )
}
