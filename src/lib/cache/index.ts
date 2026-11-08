/**
 * Caching Layer
 * Supports both in-memory (development) and Redis (production)
 */

import { logger } from '@/lib/logger';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

class Cache {
  private memoryCache: Map<string, { value: any; expires: number }>;
  private redis: any = null; // Redis client placeholder
  private useRedis: boolean;

  constructor() {
    this.memoryCache = new Map();
    this.useRedis = !!process.env.REDIS_URL;

    if (this.useRedis) {
      // Redis initialization placeholder
      // TODO: Initialize Redis client when Redis is available
      logger.info('Cache: Redis mode enabled (not yet connected)');
    } else {
      logger.info('Cache: In-memory mode');
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.useRedis && this.redis) {
        // Redis implementation
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // In-memory implementation
        const cached = this.memoryCache.get(key);
        
        if (!cached) return null;
        
        if (Date.now() > cached.expires) {
          this.memoryCache.delete(key);
          return null;
        }
        
        return cached.value;
      }
    } catch (error) {
      logger.error('Cache get error', error as Error, { key });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || 3600; // Default 1 hour
    
    try {
      if (this.useRedis && this.redis) {
        // Redis implementation
        await this.redis.setex(key, ttl, JSON.stringify(value));
      } else {
        // In-memory implementation
        this.memoryCache.set(key, {
          value,
          expires: Date.now() + (ttl * 1000),
        });
      }
    } catch (error) {
      logger.error('Cache set error', error as Error, { key });
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      if (this.useRedis && this.redis) {
        await this.redis.del(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      logger.error('Cache delete error', error as Error, { key });
    }
  }

  /**
   * Delete all keys matching pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      if (this.useRedis && this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        // In-memory: delete keys matching pattern
        const regex = new RegExp(pattern.replace('*', '.*'));
        for (const key of this.memoryCache.keys()) {
          if (regex.test(key)) {
            this.memoryCache.delete(key);
          }
        }
      }
    } catch (error) {
      logger.error('Cache deletePattern error', error as Error, { pattern });
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      if (this.useRedis && this.redis) {
        await this.redis.flushdb();
      } else {
        this.memoryCache.clear();
      }
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Cache clear error', error as Error);
    }
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      logger.debug('Cache hit', { key });
      return cached;
    }
    
    logger.debug('Cache miss', { key });
    const value = await fetcher();
    await this.set(key, value, options);
    
    return value;
  }
}

// Singleton instance
export const cache = new Cache();

/**
 * Cache key generators
 */
export const cacheKeys = {
  template: (slug: string) => `template:${slug}`,
  templates: (filters?: string) => `templates:${filters || 'all'}`,
  instance: (id: string) => `instance:${id}`,
  domain: (domain: string) => `domain:${domain}`,
  user: (id: string) => `user:${id}`,
  purchases: (userId: string) => `purchases:${userId}`,
};
