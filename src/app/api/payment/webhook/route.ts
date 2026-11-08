import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifySignature, parsePaymentStatus } from '@/lib/payment/midtrans'
import {
  sendPurchaseConfirmation,
  sendEarningsNotification,
} from '@/lib/payment/email'
import {
  fulfillPurchase,
  findPurchaseByOrderId,
} from '@/lib/purchases/service'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

/**
 * POST /api/payment/webhook
 * Public endpoint called by Midtrans when a transaction status changes.
 */
export async function POST(request: Request) {
  try {
    const notification = await request.json().catch(() => null)

    if (!notification?.order_id) {
      return NextResponse.json(
        { success: false, error: 'Invalid notification' },
        { status: 400 }
      )
    }

    if (!verifySignature(notification)) {
      logger.warn('Invalid Midtrans webhook signature', {
        orderId: notification.order_id,
      })
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const purchase = await findPurchaseByOrderId(notification.order_id)

    if (!purchase) {
      return NextResponse.json(
        { success: false, error: 'Purchase not found' },
        { status: 404 }
      )
    }

    const status = parsePaymentStatus(
      notification.transaction_status,
      notification.fraud_status
    )

    if (status === 'completed') {
      const result = await fulfillPurchase(purchase.id)

      if (!result.alreadyFulfilled && result.instance) {
        const templatePrice = Number(purchase.template_price) || 0
        const feePercent = Number(process.env.PLATFORM_FEE_PERCENTAGE || '30')
        const platformFee = Math.floor((templatePrice * feePercent) / 100)

        const contributor = await db`
          SELECT email, username FROM users WHERE id = ${purchase.contributor_id} LIMIT 1
        `.then((rows: any[]) => rows[0])

        Promise.all([
          sendPurchaseConfirmation({
            to: purchase.user_email,
            userName: purchase.user_name || 'User',
            templateName: purchase.template_name,
            price: templatePrice,
            orderId: notification.order_id,
            instanceId: result.instance.id,
          }),
          contributor?.email
            ? sendEarningsNotification({
                to: contributor.email,
                contributorName: contributor.username || 'Contributor',
                templateName: purchase.template_name,
                grossAmount: templatePrice,
                platformFee,
                netAmount: templatePrice - platformFee,
                orderId: notification.order_id,
              })
            : Promise.resolve(),
        ]).catch((error) =>
          logger.error('Failed to send payment notification emails', error)
        )
      }
    } else {
      await db`
        UPDATE template_purchases
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${purchase.id}
      `
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' })
  } catch (error) {
    logger.error(
      'Midtrans webhook error',
      error instanceof Error ? error : new Error(String(error))
    )
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
