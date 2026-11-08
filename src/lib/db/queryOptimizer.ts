/**
 * Database Query Optimization Utilities
 * Helpers for optimized database queries
 */

import { logger } from '@/lib/logger';
import { PerformanceTimer } from '@/lib/performance';

/**
 * Query builder with common optimizations
 */
export class QueryBuilder {
  private query: string = '';
  private params: any[] = [];
  private paramCount: number = 0;

  constructor(private tableName: string) {}

  /**
   * SELECT with specific fields (avoid SELECT *)
   */
  select(fields: string[]): this {
    this.query = `SELECT ${fields.join(', ')} FROM ${this.tableName}`;
    return this;
  }

  /**
   * WHERE clause with parameterized query
   */
  where(conditions: Record<string, any>): this {
    const whereClauses = Object.keys(conditions).map((key) => {
      this.paramCount++;
      this.params.push(conditions[key]);
      return `${key} = $${this.paramCount}`;
    });

    this.query += ` WHERE ${whereClauses.join(' AND ')}`;
    return this;
  }

  /**
   * ORDER BY clause
   */
  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.query += ` ORDER BY ${field} ${direction}`;
    return this;
  }

  /**
   * LIMIT clause
   */
  limit(count: number): this {
    this.paramCount++;
    this.params.push(count);
    this.query += ` LIMIT $${this.paramCount}`;
    return this;
  }

  /**
   * OFFSET clause
   */
  offset(count: number): this {
    this.paramCount++;
    this.params.push(count);
    this.query += ` OFFSET $${this.paramCount}`;
    return this;
  }

  /**
   * Build final query
   */
  build(): { query: string; params: any[] } {
    return {
      query: this.query,
      params: this.params,
    };
  }
}

/**
 * Common optimized queries
 */
export const optimizedQueries = {
  /**
   * Get templates with pagination and filters
   * Uses indexes on status, category, is_featured
   */
  getTemplates: (filters: {
    status?: string;
    category?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    if (filters.status) {
      paramCount++;
      conditions.push(`status = $${paramCount}`);
      params.push(filters.status);
    }

    if (filters.category) {
      paramCount++;
      conditions.push(`category = $${paramCount}`);
      params.push(filters.category);
    }

    if (filters.featured !== undefined) {
      paramCount++;
      conditions.push(`is_featured = $${paramCount}`);
      params.push(filters.featured);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    paramCount++;
    const limitClause = `LIMIT $${paramCount}`;
    params.push(filters.limit || 20);

    paramCount++;
    const offsetClause = `OFFSET $${paramCount}`;
    params.push(filters.offset || 0);

    const query = `
      SELECT 
        id, name, slug, description, category, price, 
        status, contributor_id, is_featured, created_at
      FROM templates
      ${whereClause}
      ORDER BY is_featured DESC, created_at DESC
      ${limitClause} ${offsetClause}
    `;

    return { query, params };
  },

  /**
   * Get template with contributor info (single JOIN)
   */
  getTemplateWithContributor: (slug: string) => ({
    query: `
      SELECT 
        t.id, t.name, t.slug, t.description, t.category, t.price,
        t.status, t.is_featured, t.created_at,
        u.id as contributor_id, u.name as contributor_name, u.email as contributor_email
      FROM templates t
      LEFT JOIN users u ON t.contributor_id = u.id
      WHERE t.slug = $1
      LIMIT 1
    `,
    params: [slug],
  }),

  /**
   * Get user instances with template info (optimized JOIN)
   */
  getUserInstances: (userId: string, limit: number = 20) => ({
    query: `
      SELECT 
        i.id, i.name, i.subdomain, i.custom_domain, i.created_at,
        t.name as template_name, t.slug as template_slug
      FROM template_instances i
      JOIN templates t ON i.template_id = t.id
      WHERE i.user_id = $1
      ORDER BY i.created_at DESC
      LIMIT $2
    `,
    params: [userId, limit],
  }),

  /**
   * Check if user owns template
   */
  checkUserOwnsTemplate: (userId: string, templateId: string) => ({
    query: `
      SELECT EXISTS(
        SELECT 1 FROM template_purchases
        WHERE user_id = $1 AND template_id = $2
      ) as owns
    `,
    params: [userId, templateId],
  }),

  /**
   * Get contributor earnings summary
   */
  getContributorEarnings: (contributorId: string) => ({
    query: `
      SELECT 
        COUNT(*) as total_sales,
        SUM(gross_amount) as total_revenue,
        SUM(net_amount) as total_earnings,
        SUM(CASE WHEN status = 'pending' THEN net_amount ELSE 0 END) as pending_earnings
      FROM contributor_earnings
      WHERE contributor_id = $1
    `,
    params: [contributorId],
  }),

  /**
   * Get admin dashboard stats (optimized aggregations)
   */
  getAdminStats: () => ({
    query: `
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'contributor') as total_contributors,
        (SELECT COUNT(*) FROM templates) as total_templates,
        (SELECT COUNT(*) FROM templates WHERE status = 'pending') as pending_review,
        (SELECT COUNT(*) FROM templates WHERE status = 'approved') as published_templates,
        (SELECT COUNT(*) FROM template_purchases) as total_purchases,
        (SELECT COALESCE(SUM(price), 0) FROM template_purchases) as total_revenue
    `,
    params: [],
  }),
};

/**
 * Query execution with performance tracking
 */
export async function executeOptimizedQuery<T>(
  db: any,
  queryInfo: { query: string; params: any[] },
  label: string
): Promise<T[]> {
  const timer = new PerformanceTimer(label);

  try {
    const result = await db.query(queryInfo.query, queryInfo.params);
    const duration = timer.end(false);

    if (duration > 1000) {
      logger.warn('Slow query detected', {
        label,
        duration: `${duration}ms`,
        query: queryInfo.query.substring(0, 100),
      });
    } else {
      logger.debug('Query executed', {
        label,
        duration: `${duration}ms`,
        rows: result.rows.length,
      });
    }

    return result.rows;
  } catch (error) {
    timer.end(false);
    logger.error('Query failed', error as Error, {
      label,
      query: queryInfo.query.substring(0, 100),
    });
    throw error;
  }
}

/**
 * Batch operations helper
 */
export class BatchOperations {
  /**
   * Batch insert with UNNEST (more efficient than multiple INSERTs)
   */
  static async batchInsert(
    db: any,
    table: string,
    columns: string[],
    values: any[][]
  ): Promise<void> {
    if (values.length === 0) return;

    const columnList = columns.join(', ');
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

    // Use UNNEST for batch insert
    const unnestArrays = columns.map((_, i) => `unnest($${i + 1}::text[])`).join(', ');

    const query = `
      INSERT INTO ${table} (${columnList})
      SELECT ${unnestArrays}
    `;

    const params = columns.map((_, colIdx) =>
      values.map((row) => row[colIdx])
    );

    await db.query(query, params);
  }

  /**
   * Batch update with CASE statement
   */
  static buildBatchUpdate(
    table: string,
    idField: string,
    updates: { id: any; fields: Record<string, any> }[]
  ): { query: string; params: any[] } {
    if (updates.length === 0) {
      return { query: '', params: [] };
    }

    const fields = Object.keys(updates[0].fields);
    const ids = updates.map((u) => u.id);
    const params: any[] = [ids];

    const caseStatements = fields.map((field, fieldIdx) => {
      const values = updates.map((u) => u.fields[field]);
      params.push(values);
      return `${field} = (unnest($${fieldIdx + 2}::text[]))`;
    });

    const query = `
      UPDATE ${table}
      SET ${caseStatements.join(', ')}
      WHERE ${idField} = ANY($1)
    `;

    return { query, params };
  }
}

/**
 * Connection pool optimization tips
 */
export const poolOptimizationTips = {
  // Recommended pool settings for postgres
  recommended: {
    max: 20, // Maximum pool size
    min: 5, // Minimum pool size
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 2000, // Fail fast if can't connect
  },

  // For high-traffic production
  production: {
    max: 50,
    min: 10,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 3000,
  },

  // For development
  development: {
    max: 5,
    min: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 2000,
  },
};
