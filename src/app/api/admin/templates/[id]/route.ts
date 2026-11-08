import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth/roles'

const UpdateTemplateSchema = z.object({
  type: z.enum(['editor', 'hardcode']),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/admin/templates/[id]
 * Point an existing template at the visual editor (or back to hardcode).
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
    const body = await request.json().catch(() => null)
    const validation = UpdateTemplateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid template type' },
        { status: 400 }
      )
    }

    const updated = await db`
      UPDATE templates
      SET type = ${validation.data.type}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, name, slug, type, status
    `.then((rows: any[]) => rows[0])

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
