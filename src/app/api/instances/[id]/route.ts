import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth/roles'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/instances/[id]
 * Get single template instance
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const instance = await db`
      SELECT 
        ti.*,
        t.name as template_name,
        t.slug as template_slug,
        t.preview_image,
        t.category
      FROM template_instances ti
      JOIN templates t ON t.id = ti.template_id
      WHERE ti.id = ${id}
      LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (!instance) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template instance not found',
        },
        { status: 404 }
      )
    }

    if (
      instance.user_id !== session.user.id &&
      !isAdminRole(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: instance,
    })
  } catch (error) {
    console.error('Error fetching instance:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/instances/[id]
 * Delete template instance
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const owner = await db`
      SELECT user_id FROM template_instances WHERE id = ${id} LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (!owner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template instance not found',
        },
        { status: 404 }
      )
    }

    if (owner.user_id !== session.user.id && !isAdminRole(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const deleted = await db`
      DELETE FROM template_instances
      WHERE id = ${id}
      RETURNING id
    `.then((rows: any[]) => rows[0])

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template instance not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Template instance deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting instance:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/instances/[id]
 * Update template instance (status, domain, etc)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const owner = await db`
      SELECT user_id FROM template_instances WHERE id = ${id} LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (!owner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template instance not found',
        },
        { status: 404 }
      )
    }

    if (owner.user_id !== session.user.id && !isAdminRole(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { status, custom_domain, subdomain } = body

    // Build update query dynamically
    const updates: any = {}
    if (status) updates.status = status
    if (custom_domain !== undefined) updates.custom_domain = custom_domain
    if (subdomain) updates.subdomain = subdomain

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No fields to update',
        },
        { status: 400 }
      )
    }

    const updated = await db`
      UPDATE template_instances
      SET 
        ${db(updates)},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `.then((rows: any[]) => rows[0])

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template instance not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error('Error updating instance:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
