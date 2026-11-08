import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth/roles'
import {
  buildInitialConfig,
  generateUniqueSubdomain,
  slugify,
} from '@/lib/purchases/service'

const CreateInstanceSchema = z.object({
  template_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  purchase_id: z.string().uuid().optional(),
  subdomain: z.string().optional(),
  custom_domain: z.string().optional().nullable(),
})

/**
 * GET /api/instances
 * List template instances. Admins can list all; users only their own.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get('user_id')
    const userId = isAdminRole(session.user.role)
      ? requestedUserId
      : session.user.id

    let instances

    if (userId) {
      instances = await db`
        SELECT 
          ti.id,
          ti.user_id,
          ti.template_id,
          ti.custom_domain,
          ti.subdomain,
          ti.status,
          ti.created_at,
          ti.updated_at,
          t.name as template_name,
          t.slug as template_slug,
          t.preview_image
        FROM template_instances ti
        JOIN templates t ON t.id = ti.template_id
        WHERE ti.user_id = ${userId}
        ORDER BY ti.created_at DESC
      `
    } else {
      instances = await db`
        SELECT 
          ti.id,
          ti.user_id,
          ti.template_id,
          ti.custom_domain,
          ti.subdomain,
          ti.status,
          ti.created_at,
          ti.updated_at,
          t.name as template_name,
          t.slug as template_slug,
          t.preview_image
        FROM template_instances ti
        JOIN templates t ON t.id = ti.template_id
        ORDER BY ti.created_at DESC
        LIMIT 100
      `
    }

    return NextResponse.json({
      success: true,
      data: instances,
    })
  } catch (error) {
    console.error('Error fetching instances:', error)
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
 * POST /api/instances
 * Create a new template instance for the current user.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const validation = CreateInstanceSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { template_id, user_id, subdomain, custom_domain } = validation.data

    const targetUserId =
      isAdminRole(session.user.role) && user_id ? user_id : session.user.id

    const template = await db`
      SELECT id, slug, name, description, features, config, price, status
      FROM templates
      WHERE id = ${template_id}
      LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    if (template.status !== 'approved' && template.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'Template is not available' },
        { status: 400 }
      )
    }

    const config = await buildInitialConfig({
      slug: template.slug,
      name: template.name,
      description: template.description,
      features: template.features,
      config: template.config,
    })

    // A paid/claimed purchase is required before an instance can be created.
    const purchase = await db`
      SELECT id FROM template_purchases
      WHERE user_id = ${targetUserId}
        AND template_id = ${template_id}
        AND status IN ('completed', 'active')
      ORDER BY purchased_at DESC
      LIMIT 1
    `.then((rows: any[]) => rows[0])

    let purchaseId = purchase?.id as string | undefined

    if (!purchaseId) {
      if (!isAdminRole(session.user.role)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Please purchase this template before creating a site.',
          },
          { status: 403 }
        )
      }

      // Admins may create a complimentary instance for testing/support.
      const price = Number(template.price) || 0
      purchaseId = await db`
        INSERT INTO template_purchases (
          user_id,
          template_id,
          template_price,
          total_price,
          payment_method,
          status,
          paid_at
        ) VALUES (
          ${targetUserId},
          ${template_id},
          ${price},
          ${price},
          'complimentary',
          'completed',
          NOW()
        )
        RETURNING id
      `.then((rows: any[]) => rows[0]?.id)
    }

    if (custom_domain) {
      const domainTaken = await db`
        SELECT id FROM template_instances WHERE custom_domain = ${custom_domain} LIMIT 1
      `.then((rows: any[]) => rows[0])

      if (domainTaken) {
        return NextResponse.json(
          { success: false, error: 'That custom domain is already in use.' },
          { status: 409 }
        )
      }
    }

    let finalSubdomain = subdomain

    if (finalSubdomain) {
      const taken = await db`
        SELECT id FROM template_instances WHERE subdomain = ${finalSubdomain} LIMIT 1
      `.then((rows: any[]) => rows[0])

      if (taken) {
        return NextResponse.json(
          { success: false, error: 'That subdomain is already in use.' },
          { status: 409 }
        )
      }
    } else {
      finalSubdomain = await generateUniqueSubdomain(
        db,
        slugify(`${session.user.email?.split('@')[0] || 'user'}-${template.slug}`)
      )
    }

    const instance = await db`
      INSERT INTO template_instances (
        purchase_id,
        user_id,
        template_id,
        custom_domain,
        subdomain,
        config,
        status
      ) VALUES (
        ${purchaseId},
        ${targetUserId},
        ${template_id},
        ${custom_domain || null},
        ${finalSubdomain},
        ${db.json(config)},
        'active'
      )
      RETURNING *
    `.then((rows: any[]) => rows[0])

    return NextResponse.json(
      {
        success: true,
        data: instance,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating instance:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
