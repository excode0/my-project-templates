/**
 * Cache Layer Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cache, cacheKeys } from './index';

describe('Cache Layer', () => {
  beforeEach(async () => {
    await cache.clear();
    vi.clearAllTimers();
  });

  describe('Basic Operations', () => {
    it('should set and get values', async () => {
      await cache.set('test-key', 'test-value');
      const value = await cache.get('test-key');
      expect(value).toBe('test-value');
    });

    it('should return null for non-existent keys', async () => {
      const value = await cache.get('non-existent');
      expect(value).toBeNull();
    });

    it('should delete values', async () => {
      await cache.set('test-key', 'test-value');
      await cache.delete('test-key');
      const value = await cache.get('test-key');
      expect(value).toBeNull();
    });

    it('should handle complex objects', async () => {
      const obj = { id: 1, name: 'Test', nested: { value: 'data' } };
      await cache.set('object-key', obj);
      const value = await cache.get('object-key');
      expect(value).toEqual(obj);
    });
  });

  describe('TTL Expiration', () => {
    it('should expire values after TTL', async () => {
      vi.useFakeTimers();
      
      await cache.set('test-key', 'test-value', { ttl: 1 }); // 1 second
      
      // Should exist immediately
      let value = await cache.get('test-key');
      expect(value).toBe('test-value');
      
      // Advance time past TTL
      vi.advanceTimersByTime(2000);
      
      // Should be expired
      value = await cache.get('test-key');
      expect(value).toBeNull();
      
      vi.useRealTimers();
    });
  });

  describe('Pattern Operations', () => {
    it('should delete matching patterns', async () => {
      await cache.set('user:1', 'data1');
      await cache.set('user:2', 'data2');
      await cache.set('template:1', 'data3');
      
      await cache.deletePattern('user:*');
      
      expect(await cache.get('user:1')).toBeNull();
      expect(await cache.get('user:2')).toBeNull();
      expect(await cache.get('template:1')).toBe('data3');
    });
  });

  describe('Cache-Aside Pattern', () => {
    it('should fetch on cache miss', async () => {
      const fetcher = vi.fn(async () => 'fetched-value');
      
      const value = await cache.getOrSet('test-key', fetcher);
      
      expect(value).toBe('fetched-value');
      expect(fetcher).toHaveBeenCalledOnce();
      
      // Should use cache on second call
      const value2 = await cache.getOrSet('test-key', fetcher);
      expect(value2).toBe('fetched-value');
      expect(fetcher).toHaveBeenCalledOnce(); // Not called again
    });

    it('should call fetcher on cache miss only', async () => {
      const fetcher = vi.fn(async () => 'new-value');
      
      await cache.set('existing-key', 'old-value');
      
      const value = await cache.getOrSet('existing-key', fetcher);
      
      expect(value).toBe('old-value');
      expect(fetcher).not.toHaveBeenCalled();
    });
  });

  describe('Cache Keys', () => {
    it('should generate correct cache keys', () => {
      expect(cacheKeys.template('test-slug')).toBe('template:test-slug');
      expect(cacheKeys.templates('filter')).toBe('templates:filter');
      expect(cacheKeys.templates()).toBe('templates:all');
      expect(cacheKeys.instance('id-123')).toBe('instance:id-123');
      expect(cacheKeys.domain('example.com')).toBe('domain:example.com');
      expect(cacheKeys.user('user-123')).toBe('user:user-123');
      expect(cacheKeys.purchases('user-123')).toBe('purchases:user-123');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // Should not throw on error
      await expect(cache.get('test')).resolves.not.toThrow();
      await expect(cache.set('test', 'value')).resolves.not.toThrow();
      await expect(cache.delete('test')).resolves.not.toThrow();
    });
  });
});
