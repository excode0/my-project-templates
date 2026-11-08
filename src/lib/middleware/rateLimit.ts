/**
 * Rate Limiting Middleware
 * Protect API endpoints from abuse
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry>;

  constructor() {
    this.store = new Map();
    
    // Cleanup expired entries every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if request is allowed
   */
  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // New window
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    if (entry.count >= config.maxRequests) {
      // Rate limit exceeded
      logger.warn('Rate limit exceeded', { key, count: entry.count });
      return false;
    }

    // Increment count
    entry.count += 1;
    return true;
  }

  /**
   * Get rate limit info
   */
  getInfo(key: string, config: RateLimitConfig) {
    const entry = this.store.get(key);
    const now = Date.now();

    if (!entry || now > entry.resetTime) {
      return {
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
      };
    }

    return {
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug('Rate limiter cleanup', { entriesRemoved: cleaned });
    }
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit configurations
 */
export const rateLimitConfigs = {
  // Strict: for sensitive endpoints
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  // Standard: for authenticated API endpoints
  standard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  // Relaxed: for public endpoints
  relaxed: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 300,
  },
  // Authentication: for login/register
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
  },
};

/**
 * Rate limit middleware
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig = rateLimitConfigs.standard
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Get client identifier (IP address or user ID)
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const key = `ratelimit:${req.nextUrl.pathname}:${ip}`;

    // Check rate limit
    const allowed = rateLimiter.check(key, config);
    const info = rateLimiter.getInfo(key, config);

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil((info.resetTime - Date.now()) / 1000),
          },
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': info.resetTime.toString(),
            'Retry-After': Math.ceil((info.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Continue with request
    const response = await handler(req);

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', info.remaining.toString());
    response.headers.set('X-RateLimit-Reset', info.resetTime.toString());

    return response;
  };
}
