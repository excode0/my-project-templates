/**
 * User Repository
 * Handles all database operations related to users
 */

import { BaseRepository } from './base.repository'
import type { User, UserRow, UserRole, UserStatus } from '../types'

export class UserRepository extends BaseRepository {
  /**
   * Transform database row to application model
   */
  private transformRow(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role,
      status: row.status,
      createdAt: this.toISOString(row.created_at)!,
      updatedAt: this.toISOString(row.updated_at)!,
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const result = await this.sql`
      SELECT id, username, email, role, status, created_at, updated_at
      FROM users
      WHERE id = ${id}
    `
    
    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.sql`
      SELECT id, username, email, role, status, created_at, updated_at
      FROM users
      WHERE email = ${email}
    `
    
    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    const result = await this.sql`
      SELECT id, username, email, role, status, created_at, updated_at
      FROM users
      WHERE username = ${username}
    `
    
    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  /**
   * Find user with password (for authentication)
   */
  async findByEmailWithPassword(email: string): Promise<(User & { passwordHash: string }) | null> {
    const result = await this.sql`
      SELECT *
      FROM users
      WHERE email = ${email}
    `
    
    if (result.length === 0) return null

    const row = result[0]
    return {
      ...this.transformRow(row),
      passwordHash: row.password_hash,
    }
  }

  /**
   * Find all users with pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    filters?: {
      role?: UserRole
      status?: UserStatus
      search?: string
    }
  ): Promise<{
    data: User[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
  }> {
    const offset = (page - 1) * limit

    // Build WHERE conditions
    const conditions: string[] = []
    
    if (filters?.role) {
      conditions.push(`role = '${filters.role}'`)
    }
    if (filters?.status) {
      conditions.push(`status = '${filters.status}'`)
    }
    if (filters?.search) {
      conditions.push(`(username ILIKE '%${filters.search}%' OR email ILIKE '%${filters.search}%')`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Get total count
    const countResult = await this.sql.unsafe(`
      SELECT COUNT(*) as count FROM users ${whereClause}
    `)
    const total = Number(countResult[0]?.count || 0)

    // Get paginated data
    const result = await this.sql.unsafe(`
      SELECT id, username, email, role, status, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `)

    return {
      data: result.map(row => this.transformRow(row)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Create new user
   */
  async create(data: {
    username: string
    email: string
    passwordHash: string
    role?: UserRole
  }): Promise<User> {
    const result = await this.sql`
      INSERT INTO users (username, email, password_hash, role)
      VALUES (
        ${data.username}, 
        ${data.email}, 
        ${data.passwordHash}, 
        ${data.role || 'user'}
      )
      RETURNING id, username, email, role, status, created_at, updated_at
    `

    return this.transformRow(result[0])
  }

  /**
   * Update user
   */
  async update(
    id: string,
    data: Partial<{
      username: string
      email: string
      role: UserRole
      status: UserStatus
    }>
  ): Promise<User | null> {
    const updates: string[] = []
    
    if (data.username) updates.push(`username = '${data.username}'`)
    if (data.email) updates.push(`email = '${data.email}'`)
    if (data.role) updates.push(`role = '${data.role}'`)
    if (data.status) updates.push(`status = '${data.status}'`)

    if (updates.length === 0) return this.findById(id)

    updates.push('updated_at = NOW()')

    const result = await this.sql.unsafe(`
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = '${id}'
      RETURNING id, username, email, role, status, created_at, updated_at
    `)

    return result.length > 0 ? this.transformRow(result[0]) : null
  }

  /**
   * Update password
   */
  async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const result = await this.sql`
      UPDATE users
      SET password_hash = ${passwordHash}, updated_at = NOW()
      WHERE id = ${id}
    `

    return result.count > 0
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.sql`
      DELETE FROM users
      WHERE id = ${id}
    `

    return result.count > 0
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    let result
    
    if (excludeId) {
      result = await this.sql`
        SELECT COUNT(*) as count FROM users
        WHERE email = ${email} AND id != ${excludeId}
      `
    } else {
      result = await this.sql`
        SELECT COUNT(*) as count FROM users
        WHERE email = ${email}
      `
    }

    return Number(result[0]?.count || 0) > 0
  }

  /**
   * Check if username exists
   */
  async usernameExists(username: string, excludeId?: string): Promise<boolean> {
    let result
    
    if (excludeId) {
      result = await this.sql`
        SELECT COUNT(*) as count FROM users
        WHERE username = ${username} AND id != ${excludeId}
      `
    } else {
      result = await this.sql`
        SELECT COUNT(*) as count FROM users
        WHERE username = ${username}
      `
    }

    return Number(result[0]?.count || 0) > 0
  }

  /**
   * Get user statistics
   */
  async getStats(userId: string): Promise<{
    purchaseCount: number
    templateCount: number
    reviewCount: number
    totalEarnings: number
  }> {
    const result = await this.sql`
      SELECT
        (SELECT COUNT(*) FROM template_purchases WHERE user_id = ${userId}) as purchase_count,
        (SELECT COUNT(*) FROM templates WHERE contributor_id = ${userId}) as template_count,
        (SELECT COUNT(*) FROM template_reviews WHERE user_id = ${userId}) as review_count,
        (SELECT COALESCE(SUM(price_paid), 0) FROM template_purchases tp 
         JOIN templates t ON tp.template_id = t.id 
         WHERE t.contributor_id = ${userId} AND tp.payment_status = 'succeeded') as total_earnings
    `

    const row = result[0]
    return {
      purchaseCount: Number(row?.purchase_count || 0),
      templateCount: Number(row?.template_count || 0),
      reviewCount: Number(row?.review_count || 0),
      totalEarnings: this.parseDecimal(row?.total_earnings || 0),
    }
  }
}
