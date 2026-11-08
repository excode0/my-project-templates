import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { canManageTemplates } from '@/lib/auth/roles'

const CreateTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  description: z.string().optional(),
  preview_image: z.string().optional(),
  type: z.enum(['hardcode', 'editor']).default('hardcode'),
  requires_custom_domain: z.boolean().default(false),
  status: z
    .enum(['draft', 'review', 'pending', 'published', 'approved', 'rejected'])
    .default('draft'),
})

/**
 * GET /api/templates
 * List templates
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let templates
    if (status && category) {
      templates = await db`
        SELECT 
          id, name, slug, category, price, preview_image, description,
          requires_custom_domain, status, created_at
        FROM templates
        WHERE status = ${status} AND category = ${category}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `.then((rows: any[]) => rows)
    } else if (status) {
      templates = await db`
        SELECT 
          id, name, slug, category, price, preview_image, description,
          requires_custom_domain, status, created_at
        FROM templates
        WHERE status = ${status}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `.then((rows: any[]) => rows)
    } else if (category) {
      templates = await db`
        SELECT 
          id, name, slug, category, price, preview_image, description,
          requires_custom_domain, status, created_at
        FROM templates
        WHERE status IN ('approved', 'published') AND category = ${category}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `.then((rows: any[]) => rows)
    } else {
      templates = await db`
        SELECT 
          id, name, slug, category, price, preview_image, description,
          requires_custom_domain, status, created_at
        FROM templates
        WHERE status IN ('approved', 'published')
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `.then((rows: any[]) => rows)
    }

    return NextResponse.json({
      success: true,
      data: templates,
      meta: {
        limit,
        offset,
        count: templates.length,
      },
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/templates
 * Create new template (contributor only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is contributor or admin
    if (!canManageTemplates(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Only contributors can create templates' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = CreateTemplateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const data = validation.data

    // Check if slug is unique
    const existing = await db`
      SELECT id FROM templates WHERE slug = ${data.slug} LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists. Please use a different one.' },
        { status: 409 }
      )
    }

    // Create template
    const template = await db`
      INSERT INTO templates (
        name,
        slug,
        contributor_id,
        category,
        price,
        status,
        type,
        preview_image,
        description,
        requires_custom_domain
      ) VALUES (
        ${data.name},
        ${data.slug},
        ${session.user.id},
        ${data.category},
        ${data.price},
        ${data.status},
        ${data.type},
        ${data.preview_image || null},
        ${data.description || null},
        ${data.requires_custom_domain}
      )
      RETURNING *
    `.then((rows: any[]) => rows[0])

    return NextResponse.json({
      success: true,
      message: 'Template created successfully',
      data: template,
    })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
