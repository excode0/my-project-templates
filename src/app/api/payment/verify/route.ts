import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  getTransactionStatus,
  parsePaymentStatus,
} from '@/lib/payment/midtrans'
import { fulfillPurchase, findPurchaseByOrderId } from '@/lib/purchases/service'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

const VerifySchema = z.object({
  orderId: z.string().min(1),
})

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

/**
 * POST /api/payment/verify
 * Reconcile a purchase with Midtrans (used by the callback page as a fallback
 * when the webhook cannot reach the server, e.g. during local development).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json().catch(() => null)
    const validation = VerifySchema.safeParse(body)

    if (!validation.success) {
      return errorResponse('Order ID is required')
    }

    const { orderId } = validation.data
    const purchase = await findPurchaseByOrderId(orderId)

    if (!purchase) {
      return errorResponse('Purchase not found', 404)
    }

    const isOwner = purchase.user_id === session.user.id
    const isAdmin =
      session.user.role === 'admin' || session.user.role === 'super_admin'

    if (!isOwner && !isAdmin) {
      return errorResponse('Forbidden', 403)
    }

    let status = purchase.status

    if (!['completed', 'active', 'refunded'].includes(purchase.status)) {
      if ((process.env.PAYMENT_MODE || 'mock').toLowerCase() === 'midtrans') {
        try {
          const transaction = await getTransactionStatus(orderId)
          status = parsePaymentStatus(
            transaction.transaction_status,
            transaction.fraud_status
          )
        } catch (error) {
          logger.error(
            'Failed to verify Midtrans transaction',
            error instanceof Error ? error : new Error(String(error))
          )
          return errorResponse(
            'Unable to verify payment status right now. Please try again.',
            502
          )
        }
      } else {
        status = 'completed'
      }
    }

    if (status === 'completed') {
      const result = await fulfillPurchase(purchase.id)

      return NextResponse.json({
        success: true,
        data: {
          status: 'completed',
          purchase: {
            id: result.purchase.id,
            status: result.purchase.status,
            totalPrice: Number(result.purchase.total_price) || 0,
            purchasedAt: result.purchase.purchased_at,
          },
          template: {
            id: purchase.template_id,
            name: purchase.template_name,
            slug: purchase.template_slug,
          },
          instance: result.instance
            ? {
                id: result.instance.id,
                subdomain: result.instance.subdomain,
                customDomain: result.instance.custom_domain || null,
                status: result.instance.status,
              }
            : null,
        },
      })
    }

    if (status !== purchase.status) {
      await db`
        UPDATE template_purchases
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${purchase.id}
      `
    }

    return NextResponse.json({
      success: true,
      data: {
        status,
        purchase: {
          id: purchase.id,
          status,
          totalPrice: Number(purchase.total_price) || 0,
          purchasedAt: purchase.purchased_at,
        },
        template: {
          id: purchase.template_id,
          name: purchase.template_name,
          slug: purchase.template_slug,
        },
        instance: null,
      },
    })
  } catch (error) {
    logger.error(
      'Payment verification error',
      error instanceof Error ? error : new Error(String(error))
    )
    return errorResponse('Failed to verify payment', 500)
  }
}
