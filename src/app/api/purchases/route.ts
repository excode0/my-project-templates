import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth/roles'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email/mailer'
import { logger } from '@/lib/logger'
import { fulfillPurchase, getDomainPrice } from '@/lib/purchases/service'

export const runtime = 'nodejs'

const PurchaseSchema = z.object({
  templateId: z.string().uuid('Invalid template id'),
  domainOption: z.enum(['subdomain', 'custom']).optional(),
  customDomain: z.string().trim().min(3).max(255).optional().nullable(),
  paymentMethod: z.string().max(50).optional(),
})

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

/**
 * POST /api/purchases
 * Create a purchase and immediately provision the template instance.
 * Used for free templates and manual/offline payments.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json().catch(() => null)
    const validation = PurchaseSchema.safeParse(body)

    if (!validation.success) {
      return errorResponse(
        validation.error.errors[0]?.message || 'Invalid request data'
      )
    }

    const { templateId, domainOption, customDomain, paymentMethod } =
      validation.data

    if (domainOption === 'custom' && !customDomain) {
      return errorResponse('Custom domain is required')
    }

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

    const templatePrice = Number(template.price) || 0

    if (templatePrice > 0 && !isAdminRole(session.user.role)) {
      return errorResponse(
        'Paid templates must be purchased through the checkout flow.'
      )
    }

    const domainPrice =
      domainOption === 'custom' ? getDomainPrice(customDomain) : 0
    const totalPrice = templatePrice + domainPrice
    const domain = domainOption === 'custom' ? customDomain || null : null

    let purchaseId: string

    if (existing) {
      purchaseId = existing.id
      await db`
        UPDATE template_purchases
        SET
          domain = ${domain},
          domain_price = ${domainPrice},
          template_price = ${templatePrice},
          total_price = ${totalPrice},
          payment_method = ${paymentMethod || 'manual'},
          updated_at = NOW()
        WHERE id = ${purchaseId}
      `
    } else {
      purchaseId = await db`
        INSERT INTO template_purchases (
          user_id,
          template_id,
          domain,
          domain_price,
          template_price,
          total_price,
          payment_method,
          status
        ) VALUES (
          ${session.user.id},
          ${templateId},
          ${domain},
          ${domainPrice},
          ${templatePrice},
          ${totalPrice},
          ${paymentMethod || 'manual'},
          'pending'
        )
        RETURNING id
      `.then((rows: any[]) => rows[0]?.id)
    }

    const result = await fulfillPurchase(purchaseId)

    // Notify the buyer and contributor without blocking the response.
    if (session.user.email) {
      sendEmail({
        to: session.user.email,
        subject: `Purchase Confirmation: ${template.name}`,
        template: 'purchase',
        data: {
          userName: session.user.email.split('@')[0] || 'User',
          templateName: template.name,
          price: totalPrice,
          subdomain: result.instance?.subdomain,
          customDomain: result.instance?.custom_domain || null,
          instanceId: result.instance?.id,
        },
      }).catch((error) => logger.error('Failed to send purchase email', error))
    }

    const contributor = await db`
      SELECT email FROM users WHERE id = ${template.contributor_id} LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (contributor?.email && templatePrice > 0) {
      const feePercent = Number(process.env.PLATFORM_FEE_PERCENTAGE || '30')
      const platformFee = Math.floor((templatePrice * feePercent) / 100)

      sendEmail({
        to: contributor.email,
        subject: `New Sale: ${template.name}`,
        template: 'earnings',
        data: {
          templateName: template.name,
          amount: templatePrice - platformFee,
          buyerEmail: session.user.email,
          purchaseDate: new Date().toLocaleDateString('id-ID'),
        },
      }).catch((error) => logger.error('Failed to send earnings email', error))
    }

    return NextResponse.json({
      success: true,
      data: {
        purchase: {
          id: result.purchase.id,
          status: result.purchase.status,
          totalPrice: Number(result.purchase.total_price) || totalPrice,
          purchasedAt: result.purchase.purchased_at,
        },
        instance: result.instance
          ? {
              id: result.instance.id,
              subdomain: result.instance.subdomain,
              customDomain: result.instance.custom_domain || null,
              status: result.instance.status,
            }
          : null,
        instanceId: result.instance?.id || null,
        template: {
          id: template.id,
          name: template.name,
          slug: template.slug,
        },
      },
    })
  } catch (error: any) {
    logger.error('Purchase failed', error)
    return errorResponse(error?.message || 'Purchase failed. Please try again.', 500)
  }
}

/**
 * GET /api/purchases
 * Purchase history for the current user (camelCase for the UI).
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    const rows = await db`
      SELECT
        tp.id,
        tp.status,
        tp.domain,
        tp.domain_price,
        tp.template_price,
        tp.total_price,
        tp.payment_method,
        tp.purchased_at,
        t.id AS template_id,
        t.name AS template_name,
        t.slug AS template_slug,
        t.category AS template_category,
        t.preview_image AS template_image,
        t.demo_url AS template_demo_url,
        ti.id AS instance_id,
        ti.subdomain,
        ti.custom_domain,
        ti.status AS instance_status
      FROM template_purchases tp
      JOIN templates t ON t.id = tp.template_id
      LEFT JOIN template_instances ti ON ti.purchase_id = tp.id
      WHERE tp.user_id = ${session.user.id}
      ORDER BY tp.purchased_at DESC
    `

    const data = rows.map((row: any) => ({
      purchaseId: row.id,
      status: row.status,
      price: Number(row.total_price) || 0,
      templatePrice: Number(row.template_price) || 0,
      domainPrice: Number(row.domain_price) || 0,
      domain: row.domain,
      paymentMethod: row.payment_method || 'manual',
      purchasedAt: row.purchased_at,
      template: {
        id: row.template_id,
        name: row.template_name,
        slug: row.template_slug,
        category: row.template_category,
        previewImage: row.template_image,
        demoUrl: row.template_demo_url,
      },
      instance: row.instance_id
        ? {
            id: row.instance_id,
            subdomain: row.subdomain,
            customDomain: row.custom_domain,
            status: row.instance_status,
          }
        : null,
    }))

    return NextResponse.json({
      success: true,
      data,
      meta: { total: data.length },
    })
  } catch (error) {
    logger.error(
      'Failed to fetch purchases',
      error instanceof Error ? error : new Error(String(error))
    )
    return errorResponse('Failed to fetch purchases', 500)
  }
}
