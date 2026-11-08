/**
 * Review Repository
 * Handles all database operations related to template reviews
 */

import { BaseRepository } from './base.repository'
import type { TemplateReview, TemplateReviewRow } from '../types'

export class ReviewRepository extends BaseRepository {
  /**
   * Transform database row to application model
   */
  private transformRow(row: any): TemplateReview {
    return {
      id: row.id,
      templateId: row.template_id,
      userId: row.user_id,
      username: row.username || '',
      email: row.email || '',
      rating: Number(row.rating),
      comment: row.comment,
      createdAt: this.toISOString(row.created_at)!,
      updatedAt: this.toISOString(row.updated_at)!,
    }
  }

  /**
   * Find review by ID
   */
  async findById(id: string): Promise<TemplateReview | null> {
    const result = await this.sql`
      SELECT 
        r.*,
        u.username,
        u.email
      FROM template_reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ${id}
    `
    
    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  /**
   * Find all reviews for a template
   */
  async findByTemplateId(
    templateId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<TemplateReview[]> {
    const result = await this.sql`
      SELECT 
        r.*,
        u.username,
        u.email
      FROM template_reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.template_id = ${templateId}
      ORDER BY r.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    return result.map(row => this.transformRow(row))
  }

  /**
   * Find reviews by user
   */
  async findByUserId(userId: string): Promise<TemplateReview[]> {
    const result = await this.sql`
      SELECT 
        r.*,
        u.username,
        u.email
      FROM template_reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.user_id = ${userId}
      ORDER BY r.created_at DESC
    `

    return result.map(row => this.transformRow(row))
  }

  /**
   * Get average rating for a template
   */
  async getAverageRating(templateId: string): Promise<number | null> {
    const result = await this.sql`
      SELECT AVG(rating)::numeric(3,2) as avg_rating
      FROM template_reviews
      WHERE template_id = ${templateId}
    `

    const avgRating = result[0]?.avg_rating
    return avgRating ? this.parseDecimal(avgRating) : null
  }

  /**
   * Get review count for a template
   */
  async getReviewCount(templateId: string): Promise<number> {
    const result = await this.sql`
      SELECT COUNT(*) as count
      FROM template_reviews
      WHERE template_id = ${templateId}
    `

    return Number(result[0]?.count || 0)
  }

  /**
   * Check if user has reviewed a template
   */
  async hasUserReviewed(userId: string, templateId: string): Promise<boolean> {
    const result = await this.sql`
      SELECT COUNT(*) as count
      FROM template_reviews
      WHERE user_id = ${userId} AND template_id = ${templateId}
    `

    return Number(result[0]?.count || 0) > 0
  }

  /**
   * Create new review
   */
  async create(data: {
    templateId: string
    userId: string
    rating: number
    comment?: string
  }): Promise<TemplateReview> {
    const result = await this.sql`
      INSERT INTO template_reviews (
        template_id, user_id, rating, comment
      )
      VALUES (
        ${data.templateId}, ${data.userId}, ${data.rating}, ${data.comment || null}
      )
      RETURNING *
    `

    // Fetch with user info
    const review = await this.findById(result[0].id)
    if (!review) throw new Error('Failed to create review')
    
    return review
  }

  /**
   * Update review
   */
  async update(
    id: string,
    data: { rating?: number; comment?: string }
  ): Promise<TemplateReview | null> {
    const updates: string[] = []
    
    if (data.rating !== undefined) {
      updates.push(`rating = ${data.rating}`)
    }
    if (data.comment !== undefined) {
      updates.push(`comment = '${data.comment}'`)
    }

    if (updates.length === 0) return this.findById(id)

    updates.push('updated_at = NOW()')

    const result = await this.sql.unsafe(`
      UPDATE template_reviews
      SET ${updates.join(', ')}
      WHERE id = '${id}'
      RETURNING *
    `)

    return result.length > 0 ? this.findById(result[0].id) : null
  }

  /**
   * Delete review
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.sql`
      DELETE FROM template_reviews
      WHERE id = ${id}
    `

    return result.count > 0
  }

  /**
   * Get rating distribution for a template
   */
  async getRatingDistribution(templateId: string): Promise<Record<number, number>> {
    const result = await this.sql`
      SELECT rating, COUNT(*) as count
      FROM template_reviews
      WHERE template_id = ${templateId}
      GROUP BY rating
      ORDER BY rating DESC
    `

    const distribution: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    }

    result.forEach(row => {
      distribution[Number(row.rating)] = Number(row.count)
    })

    return distribution
  }
}
