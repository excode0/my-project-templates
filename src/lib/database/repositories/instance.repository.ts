/**
 * Instance Repository
 * Handles all database operations related to template instances
 */

import { BaseRepository } from './base.repository'
import type { TemplateInstance, TemplateInstanceRow } from '../types'

export class InstanceRepository extends BaseRepository {
  /**
   * Transform database row to application model
   */
  private transformRow(row: any): TemplateInstance {
    return {
      id: row.id,
      purchaseId: row.purchase_id,
      userId: row.user_id,
      templateId: row.template_id,
      customDomain: row.custom_domain,
      subdomain: row.subdomain,
      config: row.config,
      status: row.status,
      createdAt: this.toISOString(row.created_at)!,
      updatedAt: this.toISOString(row.updated_at)!,
    }
  }

  /**
   * Find instance by ID
   */
  async findById(id: string): Promise<TemplateInstance | null> {
    const result = await this.sql`
      SELECT * FROM template_instances
      WHERE id = ${id}
    `
    
    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  /**
   * Find instance by subdomain
   */
  async findBySubdomain(subdomain: string): Promise<TemplateInstance | null> {
    const result = await this.sql`
      SELECT * FROM template_instances
      WHERE subdomain = ${subdomain}
    `
    
    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  /**
   * Find instance by custom domain
   */
  async findByCustomDomain(domain: string): Promise<TemplateInstance | null> {
    const result = await this.sql`
      SELECT * FROM template_instances
      WHERE custom_domain = ${domain}
    `
    
    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  /**
   * Find instance by purchase ID
   */
  async findByPurchaseId(purchaseId: string): Promise<TemplateInstance | null> {
    const result = await this.sql`
      SELECT * FROM template_instances
      WHERE purchase_id = ${purchaseId}
    `
    
    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  /**
   * Find all instances by user
   */
  async findByUserId(userId: string): Promise<TemplateInstance[]> {
    const result = await this.sql`
      SELECT * FROM template_instances
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `

    return result.map(row => this.transformRow(row))
  }

  /**
   * Check if subdomain is available
   */
  async isSubdomainAvailable(subdomain: string): Promise<boolean> {
    const result = await this.sql`
      SELECT COUNT(*) as count FROM template_instances
      WHERE subdomain = ${subdomain}
    `

    return Number(result[0]?.count || 0) === 0
  }

  /**
   * Check if custom domain is available
   */
  async isCustomDomainAvailable(domain: string): Promise<boolean> {
    const result = await this.sql`
      SELECT COUNT(*) as count FROM template_instances
      WHERE custom_domain = ${domain}
    `

    return Number(result[0]?.count || 0) === 0
  }

  /**
   * Generate unique subdomain
   */
  async generateUniqueSubdomain(base: string): Promise<string> {
    let subdomain = base.toLowerCase().replace(/[^a-z0-9-]/g, '')
    let counter = 0
    
    while (!(await this.isSubdomainAvailable(subdomain))) {
      counter++
      subdomain = `${base}-${counter}`
    }
    
    return subdomain
  }

  /**
   * Create instance
   */
  async create(data: {
    purchaseId: string
    userId: string
    templateId: string
    subdomain: string
    customDomain?: string
    config?: any
  }): Promise<TemplateInstance> {
    const sql = this.sql
    const configValue = data.config || {}
    
    const result = await sql`
      INSERT INTO template_instances (
        purchase_id, user_id, template_id, subdomain, custom_domain, config, status
      )
      VALUES (
        ${data.purchaseId},
        ${data.userId},
        ${data.templateId},
        ${data.subdomain},
        ${data.customDomain || null},
        ${sql.json(configValue)},
        'active'
      )
      RETURNING *
    `

    return this.transformRow(result[0])
  }

  /**
   * Update instance
   */
  async update(
    id: string,
    data: Partial<{
      customDomain: string | null
      config: any
      status: 'active' | 'suspended'
    }>
  ): Promise<TemplateInstance | null> {
    const sql = this.sql

    if (data.customDomain !== undefined && data.config === undefined && data.status === undefined) {
      const result = await sql`
        UPDATE template_instances
        SET custom_domain = ${data.customDomain}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
      return result.length > 0 ? this.transformRow(result[0]) : null
    }

    if (data.config !== undefined && data.customDomain === undefined && data.status === undefined) {
      const result = await sql`
        UPDATE template_instances
        SET config = ${sql.json(data.config)}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
      return result.length > 0 ? this.transformRow(result[0]) : null
    }

    if (data.status !== undefined && data.customDomain === undefined && data.config === undefined) {
      const result = await sql`
        UPDATE template_instances
        SET status = ${data.status}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
      return result.length > 0 ? this.transformRow(result[0]) : null
    }

    // Multiple updates - need to handle carefully
    return this.findById(id)
  }

  /**
   * Update instance config
   */
  async updateConfig(id: string, config: any): Promise<TemplateInstance | null> {
    const sql = this.sql
    
    const result = await sql`
      UPDATE template_instances
      SET config = ${sql.json(config)}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  /**
   * Delete instance
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.sql`
      DELETE FROM template_instances
      WHERE id = ${id}
    `

    return result.count > 0
  }

  /**
   * Get total instance count
   */
  async getTotalCount(): Promise<number> {
    const result = await this.sql`
      SELECT COUNT(*) as count FROM template_instances
    `

    return Number(result[0]?.count || 0)
  }

  /**
   * Get active instance count
   */
  async getActiveCount(): Promise<number> {
    const result = await this.sql`
      SELECT COUNT(*) as count FROM template_instances
      WHERE status = 'active'
    `

    return Number(result[0]?.count || 0)
  }
}
