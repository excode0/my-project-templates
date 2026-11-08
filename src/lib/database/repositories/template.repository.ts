/**
 * Template Repository
 * Handles all database operations related to templates
 */

import { BaseRepository } from './base.repository'
import type {
  Template,
  TemplateRow,
  TemplateWithStats,
  TemplateFilters,
  PaginationParams,
  PaginatedResult,
} from '../types'

export class TemplateRepository extends BaseRepository {
  /**
   * Transform database row to application model
   */
  private transformRow(row: any): Template {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      contributorId: row.contributor_id,
      category: row.category,
      price: this.parseDecimal(row.price),
      status: row.status,
      type: row.type,
      previewImage: row.preview_image,
      description: row.description,
      requiresCustomDomain: row.requires_custom_domain,
      isFeatured: row.is_featured,
      demoUrl: row.demo_url,
      manifest: row.manifest,
      createdAt: this.toISOString(row.created_at)!,
      updatedAt: this.toISOString(row.updated_at)!,
    }
  }

  /**
   * Transform row with stats
   */
  private transformRowWithStats(row: any): TemplateWithStats {
    return {
      ...this.transformRow(row),
      contributorUsername: row.contributor_username || '',
      contributorEmail: row.contributor_email || '',
      purchaseCount: Number(row.purchase_count || 0),
      avgRating: row.avg_rating ? this.parseDecimal(row.avg_rating) : null,
      reviewCount: Number(row.review_count || 0),
    }
  }

  /**
   * Find template by ID
   */
  async findById(id: string): Promise<Template | null> {
    const result = await this.sql`
      SELECT * FROM templates
      WHERE id = ${id}
    `
    
    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  /**
   * Find template by slug
   */
  async findBySlug(slug: string): Promise<Template | null> {
    const result = await this.sql`
      SELECT * FROM templates
      WHERE slug = ${slug}
    `
    
    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  /**
   * Find template by slug with full details (contributor, stats)
   */
  async findBySlugWithDetails(slug: string): Promise<TemplateWithStats | null> {
    const result = await this.sql`
      SELECT 
        t.*,
        u.username as contributor_username,
        u.email as contributor_email,
        (SELECT COUNT(*) FROM template_purchases WHERE template_id = t.id) as purchase_count,
        (SELECT AVG(rating)::numeric(3,2) FROM template_reviews WHERE template_id = t.id) as avg_rating,
        (SELECT COUNT(*) FROM template_reviews WHERE template_id = t.id) as review_count
      FROM templates t
      JOIN users u ON t.contributor_id = u.id
      WHERE t.slug = ${slug} AND t.status = 'approved'
    `
    
    return result.length > 0 ? this.transformRowWithStats(result[0]) : null
  }

  /**
   * Find all templates with filters and pagination
   */
  async findAll(
    filters: TemplateFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<TemplateWithStats>> {
    const page = pagination.page || 1
    const limit = pagination.limit || 12
    const offset = (page - 1) * limit
    const sortBy = pagination.sortBy || 'created_at'
    const sortOrder = pagination.sortOrder || 'desc'

    // Build WHERE conditions
    const conditions: string[] = []
    const params: any = {}

    if (filters.category) {
      conditions.push('t.category = ${category}')
      params.category = filters.category
    }

    if (filters.status) {
      conditions.push('t.status = ${status}')
      params.status = filters.status
    }

    if (filters.contributorId) {
      conditions.push('t.contributor_id = ${contributorId}')
      params.contributorId = filters.contributorId
    }

    if (filters.featured !== undefined) {
      conditions.push('t.is_featured = ${featured}')
      params.featured = filters.featured
    }

    if (filters.minPrice !== undefined) {
      conditions.push('t.price >= ${minPrice}')
      params.minPrice = filters.minPrice
    }

    if (filters.maxPrice !== undefined) {
      conditions.push('t.price <= ${maxPrice}')
      params.maxPrice = filters.maxPrice
    }

    if (filters.search) {
      conditions.push('(t.name ILIKE ${search} OR t.description ILIKE ${search})')
      params.search = `%${filters.search}%`
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count
      FROM templates t
      ${whereClause}
    `
    
    const countResult = await this.sql.unsafe(countQuery, Object.values(params))
    const total = Number(countResult[0]?.count || 0)

    // Get paginated data
    const dataQuery = `
      SELECT 
        t.*,
        u.username as contributor_username,
        u.email as contributor_email,
        (SELECT COUNT(*) FROM template_purchases WHERE template_id = t.id) as purchase_count,
        (SELECT AVG(rating)::numeric(3,2) FROM template_reviews WHERE template_id = t.id) as avg_rating,
        (SELECT COUNT(*) FROM template_reviews WHERE template_id = t.id) as review_count
      FROM templates t
      JOIN users u ON t.contributor_id = u.id
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT ${limit}
      OFFSET ${offset}
    `

    const dataResult = await this.sql.unsafe(dataQuery, Object.values(params))

    return {
      data: dataResult.map(row => this.transformRowWithStats(row)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Find related templates (same category)
   */
  async findRelated(slug: string, category: string, limit: number = 3): Promise<any[]> {
    const result = await this.sql`
      SELECT 
        t.id,
        t.name,
        t.slug,
        t.price,
        t.preview_image,
        (SELECT COUNT(*) FROM template_purchases WHERE template_id = t.id) as purchase_count
      FROM templates t
      WHERE t.category = ${category} 
        AND t.slug != ${slug} 
        AND t.status = 'approved'
      ORDER BY RANDOM()
      LIMIT ${limit}
    `

    return result.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      price: this.parseDecimal(row.price),
      previewImage: row.preview_image,
      purchaseCount: Number(row.purchase_count || 0),
    }))
  }

  /**
   * Find featured templates
   */
  async findFeatured(limit: number = 6): Promise<TemplateWithStats[]> {
    const result = await this.sql`
      SELECT 
        t.*,
        u.username as contributor_username,
        u.email as contributor_email,
        (SELECT COUNT(*) FROM template_purchases WHERE template_id = t.id) as purchase_count,
        (SELECT AVG(rating)::numeric(3,2) FROM template_reviews WHERE template_id = t.id) as avg_rating,
        (SELECT COUNT(*) FROM template_reviews WHERE template_id = t.id) as review_count
      FROM templates t
      JOIN users u ON t.contributor_id = u.id
      WHERE t.is_featured = true AND t.status = 'approved'
      ORDER BY t.created_at DESC
      LIMIT ${limit}
    `

    return result.map(row => this.transformRowWithStats(row))
  }

  /**
   * Create new template
   */
  async create(data: Partial<TemplateRow>): Promise<Template> {
    const sql = this.sql
    const manifestValue = data.manifest || null
    
    const result = await sql`
      INSERT INTO templates (
        name, slug, contributor_id, category, price, 
        status, type, preview_image, description, 
        requires_custom_domain, is_featured, demo_url, manifest
      )
      VALUES (
        ${data.name || ''}, 
        ${data.slug || ''}, 
        ${data.contributor_id || ''}, 
        ${data.category || ''}, 
        ${data.price || '0'}, 
        ${data.status || 'draft'}, 
        ${data.type || 'editor'}, 
        ${data.preview_image || null}, 
        ${data.description || null}, 
        ${data.requires_custom_domain || false}, 
        ${data.is_featured || false}, 
        ${data.demo_url || null}, 
        ${manifestValue ? sql.json(manifestValue) : null}
      )
      RETURNING *
    `

    return this.transformRow(result[0])
  }

  /**
   * Update template
   */
  async update(id: string, data: Partial<TemplateRow>): Promise<Template | null> {
    const updates: string[] = []
    const values: any = {}

    if (data.name !== undefined) {
      updates.push('name = ${name}')
      values.name = data.name
    }
    if (data.category !== undefined) {
      updates.push('category = ${category}')
      values.category = data.category
    }
    if (data.price !== undefined) {
      updates.push('price = ${price}')
      values.price = data.price
    }
    if (data.status !== undefined) {
      updates.push('status = ${status}')
      values.status = data.status
    }
    if (data.preview_image !== undefined) {
      updates.push('preview_image = ${preview_image}')
      values.preview_image = data.preview_image
    }
    if (data.description !== undefined) {
      updates.push('description = ${description}')
      values.description = data.description
    }
    if (data.is_featured !== undefined) {
      updates.push('is_featured = ${is_featured}')
      values.is_featured = data.is_featured
    }
    if (data.demo_url !== undefined) {
      updates.push('demo_url = ${demo_url}')
      values.demo_url = data.demo_url
    }
    if (data.manifest !== undefined) {
      updates.push('manifest = ${manifest}')
      values.manifest = data.manifest
    }

    if (updates.length === 0) return this.findById(id)

    updates.push('updated_at = NOW()')

    const query = `
      UPDATE templates
      SET ${updates.join(', ')}
      WHERE id = ${id}
      RETURNING *
    `

    const result = await this.sql.unsafe(query, Object.values(values))
    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  /**
   * Delete template
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.sql`
      DELETE FROM templates
      WHERE id = ${id}
    `

    return result.count > 0
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    let result
    
    if (excludeId) {
      result = await this.sql`
        SELECT COUNT(*) as count FROM templates
        WHERE slug = ${slug} AND id != ${excludeId}
      `
    } else {
      result = await this.sql`
        SELECT COUNT(*) as count FROM templates
        WHERE slug = ${slug}
      `
    }

    return Number(result[0]?.count || 0) > 0
  }
}
