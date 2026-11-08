import { db } from '@/lib/db'
import { AppError } from '@/lib/errors/AppError'
import {
  buildDefaultConfig,
  mergeConfig,
} from '@/lib/engines/template-engine/config'
import type { TemplateConfig } from '@/types'

export interface PurchaseTemplate {
  slug: string
  name: string
  description?: string | null
  features?: unknown
  config?: unknown
}

async function loadManifest(slug: string): Promise<{
  manifest: any
  isGeneric: boolean
}> {
  try {
    const manifestModule = await import(`@/templates/${slug}/manifest.json`)
    return { manifest: manifestModule.default, isGeneric: false }
  } catch {
    const genericModule = await import('@/templates/generic/manifest.json')
    return { manifest: genericModule.default, isGeneric: true }
  }
}

/**
 * Build the initial editor config for a template. Templates without a
 * hardcoded folder use the universal generic template populated with the
 * template's name, description and features.
 */
export async function buildInitialConfig(
  template: PurchaseTemplate
): Promise<TemplateConfig> {
  const { manifest, isGeneric } = await loadManifest(template.slug)
  const config = buildDefaultConfig(manifest)

  if (isGeneric) {
    config.slots['content.eyebrow'] = String(
      template.name || 'TEMPLATE'
    ).toUpperCase()
    config.slots['content.title'] = template.name
    config.slots['content.subtitle'] = template.description || ''
    config.slots['content.description'] = template.description || ''
    if (Array.isArray(template.features)) {
      config.slots['content.features'] = template.features
    }
  }

  // Values shaped by the super admin in the template editor win over the
  // manifest defaults, so every new site starts from the designed template.
  return mergeConfig(config, template.config)
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)

  return slug || 'site'
}

export async function generateUniqueSubdomain(
  tx: any,
  base: string
): Promise<string> {
  let candidate = base
  let suffix = 1

  for (;;) {
    const existing = await tx`
      SELECT id FROM template_instances WHERE subdomain = ${candidate} LIMIT 1
    `
    if (existing.length === 0) {
      return candidate
    }
    candidate = `${base}-${suffix++}`.slice(0, 60)
  }
}

export interface FulfillResult {
  purchase: any
  instance: any | null
  alreadyFulfilled: boolean
}

/**
 * Mark a purchase as completed and create the template instance + earnings.
 * Safe to call multiple times (idempotent).
 */
export async function fulfillPurchase(
  purchaseId: string
): Promise<FulfillResult> {
  return db.begin(async (tx: any) => {
    const purchase = await tx`
      SELECT
        tp.*,
        t.name AS template_name,
        t.slug AS template_slug,
        t.description AS template_description,
        t.features AS template_features,
        t.config AS template_config,
        t.contributor_id,
        u.email AS user_email,
        u.username AS user_name
      FROM template_purchases tp
      JOIN templates t ON t.id = tp.template_id
      JOIN users u ON u.id = tp.user_id
      WHERE tp.id = ${purchaseId}
      LIMIT 1
      FOR UPDATE OF tp
    `.then((rows: any[]) => rows[0])

    if (!purchase) {
      throw new AppError('Purchase not found', 404)
    }

    const existingInstance = await tx`
      SELECT id, subdomain, custom_domain, status
      FROM template_instances
      WHERE purchase_id = ${purchaseId}
      LIMIT 1
    `.then((rows: any[]) => rows[0])

    if (
      purchase.status === 'completed' ||
      purchase.status === 'active'
    ) {
      return {
        purchase,
        instance: existingInstance || null,
        alreadyFulfilled: true,
      }
    }

    const config = await buildInitialConfig({
      slug: purchase.template_slug,
      name: purchase.template_name,
      description: purchase.template_description,
      features: purchase.template_features,
      config: purchase.template_config,
    })

    const username =
      purchase.user_name ||
      String(purchase.user_email || 'user').split('@')[0] ||
      'user'
    const base = slugify(`${username}-${purchase.template_slug}`)
    const subdomain =
      existingInstance?.subdomain ||
      (await generateUniqueSubdomain(tx, base))

    let instance = existingInstance

    if (!instance) {
      instance = await tx`
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
          ${purchase.user_id},
          ${purchase.template_id},
          ${purchase.domain || null},
          ${subdomain},
          ${db.json(config)},
          'active'
        )
        RETURNING id, subdomain, custom_domain, status
      `.then((rows: any[]) => rows[0])
    }

    const templatePrice = Number(purchase.template_price) || 0

    if (templatePrice > 0 && purchase.contributor_id) {
      const feePercent = Number(
        process.env.PLATFORM_FEE_PERCENTAGE || '30'
      )
      const platformFee = Math.floor((templatePrice * feePercent) / 100)
      const netAmount = templatePrice - platformFee

      await tx`
        INSERT INTO earnings (
          contributor_id,
          template_id,
          purchase_id,
          amount,
          platform_fee,
          net_amount,
          status
        )
        SELECT
          ${purchase.contributor_id},
          ${purchase.template_id},
          ${purchaseId},
          ${templatePrice},
          ${platformFee},
          ${netAmount},
          'pending'
        WHERE NOT EXISTS (
          SELECT 1 FROM earnings WHERE purchase_id = ${purchaseId}
        )
      `
    }

    const updated = await tx`
      UPDATE template_purchases
      SET
        status = 'completed',
        paid_at = COALESCE(paid_at, NOW()),
        updated_at = NOW()
      WHERE id = ${purchaseId}
      RETURNING *
    `.then((rows: any[]) => rows[0])

    return {
      purchase: updated,
      instance,
      alreadyFulfilled: false,
    }
  })
}

/**
 * Find a purchase by its payment order id.
 */
export async function findPurchaseByOrderId(orderId: string) {
  return db`
    SELECT tp.*, t.name AS template_name, t.slug AS template_slug,
           u.email AS user_email, u.username AS user_name
    FROM template_purchases tp
    JOIN templates t ON t.id = tp.template_id
    JOIN users u ON u.id = tp.user_id
    WHERE tp.order_id = ${orderId}
    LIMIT 1
  `.then((rows: any[]) => rows[0])
}

/**
 * Calculate the custom-domain price based on its TLD.
 */
export function getDomainPrice(domain?: string | null): number {
  if (!domain) return 0

  const tld = domain.split('.').pop()?.toLowerCase() || ''

  if (['com', 'net', 'org'].includes(tld)) return 150000
  if (['id', 'co.id', 'ac.id', 'sch.id'].includes(tld)) return 200000

  return 100000
}
