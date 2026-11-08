import Link from 'next/link'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/guards'
import { CreateSiteForm } from './CreateSiteForm'

export const metadata = {
  title: 'Create Site - Admin - KOREX',
  description: 'Provision a new site for a user',
}

export const dynamic = 'force-dynamic'

export default async function CreateSitePage() {
  await requireAdmin('/dashboard/sites/new')

  const users = await db`
    SELECT id, email, username, role
    FROM users
    WHERE status = 'active'
    ORDER BY email
    LIMIT 500
  `

  const templates = await db`
    SELECT id, name, slug, price
    FROM templates
    WHERE status IN ('approved', 'published')
    ORDER BY name
  `

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/dashboard/sites"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-orange-600"
      >
        ← Back to sites
      </Link>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">
          Control Center
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">
          Create a site
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Provision a site for any user. Admin-created sites receive a
          complimentary completed purchase and open directly in the editor.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <CreateSiteForm
          users={users.map((row: any) => ({
            id: row.id,
            email: row.email,
            username: row.username,
            role: row.role,
          }))}
          templates={templates.map((row: any) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            price: Number(row.price) || 0,
          }))}
        />
      </div>
    </div>
  )
}
