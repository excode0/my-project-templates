import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth/roles'

type RouteContext = {
  params: Promise<{ slug: string }>
}

/**
 * GET /api/templates/[slug]
 * Get template by slug
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params

    const template = await db`
      SELECT * FROM templates WHERE slug = ${slug} LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: template,
    })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/templates/[slug]
 * Update template
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { slug } = await context.params

    // Get template
    const template = await db`
      SELECT * FROM templates WHERE slug = ${slug} LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    // Check ownership
    if (template.contributor_id !== session.user.id && !isAdminRole(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      category,
      price,
      description,
      preview_image,
      requires_custom_domain,
      status,
    } = body

    // Update template
    const updated = await db`
      UPDATE templates
      SET
        name = COALESCE(${name}, name),
        category = COALESCE(${category}, category),
        price = COALESCE(${price}, price),
        description = COALESCE(${description}, description),
        preview_image = COALESCE(${preview_image}, preview_image),
        requires_custom_domain = COALESCE(${requires_custom_domain}, requires_custom_domain),
        status = COALESCE(${status}, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${template.id}
      RETURNING *
    `.then((rows: any[]) => rows[0])

    return NextResponse.json({
      success: true,
      message: 'Template updated successfully',
      data: updated,
    })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/templates/[slug]
 * Delete template
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { slug } = await context.params

    // Get template
    const template = await db`
      SELECT * FROM templates WHERE slug = ${slug} LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    // Check ownership
    if (template.contributor_id !== session.user.id && !isAdminRole(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete template
    await db`
      DELETE FROM templates WHERE id = ${template.id}
    `

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
