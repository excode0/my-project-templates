import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createPaymentTransaction } from '@/lib/payment/midtrans'
import { fulfillPurchase } from '@/lib/purchases/service'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

const InitiateSchema = z.object({
  templateId: z.string().uuid('Invalid template id'),
})

function errorResponse(message: string, status = 400, extra?: object) {
  return NextResponse.json(
    { success: false, error: message, ...extra },
    { status }
  )
}

/**
 * POST /api/payment/initiate
 *
 * - PAYMENT_MODE=mock (default in development): provisions the instance
 *   immediately and returns a mock redirect.
 * - PAYMENT_MODE=midtrans: creates a pending purchase and a Snap token.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json().catch(() => null)
    const validation = InitiateSchema.safeParse(body)

    if (!validation.success) {
      return errorResponse(
        validation.error.errors[0]?.message || 'Invalid request data'
      )
    }

    const { templateId } = validation.data

    const template = await db`
      SELECT id, name, slug, price, status, contributor_id
      FROM templates
      WHERE id = ${templateId}
      LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (!template) {
      return errorResponse('Template not found', 404)
    }

    if (template.status !== 'approved' && template.status !== 'published') {
      return errorResponse('Template is not available for purchase', 400)
    }

    const price = Number(template.price) || 0

    if (price <= 0) {
      return errorResponse(
        'This template is free. Use the direct purchase endpoint instead.',
        400
      )
    }

    const existing = await db`
      SELECT id, status
      FROM template_purchases
      WHERE user_id = ${session.user.id} AND template_id = ${templateId}
      ORDER BY purchased_at DESC
      LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (existing && ['completed', 'active'].includes(existing.status)) {
      const instance = await db`
        SELECT id FROM template_instances WHERE purchase_id = ${existing.id} LIMIT 1
      `.then((rows: any[]) => rows[0])

      return NextResponse.json(
        {
          success: false,
          error: 'You already own this template',
          data: { instanceId: instance?.id || null },
        },
        { status: 409 }
      )
    }

    const orderId = `ORDER-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`

    let purchaseId: string

    if (existing) {
      purchaseId = existing.id
      await db`
        UPDATE template_purchases
        SET
          order_id = ${orderId},
          domain = NULL,
          domain_price = 0,
          template_price = ${price},
          total_price = ${price},
          payment_method = 'midtrans',
          status = 'pending',
          updated_at = NOW()
        WHERE id = ${purchaseId}
      `
    } else {
      purchaseId = await db`
        INSERT INTO template_purchases (
          user_id,
          template_id,
          order_id,
          domain_price,
          template_price,
          total_price,
          payment_method,
          status
        ) VALUES (
          ${session.user.id},
          ${templateId},
          ${orderId},
          ${0},
          ${price},
          ${price},
          'midtrans',
          'pending'
        )
        RETURNING id
      `.then((rows: any[]) => rows[0]?.id)
    }

    const paymentMode = (process.env.PAYMENT_MODE || 'mock').toLowerCase()

    if (paymentMode !== 'midtrans') {
      const result = await fulfillPurchase(purchaseId)

      return NextResponse.json({
        success: true,
        data: {
          mock: true,
          purchaseId,
          orderId,
          instanceId: result.instance?.id || null,
          token: null,
          redirectUrl: `/payment/callback?order_id=${encodeURIComponent(
            orderId
          )}&transaction_status=settlement`,
          template: {
            id: template.id,
            name: template.name,
            slug: template.slug,
            price,
          },
        },
      })
    }

    try {
      const user = await db`
        SELECT username, email FROM users WHERE id = ${session.user.id} LIMIT 1
      `.then((rows: any[]) => rows[0])

      const transaction = await createPaymentTransaction({
        orderId,
        grossAmount: price,
        items: [
          {
            id: template.id,
            price,
            quantity: 1,
            name: template.name.slice(0, 50),
          },
        ],
        customerDetails: {
          first_name: user?.username || 'User',
          email: user?.email || session.user.email || '',
        },
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
      })

      return NextResponse.json({
        success: true,
        data: {
          mock: false,
          purchaseId,
          orderId,
          token: transaction.token,
          redirectUrl: transaction.redirectUrl,
          template: {
            id: template.id,
            name: template.name,
            slug: template.slug,
            price,
          },
        },
      })
    } catch (paymentError) {
      logger.error(
        'Midtrans payment initiation failed',
        paymentError instanceof Error
          ? paymentError
          : new Error(String(paymentError))
      )

      await db`
        UPDATE template_purchases
        SET status = 'failed', updated_at = NOW()
        WHERE id = ${purchaseId}
      `

      return errorResponse(
        'Payment gateway is currently unavailable. Please try again later.',
        502
      )
    }
  } catch (error) {
    logger.error(
      'Payment initiation error',
      error instanceof Error ? error : new Error(String(error))
    )
    return errorResponse('Failed to initiate payment', 500)
  }
}
