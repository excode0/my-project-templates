/**
 * Purchase Repository
 * Handles all database operations related to template purchases
 */

import { BaseRepository } from './base.repository'
import type { TemplatePurchase, TemplatePurchaseRow } from '../types'

export class PurchaseRepository extends BaseRepository {
  /**
   * Transform database row to application model
   */
  private transformRow(row: any): TemplatePurchase {
    return {
      id: row.id,
      userId: row.user_id,
      templateId: row.template_id,
      pricePaid: this.parseDecimal(row.price_paid),
      paymentStatus: row.payment_status,
      stripePaymentIntentId: row.stripe_payment_intent_id,
      createdAt: this.toISOString(row.created_at)!,
    }
  }

  /**
   * Find purchase by ID
   */
  async findById(id: string): Promise<TemplatePurchase | null> {
    const result = await this.sql`
      SELECT * FROM template_purchases
      WHERE id = ${id}
    `
    
    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  /**
   * Find purchase by user and template
   */
  async findByUserAndTemplate(
    userId: string,
    templateId: string
  ): Promise<TemplatePurchase | null> {
    const result = await this.sql`
      SELECT * FROM template_purchases
      WHERE user_id = ${userId} AND template_id = ${templateId}
    `
    
    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  /**
   * Check if user has purchased template
   */
  async hasPurchased(userId: string, templateId: string): Promise<boolean> {
    const result = await this.sql`
      SELECT COUNT(*) as count FROM template_purchases
      WHERE user_id = ${userId} AND template_id = ${templateId}
    `

    return Number(result[0]?.count || 0) > 0
  }

  /**
   * Find all purchases by user
   */
  async findByUserId(userId: string): Promise<any[]> {
    const result = await this.sql`
      SELECT 
        tp.id,
        tp.user_id,
        tp.template_id,
        tp.price_paid,
        tp.payment_status,
        tp.created_at,
        t.name as template_name,
        t.slug as template_slug,
        t.preview_image as template_preview,
        ti.subdomain,
        ti.custom_domain,
        ti.status as instance_status
      FROM template_purchases tp
      JOIN templates t ON tp.template_id = t.id
      LEFT JOIN template_instances ti ON tp.id = ti.purchase_id
      WHERE tp.user_id = ${userId}
      ORDER BY tp.created_at DESC
    `

    return result.map(row => ({
      id: row.id,
      userId: row.user_id,
      templateId: row.template_id,
      pricePaid: this.parseDecimal(row.price_paid),
      paymentStatus: row.payment_status,
      createdAt: this.toISOString(row.created_at)!,
      template: {
        name: row.template_name,
        slug: row.template_slug,
        previewImage: row.template_preview,
      },
      instance: row.subdomain ? {
        subdomain: row.subdomain,
        customDomain: row.custom_domain,
        status: row.instance_status,
      } : null,
    }))
  }

  /**
   * Create purchase
   */
  async create(data: {
    userId: string
    templateId: string
    pricePaid: number
    paymentStatus: string
    stripePaymentIntentId?: string
  }): Promise<TemplatePurchase> {
    const result = await this.sql`
      INSERT INTO template_purchases (
        user_id, template_id, price_paid, payment_status, stripe_payment_intent_id
      )
      VALUES (
        ${data.userId}, 
        ${data.templateId}, 
        ${data.pricePaid}, 
        ${data.paymentStatus},
        ${data.stripePaymentIntentId || null}
      )
      RETURNING *
    `

    return this.transformRow(result[0])
  }

  /**
   * Update purchase status
   */
  async updateStatus(
    id: string,
    status: string,
    stripePaymentIntentId?: string
  ): Promise<TemplatePurchase | null> {
    const result = await this.sql`
      UPDATE template_purchases
      SET 
        payment_status = ${status},
        stripe_payment_intent_id = ${stripePaymentIntentId || this.sql`stripe_payment_intent_id`},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  /**
   * Get total revenue (for admin/contributor)
   */
  async getTotalRevenue(contributorId?: string): Promise<number> {
    let result
    
    if (contributorId) {
      result = await this.sql`
        SELECT COALESCE(SUM(tp.price_paid), 0) as total
        FROM template_purchases tp
        JOIN templates t ON tp.template_id = t.id
        WHERE t.contributor_id = ${contributorId} 
          AND tp.payment_status = 'succeeded'
      `
    } else {
      result = await this.sql`
        SELECT COALESCE(SUM(price_paid), 0) as total
        FROM template_purchases
        WHERE payment_status = 'succeeded'
      `
    }

    return this.parseDecimal(result[0]?.total || 0)
  }

  /**
   * Get purchase count for template
   */
  async getTemplateCount(templateId: string): Promise<number> {
    const result = await this.sql`
      SELECT COUNT(*) as count
      FROM template_purchases
      WHERE template_id = ${templateId}
    `

    return Number(result[0]?.count || 0)
  }

  /**
   * Get recent purchases (for admin)
   */
  async getRecent(limit: number = 10): Promise<any[]> {
    const result = await this.sql`
      SELECT 
        tp.*,
        t.name as template_name,
        t.slug as template_slug,
        u.username,
        u.email
      FROM template_purchases tp
      JOIN templates t ON tp.template_id = t.id
      JOIN users u ON tp.user_id = u.id
      ORDER BY tp.created_at DESC
      LIMIT ${limit}
    `

    return result.map(row => ({
      ...this.transformRow(row),
      template: {
        name: row.template_name,
        slug: row.template_slug,
      },
      user: {
        username: row.username,
        email: row.email,
      },
    }))
  }
}
