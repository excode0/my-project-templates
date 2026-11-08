import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

/**
 * GET /api/purchases/check?templateId={id}
 * Check whether the current user already owns (or is paying for) a template.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('templateId')

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const purchase = await db`
      SELECT
        tp.id AS purchase_id,
        tp.status AS purchase_status,
        tp.purchased_at,
        ti.id AS instance_id,
        ti.subdomain,
        ti.custom_domain,
        ti.status AS instance_status
      FROM template_purchases tp
      LEFT JOIN template_instances ti ON ti.purchase_id = tp.id
      WHERE tp.user_id = ${session.user.id}
        AND tp.template_id = ${templateId}
      ORDER BY tp.purchased_at DESC
      LIMIT 1
    `.then((rows: any[]) => rows[0])

    const owned =
      !!purchase && ['completed', 'active'].includes(purchase.purchase_status)
    const pendingPayment =
      !!purchase &&
      purchase.purchase_status === 'pending' &&
      !purchase.instance_id

    return NextResponse.json({
      success: true,
      data: {
        purchased: owned,
        pendingPayment,
        purchase: owned || pendingPayment
          ? {
              purchaseId: purchase.purchase_id,
              status: purchase.purchase_status,
              purchasedAt: purchase.purchased_at,
              instance: purchase.instance_id
                ? {
                    id: purchase.instance_id,
                    subdomain: purchase.subdomain,
                    customDomain: purchase.custom_domain,
                    status: purchase.instance_status,
                  }
                : null,
            }
          : null,
      },
    })
  } catch (error) {
    logger.error(
      'Failed to check purchase',
      error instanceof Error ? error : new Error(String(error))
    )
    return NextResponse.json(
      { success: false, error: 'Failed to check purchase' },
      { status: 500 }
    )
  }
}
