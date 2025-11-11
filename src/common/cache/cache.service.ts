import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string;
}

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const ttlMs = ttl ? ttl * 1000 : undefined;
    await this.cacheManager.set(key, value, ttlMs);
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Clear all cache
   */
  async reset(): Promise<void> {
    await this.cacheManager.clear();
  }

  /**
   * Get or set pattern - get from cache or execute function and cache result
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    // This is a simplified version - in production, you might want to use Redis with pattern matching
    // For now, we'll need to track keys manually or use a more sophisticated cache manager
    const keys = await this.getAllKeys();
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of keys) {
      if (regex.test(key)) {
        await this.del(key);
      }
    }
  }

  /**
   * Get all cache keys (implementation depends on cache store)
   */
  private async getAllKeys(): Promise<string[]> {
    // This is a placeholder - actual implementation depends on cache store
    // For memory store, this might not be available
    return [];
  }

  /**
   * Generate cache key with prefix
   */
  generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }
}

