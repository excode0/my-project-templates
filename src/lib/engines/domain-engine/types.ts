export interface DomainVerificationResult {
  verified: boolean
  records: DNSRecord[]
  errors?: string[]
}

export interface DNSRecord {
  type: 'A' | 'CNAME' | 'TXT'
  name: string
  value: string
  ttl?: number
}

export interface SubdomainGenerationOptions {
  prefix?: string
  maxLength?: number
  retries?: number
}

export interface DomainStatus {
  domain: string
  status: 'pending' | 'verified' | 'failed'
  verifiedAt?: Date
  lastChecked?: Date
  error?: string
}
