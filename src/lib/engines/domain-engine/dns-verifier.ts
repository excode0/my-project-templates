import { promises as dns } from 'dns'
import type { DomainVerificationResult, DNSRecord } from './types'

/**
 * Verify domain ownership via DNS TXT record
 */
export async function verifyDomainOwnership(
  domain: string,
  expectedTxtValue: string
): Promise<DomainVerificationResult> {
  try {
    console.log(`Verifying domain: ${domain}`)
    console.log(`Expected TXT: ${expectedTxtValue}`)

    // Query DNS TXT records for _verification subdomain
    const verificationDomain = `_verification.${domain}`
    
    let txtRecords: string[] = []
    try {
      const records = await dns.resolveTxt(verificationDomain)
      // Flatten array of arrays into single array of strings
      txtRecords = records.flat()
    } catch (error: any) {
      // DNS lookup might fail if record doesn't exist yet
      if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
        return {
          verified: false,
          records: [],
          errors: [`TXT record not found at ${verificationDomain}. Please add the verification record to your DNS settings.`],
        }
      }
      throw error
    }

    console.log(`Found TXT records:`, txtRecords)

    // Check if our verification token exists in the records
    const verified = txtRecords.some(record => record === expectedTxtValue)

    const records: DNSRecord[] = txtRecords.map(value => ({
      type: 'TXT',
      name: verificationDomain,
      value,
    }))

    if (verified) {
      return {
        verified: true,
        records,
      }
    }

    return {
      verified: false,
      records,
      errors: [
        `Verification token not found in TXT records.`,
        `Expected: ${expectedTxtValue}`,
        `Found: ${txtRecords.join(', ') || 'none'}`,
      ],
    }
  } catch (error: any) {
    console.error('DNS verification error:', error)
    return {
      verified: false,
      records: [],
      errors: [`DNS lookup failed: ${error.message || error}`],
    }
  }
}

/**
 * Generate verification token for domain
 */
export function generateVerificationToken(instanceId: string): string {
  // Simple token generation
  // In production, use crypto.randomBytes or similar
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `template-verify-${instanceId}-${timestamp}-${random}`
}

/**
 * Get required DNS records for domain setup
 */
export function getRequiredDNSRecords(domain: string, targetIP?: string): DNSRecord[] {
  const records: DNSRecord[] = []

  // A record pointing to platform IP
  if (targetIP) {
    records.push({
      type: 'A',
      name: domain,
      value: targetIP,
      ttl: 3600,
    })
  }

  // CNAME record (alternative to A record)
  records.push({
    type: 'CNAME',
    name: domain,
    value: 'platform.yourdomain.com', // TODO: Replace with actual platform domain
    ttl: 3600,
  })

  return records
}

/**
 * Check if domain is available (not already in use)
 */
export async function isDomainAvailable(domain: string): Promise<boolean> {
  // This would check against database and potentially external DNS
  // For now, simple check
  
  try {
    const response = await fetch(`https://${domain}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    })
    
    // If domain responds, it's in use
    return false
  } catch {
    // If domain doesn't respond, it might be available
    // Should also check database
    return true
  }
}
