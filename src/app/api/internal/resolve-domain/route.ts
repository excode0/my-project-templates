import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Internal API: Resolve domain/subdomain to instance ID
 * Called by middleware only
 */
export async function GET(request: NextRequest) {
  // Verify this is called from middleware
  const isMiddleware = request.headers.get('x-middleware-request') === 'true'
  if (!isMiddleware) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const domain = searchParams.get('domain')
  const subdomain = searchParams.get('subdomain')

  if (!domain && !subdomain) {
    return NextResponse.json({ error: 'Missing parameter' }, { status: 400 })
  }

  try {
    let instance

    if (domain) {
      // Resolve custom domain
      instance = await db`
        SELECT id, status
        FROM template_instances
        WHERE custom_domain = ${domain}
        AND status = 'active'
        LIMIT 1
      `.then((rows: any[]) => rows[0])
    } else if (subdomain) {
      // Resolve subdomain
      instance = await db`
        SELECT id, status
        FROM template_instances
        WHERE subdomain = ${subdomain}
        AND status = 'active'
        LIMIT 1
      `.then((rows: any[]) => rows[0])
    }

    if (!instance) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({
      instanceId: instance.id,
      status: instance.status,
    })
  } catch (error) {
    console.error('Error resolving domain:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
