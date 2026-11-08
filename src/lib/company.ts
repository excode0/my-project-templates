/**
 * Company Identity & Branding
 * 
 * Utility functions to fetch and cache company information
 * for use across public and internal pages.
 */

import { db } from '@/lib/db'

export interface CompanyIdentity {
  id: string
  name: string
  tagline?: string
  description?: string
  logoUrl?: string
  faviconUrl?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  foundedYear?: number
  teamSize?: string
  mission?: string
  values?: string
  aboutImageUrl?: string
  socialLinks?: Record<string, string>
}

// Cache for company identity (in-memory)
let cachedIdentity: CompanyIdentity | null = null
let cacheExpiry = 0

/**
 * Get company identity from database
 * Cached for 1 hour to reduce database queries
 */
export async function getCompanyIdentity(): Promise<CompanyIdentity | null> {
  const now = Date.now()

  // Return cached value if still valid
  if (cachedIdentity && now < cacheExpiry) {
    return cachedIdentity
  }

  try {
    const rows = await db`
      SELECT *
      FROM company_identity
      LIMIT 1
    `

    if (rows.length === 0) {
      return null
    }

    const row = rows[0] as any

    cachedIdentity = {
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      description: row.description,
      logoUrl: row.logo_url,
      faviconUrl: row.favicon_url,
      primaryColor: row.primary_color,
      secondaryColor: row.secondary_color,
      accentColor: row.accent_color,
      email: row.email,
      phone: row.phone,
      address: row.address,
      website: row.website,
      foundedYear: row.founded_year,
      teamSize: row.team_size,
      mission: row.mission,
      values: row.values,
      aboutImageUrl: row.about_image_url,
      socialLinks: row.social_links || {},
    }

    // Set cache expiry to 1 hour
    cacheExpiry = now + 60 * 60 * 1000

    return cachedIdentity
  } catch (error) {
    console.error('Error fetching company identity:', error)
    return null
  }
}

/**
 * Clear company identity cache
 * Call this after updating company information
 */
export function clearCompanyIdentityCache() {
  cachedIdentity = null
  cacheExpiry = 0
}

/**
 * Get company branding colors
 */
export async function getCompanyColors() {
  const identity = await getCompanyIdentity()

  return {
    primary: identity?.primaryColor || '#FF6B35',
    secondary: identity?.secondaryColor || '#004E89',
    accent: identity?.accentColor || '#F7931E',
  }
}

/**
 * Get company social links
 */
export async function getCompanySocialLinks() {
  const identity = await getCompanyIdentity()

  return identity?.socialLinks || {
    twitter: 'https://twitter.com/korex_studio',
    linkedin: 'https://linkedin.com/company/korex',
    instagram: 'https://instagram.com/korex_studio',
    github: 'https://github.com/korex',
  }
}

/**
 * Get company contact info
 */
export async function getCompanyContact() {
  const identity = await getCompanyIdentity()

  return {
    name: identity?.name || 'Korex',
    email: identity?.email || 'support@korex.studio',
    phone: identity?.phone || '+62 (XXX) XXXX',
    address: identity?.address || 'Jakarta, Indonesia',
    website: identity?.website || 'https://korex.studio',
  }
}
