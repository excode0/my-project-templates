import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth/roles'

const ConfigUpdateSchema = z.object({
  config: z.object({
    slots: z.record(z.any()),
    pages: z
      .array(
        z.object({
          slug: z.string(),
          enabled: z.boolean(),
          config: z.record(z.any()),
        })
      )
      .optional(),
    theme: z
      .object({
        primaryColor: z.string().optional(),
        fontFamily: z.string().optional(),
      })
      .optional(),
  }),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/admin/templates/[id]/config
 * Save the default visual editor values for a template.
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

    if (!isAdminRole(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

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

    const updated = await db`
      UPDATE templates
      SET
        config = ${db.json(validation.data.config)},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, name, config, updated_at
    `.then((rows: any[]) => rows[0])

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        config: updated.config,
        updated_at: updated.updated_at,
      },
    })
  } catch (error) {
    console.error('Error updating template config:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
