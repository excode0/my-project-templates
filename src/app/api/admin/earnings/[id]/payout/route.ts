import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { isAdminRole } from '@/lib/auth/roles'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const earning = await db`
      UPDATE earnings
      SET status = 'paid', paid_at = NOW()
      WHERE id = ${id} AND status = 'pending'
      RETURNING id, status, net_amount, paid_at
    `.then((rows: any[]) => rows[0])

    if (!earning) {
      return NextResponse.json(
        {
          success: false,
          error: 'Earning not found or already paid',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: earning })
  } catch (error) {
    logger.error(
      'Failed to mark earning as paid',
      error instanceof Error ? error : new Error(String(error))
    )
    return NextResponse.json(
      { success: false, error: 'Failed to update earning' },
      { status: 500 }
    )
  }
}
