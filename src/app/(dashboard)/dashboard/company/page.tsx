import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/guards'
import {
  CompanyIdentityClient,
  type CompanyProfile,
} from './CompanyIdentityClient'

export const metadata = {
  title: 'Company identity - Admin - KOREX',
  description: 'Manage the public company profile, branding, and contact details',
}

export const dynamic = 'force-dynamic'

interface CompanyIdentityRow {
  id: string
  name: string
  tagline: string | null
  description: string | null
  logo_url: string | null
  favicon_url: string | null
  primary_color: string | null
  secondary_color: string | null
  accent_color: string | null
  email: string | null
  phone: string | null
  address: string | null
  website: string | null
  founded_year: number | null
  team_size: string | null
  mission: string | null
  values: string | null
  about_image_url: string | null
  social_links: Record<string, string> | null
}

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

export default async function CompanyIdentityPage() {
  await requireAdmin('/dashboard/company')

  const row = await db`
    SELECT *
    FROM company_identity
    ORDER BY created_at ASC
    LIMIT 1
  `.then((rows: CompanyIdentityRow[]) => rows[0])

  const socialLinks = Object.fromEntries(
    Object.entries(row?.social_links ?? {}).filter(
      ([, value]) => typeof value === 'string' && value.length > 0
    )
  ) as Record<string, string>

  const profile: CompanyProfile = {
    id: text(row?.id),
    name: text(row?.name, 'Korex'),
    tagline: text(row?.tagline),
    description: text(row?.description),
    logoUrl: text(row?.logo_url),
    faviconUrl: text(row?.favicon_url),
    primaryColor: text(row?.primary_color, '#FF6B35'),
    secondaryColor: text(row?.secondary_color, '#004E89'),
    accentColor: text(row?.accent_color, '#F7931E'),
    email: text(row?.email),
    phone: text(row?.phone),
    address: text(row?.address),
    website: text(row?.website),
    foundedYear:
      row?.founded_year === null || row?.founded_year === undefined
        ? ''
        : String(row.founded_year),
    teamSize: text(row?.team_size),
    mission: text(row?.mission),
    values: text(row?.values),
    aboutImageUrl: text(row?.about_image_url),
    socialLinks,
  }

  return <CompanyIdentityClient initialProfile={profile} />
}
