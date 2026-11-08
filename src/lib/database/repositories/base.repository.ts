/**
 * Base Repository
 * Provides common database operations
 */

import { getDb } from '@/lib/db'
import type postgres from 'postgres'

export abstract class BaseRepository {
  protected get sql(): ReturnType<typeof postgres> {
    const db = getDb()
    if (!db) {
      throw new Error('Database connection not initialized')
    }
    return db
  }

  /**
   * Execute a query and return first result or null
   */
  protected async findOne<T>(query: any): Promise<T | null> {
    const result = await query
    return result.length > 0 ? (result[0] as T) : null
  }

  /**
   * Execute a query and return all results
   */
  protected async findMany<T>(query: any): Promise<T[]> {
    const result = await query
    return result as T[]
  }

  /**
   * Execute a query and return count
   */
  protected async count(query: any): Promise<number> {
    const result = await query
    return result.length > 0 ? Number(result[0].count) : 0
  }

  /**
   * Convert database date to ISO string
   */
  protected toISOString(date: Date | null | undefined): string | null {
    return date ? date.toISOString() : null
  }

  /**
   * Parse decimal string to number
   */
  protected parseDecimal(value: string | number | null | undefined): number {
    if (value === null || value === undefined) return 0
    return typeof value === 'string' ? parseFloat(value) : value
  }

  /**
   * Execute transaction
   */
  protected async transaction<T>(
    callback: (sql: any) => Promise<T>
  ): Promise<T> {
    return await this.sql.begin(callback) as T
  }
}
