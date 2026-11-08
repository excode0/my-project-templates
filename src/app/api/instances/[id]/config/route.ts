import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth/roles'

const ConfigUpdateSchema = z.object({
  config: z.object({
    slots: z.record(z.any()),
    pages: z.array(z.object({
      slug: z.string(),
      enabled: z.boolean(),
      config: z.record(z.any()),
    })).optional(),
    theme: z.object({
      primaryColor: z.string().optional(),
      fontFamily: z.string().optional(),
    }).optional(),
  }),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * PATCH /api/instances/[id]/config
 * Update template instance configuration
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
        { success: false, error: 'Template instance not found' },
        { status: 404 }
      )
    }

    if (owner.user_id !== session.user.id && !isAdminRole(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Validate request body
    const validation = ConfigUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid config format',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { config } = validation.data

    // Update config in database
    const updated = await db`
      UPDATE template_instances
      SET 
        config = ${db.json(config)},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, config, updated_at
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
      data: {
        id: updated.id,
        config: updated.config,
        updated_at: updated.updated_at,
      },
    })
  } catch (error) {
    console.error('Error updating instance config:', error)
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
 * GET /api/instances/[id]/config
 * Get template instance configuration
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
      SELECT id, user_id, config, updated_at
      FROM template_instances
      WHERE id = ${id}
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
      data: {
        id: instance.id,
        config: instance.config,
        updated_at: instance.updated_at,
      },
    })
  } catch (error) {
    console.error('Error fetching instance config:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
