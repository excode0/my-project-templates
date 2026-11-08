import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/instances/[id]/domains
 * Get all domains associated with an instance
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // Verify instance exists
    const instance = await db`
      SELECT id, user_id, custom_domain, subdomain
      FROM template_instances
      WHERE id = ${id}
      LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (!instance) {
      return NextResponse.json(
        { success: false, error: 'Instance not found' },
        { status: 404 }
      )
    }

    // Get all domains for this instance's user
    // (in case they want to switch between domains)
    const domains = await db`
      SELECT 
        id,
        domain,
        status,
        verification_token,
        verified_at,
        created_at
      FROM domains
      WHERE user_id = (SELECT user_id FROM template_instances WHERE id = ${id})
      ORDER BY created_at DESC
    `.then((rows: any[]) => rows)

    return NextResponse.json({
      success: true,
      data: {
        currentDomain: instance.custom_domain,
        subdomain: instance.subdomain,
        availableDomains: domains,
      },
    })
  } catch (error) {
    console.error('Error fetching instance domains:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
