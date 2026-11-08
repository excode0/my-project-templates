import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { verifyDomainOwnership } from '@/lib/engines/domain-engine'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/domains/[id]/status
 * Get domain verification status and check again
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    // Get domain record
    const domain = await db`
      SELECT 
        d.id,
        d.domain,
        d.status,
        d.verification_token,
        d.verified_at,
        d.updated_at
      FROM domains d
      WHERE d.id = ${id}
      LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Domain not found' },
        { status: 404 }
      )
    }

    // If already verified, return status
    if (domain.status === 'verified') {
      return NextResponse.json({
        success: true,
        data: {
          domain: domain.domain,
          status: 'verified',
          verifiedAt: domain.verified_at,
        },
      })
    }

    // Check verification again
    const verificationResult = await verifyDomainOwnership(
      domain.domain,
      domain.verification_token
    )

    // Update status if verified
    if (verificationResult.verified) {
      await db`
        UPDATE domains
        SET 
          status = 'verified',
          verified_at = NOW(),
          updated_at = NOW()
        WHERE id = ${id}
      `

      return NextResponse.json({
        success: true,
        data: {
          domain: domain.domain,
          status: 'verified',
          verifiedAt: new Date(),
        },
      })
    }

    // Still pending
    return NextResponse.json({
      success: true,
      data: {
        domain: domain.domain,
        status: 'pending',
        verificationToken: domain.verification_token,
        txtRecord: {
          name: `_verification.${domain.domain}`,
          value: domain.verification_token,
        },
        errors: verificationResult.errors,
      },
    })
  } catch (error) {
    console.error('Error checking domain status:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
