import type { SubdomainGenerationOptions } from './types'
import { slugify } from '@/lib/utils'

/**
 * Generate unique subdomain
 */
export function generateSubdomain(
  baseName: string,
  options: SubdomainGenerationOptions = {}
): string {
  const {
    prefix = '',
    maxLength = 63, // DNS label max length
    retries = 0,
  } = options

  // Slugify base name
  let subdomain = slugify(baseName)

  // Add prefix if provided
  if (prefix) {
    subdomain = `${prefix}-${subdomain}`
  }

  // Add random suffix for uniqueness if retries > 0
  if (retries > 0) {
    const suffix = Math.random().toString(36).substring(2, 6)
    subdomain = `${subdomain}-${suffix}`
  }

  // Ensure it doesn't exceed max length
  if (subdomain.length > maxLength) {
    subdomain = subdomain.substring(0, maxLength)
  }

  // Ensure it doesn't start or end with hyphen
  subdomain = subdomain.replace(/^-+|-+$/g, '')

  return subdomain.toLowerCase()
}

/**
 * Generate subdomain from template name
 */
export function generateFromTemplate(
  templateName: string,
  userName?: string
): string {
  if (userName) {
    return generateSubdomain(`${userName}-${templateName}`)
  }
  return generateSubdomain(templateName)
}

/**
 * Validate subdomain format
 */
export function isValidSubdomain(subdomain: string): boolean {
  // RFC 1123 subdomain rules:
  // - 1-63 characters
  // - Only alphanumeric and hyphens
  // - Cannot start or end with hyphen
  // - Case insensitive

  const regex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i
  return regex.test(subdomain)
}

/**
 * Generate multiple subdomain suggestions
 */
export function generateSuggestions(baseName: string, count: number = 5): string[] {
  const suggestions: string[] = []
  
  // First suggestion: just the base name
  suggestions.push(generateSubdomain(baseName))

  // Additional suggestions with variations
  for (let i = 1; i < count; i++) {
    suggestions.push(generateSubdomain(baseName, { retries: i }))
  }

  return suggestions
}
