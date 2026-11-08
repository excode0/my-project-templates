import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyDomainOwnership, generateVerificationToken } from '@/lib/engines/domain-engine'

const VerifyDomainSchema = z.object({
  instanceId: z.string().uuid(),
  domain: z.string().min(3).max(255),
})

/**
 * POST /api/domains/verify
 * Initiate or verify domain ownership
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = VerifyDomainSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { instanceId, domain } = validation.data

    // Check if instance exists and belongs to user
    const instance = await db`
      SELECT id, user_id, custom_domain
      FROM template_instances
      WHERE id = ${instanceId}
      LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (!instance) {
      return NextResponse.json(
        { success: false, error: 'Instance not found' },
        { status: 404 }
      )
    }

    // Check if domain is already in use by another instance
    const existingDomain = await db`
      SELECT id
      FROM template_instances
      WHERE custom_domain = ${domain}
      AND id != ${instanceId}
      LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (existingDomain) {
      return NextResponse.json(
        { success: false, error: 'Domain already in use' },
        { status: 409 }
      )
    }

    // Generate verification token
    const verificationToken = generateVerificationToken(instanceId)

    // Check if domain record exists
    let domainRecord = await db`
      SELECT id, status, verification_token
      FROM domains
      WHERE domain = ${domain}
      LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (!domainRecord) {
      // Create new domain record
      domainRecord = await db`
        INSERT INTO domains (
          user_id,
          domain,
          status,
          dns_records,
          verification_token
        ) VALUES (
          ${instance.user_id},
          ${domain},
          'pending',
          ${db.json({ verification_token: verificationToken })},
          ${verificationToken}
        )
        RETURNING id, domain, status, verification_token
      `.then((rows: any[]) => rows[0])

      return NextResponse.json({
        success: true,
        message: 'Domain created. Please add TXT record to verify ownership.',
        data: {
          domain: domainRecord.domain,
          status: domainRecord.status,
          verificationToken,
          txtRecord: {
            name: `_verification.${domain}`,
            value: verificationToken,
          },
        },
      })
    }

    // Domain record exists, check verification
    const verificationResult = await verifyDomainOwnership(
      domain,
      domainRecord.verification_token
    )

    if (verificationResult.verified) {
      // Update domain status
      await db`
        UPDATE domains
        SET 
          status = 'verified',
          verified_at = NOW()
        WHERE id = ${domainRecord.id}
      `

      // Update instance with custom domain
      await db`
        UPDATE template_instances
        SET custom_domain = ${domain}
        WHERE id = ${instanceId}
      `

      return NextResponse.json({
        success: true,
        message: 'Domain verified successfully!',
        data: {
          domain,
          status: 'verified',
          verifiedAt: new Date(),
        },
      })
    }

    // Not verified yet
    return NextResponse.json({
      success: false,
      message: 'Domain not verified. Please ensure TXT record is set correctly.',
      data: {
        domain,
        status: 'pending',
        verificationToken: domainRecord.verification_token,
        txtRecord: {
          name: `_verification.${domain}`,
          value: domainRecord.verification_token,
        },
        errors: verificationResult.errors,
      },
    })
  } catch (error) {
    console.error('Error verifying domain:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
