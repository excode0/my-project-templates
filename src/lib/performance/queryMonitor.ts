/**
 * Database Query Performance Monitor
 * 
 * Tracks and logs slow queries for optimization
 */

import { logger } from '../logger';
import { PerformanceTimer } from './index';

interface QueryMetrics {
  query: string;
  params?: any[];
  duration: number;
  timestamp: Date;
  stack?: string;
}

interface SlowQueryConfig {
  threshold: number; // ms
  sampleRate: number; // 0-1 (1 = log all, 0.1 = log 10%)
  enabled: boolean;
}

class QueryMonitor {
  private metrics: QueryMetrics[] = [];
  private readonly maxMetrics = 1000;
  private config: SlowQueryConfig;

  constructor(config?: Partial<SlowQueryConfig>) {
    this.config = {
      threshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000'), // 1s default
      sampleRate: parseFloat(process.env.QUERY_SAMPLE_RATE || '1'),
      enabled: process.env.NODE_ENV !== 'test',
      ...config,
    };
  }

  /**
   * Wrap a query execution with monitoring
   */
  async track<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    params?: any[]
  ): Promise<T> {
    if (!this.config.enabled) {
      return queryFn();
    }

    const timer = new PerformanceTimer(`query:${queryName}`);
    const startTime = Date.now();

    try {
      const result = await queryFn();
      const duration = timer.end(false);

      // Record metrics
      this.recordMetrics({
        query: queryName,
        params,
        duration,
        timestamp: new Date(),
      });

      // Log slow queries
      if (duration > this.config.threshold && this.shouldSample()) {
        logger.warn('Slow query detected', {
          query: queryName,
          duration,
          threshold: this.config.threshold,
          params: this.sanitizeParams(params),
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(
        'Query failed',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          queryName,
          duration,
          params: this.sanitizeParams(params),
        }
      );

      throw error;
    }
  }

  /**
   * Record query metrics
   */
  private recordMetrics(metrics: QueryMetrics): void {
    this.metrics.push(metrics);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Determine if this query should be sampled
   */
  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  /**
   * Sanitize parameters for logging (remove sensitive data)
   */
  private sanitizeParams(params?: any[]): any[] | undefined {
    if (!params) return undefined;

    return params.map((param) => {
      if (typeof param === 'object' && param !== null) {
        const sanitized = { ...param };
        
        // Remove sensitive fields
        const sensitiveFields = [
          'password',
          'password_hash',
          'token',
          'secret',
          'api_key',
          'credit_card',
        ];

        sensitiveFields.forEach((field) => {
          if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
          }
        });

        return sanitized;
      }

      return param;
    });
  }

  /**
   * Get query statistics
   */
  getStats(): {
    total: number;
    slow: number;
    avgDuration: number;
    p95Duration: number;
    p99Duration: number;
  } {
    if (this.metrics.length === 0) {
      return {
        total: 0,
        slow: 0,
        avgDuration: 0,
        p95Duration: 0,
        p99Duration: 0,
      };
    }

    const durations = this.metrics.map((m) => m.duration).sort((a, b) => a - b);
    const total = durations.length;
    const slow = durations.filter((d) => d > this.config.threshold).length;
    const avg = durations.reduce((sum, d) => sum + d, 0) / total;
    const p95Index = Math.floor(total * 0.95);
    const p99Index = Math.floor(total * 0.99);

    return {
      total,
      slow,
      avgDuration: Math.round(avg),
      p95Duration: durations[p95Index] || 0,
      p99Duration: durations[p99Index] || 0,
    };
  }

  /**
   * Get slowest queries
   */
  getSlowestQueries(limit = 10): QueryMetrics[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
      .map((m) => ({
        ...m,
        params: this.sanitizeParams(m.params),
      }));
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SlowQueryConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Singleton instance
export const queryMonitor = new QueryMonitor();

/**
 * Helper: Wrap database query with monitoring
 * 
 * Usage:
 * ```typescript
 * const users = await monitorQuery(
 *   'get_users',
 *   () => db.query('SELECT * FROM users WHERE role = $1', ['user']),
 *   ['user']
 * );
 * ```
 */
export async function monitorQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  params?: any[]
): Promise<T> {
  return queryMonitor.track(queryName, queryFn, params);
}

/**
 * Helper: Create monitored query function
 * 
 * Usage:
 * ```typescript
 * const getUsers = createMonitoredQuery(
 *   'get_users',
 *   (role: string) => db.query('SELECT * FROM users WHERE role = $1', [role])
 * );
 * 
 * const users = await getUsers('user');
 * ```
 */
export function createMonitoredQuery<Args extends any[], Result>(
  queryName: string,
  queryFn: (...args: Args) => Promise<Result>
): (...args: Args) => Promise<Result> {
  return async (...args: Args) => {
    return queryMonitor.track(queryName, () => queryFn(...args), args as any[]);
  };
}
