/**
 * Performance Monitoring Utilities
 * Track and measure application performance
 */

import { logger } from '@/lib/logger';

/**
 * Performance timer
 */
export class PerformanceTimer {
  private start: number;
  private marks: Map<string, number>;

  constructor(private label: string) {
    this.start = Date.now();
    this.marks = new Map();
  }

  mark(label: string): void {
    this.marks.set(label, Date.now() - this.start);
  }

  end(logResult: boolean = true): number {
    const duration = Date.now() - this.start;
    
    if (logResult) {
      const marks = Array.from(this.marks.entries())
        .map(([label, time]) => `${label}: ${time}ms`)
        .join(', ');
      
      logger.debug(`Performance: ${this.label}`, {
        duration: `${duration}ms`,
        marks: marks || 'none',
      });
    }
    
    return duration;
  }
}

/**
 * Measure async function execution time
 */
export async function measureAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const timer = new PerformanceTimer(label);
  const result = await fn();
  const duration = timer.end();
  
  return { result, duration };
}

/**
 * Measure sync function execution time
 */
export function measureSync<T>(
  label: string,
  fn: () => T
): { result: T; duration: number } {
  const timer = new PerformanceTimer(label);
  const result = fn();
  const duration = timer.end();
  
  return { result, duration };
}

/**
 * Database query performance tracking
 */
export async function trackQuery<T>(
  query: string,
  executor: () => Promise<T>
): Promise<T> {
  const timer = new PerformanceTimer(`DB Query`);
  
  try {
    const result = await executor();
    const duration = timer.end(false);
    
    if (duration > 1000) {
      logger.warn('Slow database query detected', {
        query: query.substring(0, 100),
        duration: `${duration}ms`,
      });
    } else {
      logger.db.query(query.substring(0, 100), duration);
    }
    
    return result;
  } catch (error) {
    timer.end(false);
    logger.db.error(query.substring(0, 100), error as Error);
    throw error;
  }
}

/**
 * API endpoint performance tracking
 */
export function trackApiEndpoint(
  method: string,
  path: string,
  userId?: string
) {
  const timer = new PerformanceTimer(`API: ${method} ${path}`);
  
  logger.api.request(method, path, userId);
  
  return {
    end: (status: number) => {
      const duration = timer.end(false);
      logger.api.response(method, path, status, duration);
      
      if (duration > 3000) {
        logger.warn('Slow API endpoint detected', {
          method,
          path,
          duration: `${duration}ms`,
        });
      }
    },
    error: (error: Error) => {
      timer.end(false);
      logger.api.error(method, path, error);
    },
  };
}

/**
 * Memory usage checker
 */
export function checkMemoryUsage(): void {
  if (process.env.NODE_ENV === 'production') {
    const usage = process.memoryUsage();
    const formatted = {
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`,
    };
    
    logger.debug('Memory usage', formatted);
    
    // Warn if heap usage is high
    const heapUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;
    if (heapUsagePercent > 90) {
      logger.warn('High memory usage detected', {
        ...formatted,
        heapUsagePercent: `${heapUsagePercent.toFixed(2)}%`,
      });
    }
  }
}

/**
 * Start periodic memory monitoring
 */
export function startMemoryMonitoring(intervalMs: number = 60000): NodeJS.Timeout | null {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }
  
  logger.info('Starting memory monitoring', { interval: `${intervalMs}ms` });
  
  return setInterval(() => {
    checkMemoryUsage();
  }, intervalMs);
}
