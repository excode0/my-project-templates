import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth/roles'
import { clearCompanyIdentityCache } from '@/lib/company'
import { db } from '@/lib/db'

const nullableText = (max: number) =>
  z.string().trim().max(max).nullable().optional()

const optionalColor = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex color')
  .nullable()
  .optional()

interface CompanyIdentityIdRow {
  id: string
}

interface SavedCompanyIdentityRow {
  id: string
  updated_at: string | Date
}

const CompanyIdentitySchema = z.object({
  name: z.string().trim().min(1).max(255),
  tagline: nullableText(500),
  description: nullableText(10000),
  logoUrl: nullableText(500),
  faviconUrl: nullableText(500),
  primaryColor: optionalColor,
  secondaryColor: optionalColor,
  accentColor: optionalColor,
  email: z.string().trim().email().max(255).nullable().optional(),
  phone: nullableText(20),
  address: nullableText(2000),
  website: z.string().trim().url().max(255).nullable().optional(),
  foundedYear: z.number().int().min(1800).max(2100).nullable().optional(),
  teamSize: nullableText(50),
  mission: nullableText(10000),
  values: nullableText(10000),
  aboutImageUrl: nullableText(500),
  socialLinks: z.record(z.string().trim().max(500)).optional(),
})

/**
 * PATCH /api/admin/company
 * Update the single company identity record used by public pages.
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!isAdminRole(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json().catch(() => null)
    const validation = CompanyIdentitySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid company identity',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const data = validation.data
    const socialLinks = Object.fromEntries(
      Object.entries(data.socialLinks ?? {}).filter(
        ([, value]) => value.trim().length > 0
      )
    )

    const existing = await db`
      SELECT id
      FROM company_identity
      ORDER BY created_at ASC
      LIMIT 1
    `.then((rows: CompanyIdentityIdRow[]) => rows[0])

    const rows = existing
      ? await db`
          UPDATE company_identity
          SET
            name = ${data.name},
            tagline = ${data.tagline ?? null},
            description = ${data.description ?? null},
            logo_url = ${data.logoUrl ?? null},
            favicon_url = ${data.faviconUrl ?? null},
            primary_color = ${data.primaryColor ?? null},
            secondary_color = ${data.secondaryColor ?? null},
            accent_color = ${data.accentColor ?? null},
            email = ${data.email ?? null},
            phone = ${data.phone ?? null},
            address = ${data.address ?? null},
            website = ${data.website ?? null},
            founded_year = ${data.foundedYear ?? null},
            team_size = ${data.teamSize ?? null},
            mission = ${data.mission ?? null},
            values = ${data.values ?? null},
            about_image_url = ${data.aboutImageUrl ?? null},
            social_links = ${db.json(socialLinks)},
            updated_at = NOW()
          WHERE id = ${existing.id}
          RETURNING id, updated_at
        `.then((rows: SavedCompanyIdentityRow[]) => rows)
      : await db`
          INSERT INTO company_identity (
            name,
            tagline,
            description,
            logo_url,
            favicon_url,
            primary_color,
            secondary_color,
            accent_color,
            email,
            phone,
            address,
            website,
            founded_year,
            team_size,
            mission,
            values,
            about_image_url,
            social_links
          ) VALUES (
            ${data.name},
            ${data.tagline ?? null},
            ${data.description ?? null},
            ${data.logoUrl ?? null},
            ${data.faviconUrl ?? null},
            ${data.primaryColor ?? null},
            ${data.secondaryColor ?? null},
            ${data.accentColor ?? null},
            ${data.email ?? null},
            ${data.phone ?? null},
            ${data.address ?? null},
            ${data.website ?? null},
            ${data.foundedYear ?? null},
            ${data.teamSize ?? null},
            ${data.mission ?? null},
            ${data.values ?? null},
            ${data.aboutImageUrl ?? null},
            ${db.json(socialLinks)}
          )
          RETURNING id, updated_at
        `.then((rows: SavedCompanyIdentityRow[]) => rows)
    const saved = rows[0]

    clearCompanyIdentityCache()
    revalidatePath('/', 'layout')
    revalidatePath('/contact')

    return NextResponse.json({
      success: true,
      data: {
        id: saved.id,
        updatedAt: saved.updated_at,
      },
    })
  } catch (error) {
    console.error('Error updating company identity:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
