/**
 * LocalStorage-based cache for frontend
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class LocalStorageCache {
  private prefix: string;

  constructor(prefix: string = 'app_cache') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      const now = Date.now();

      // Check if expired
      if (now - entry.timestamp > entry.ttl) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    try {
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(this.getKey(key), JSON.stringify(entry));
    } catch (error) {
      console.error('Cache set error:', error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clear();
      }
    }
  }

  /**
   * Remove value from cache
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  /**
   * Clear all cache entries with prefix
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.getKey(''))) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      keys.forEach((key) => {
        if (key.startsWith(this.getKey(''))) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const entry: CacheEntry<any> = JSON.parse(item);
              if (now - entry.timestamp > entry.ttl) {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            // Invalid entry, remove it
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Cache clearExpired error:', error);
    }
  }

  /**
   * Get or set pattern
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }
}

// Singleton instance
export const localStorageCache = new LocalStorageCache();

// Auto-clean expired entries on load
if (typeof window !== 'undefined') {
  localStorageCache.clearExpired();
  // Clean expired entries every 5 minutes
  setInterval(() => {
    localStorageCache.clearExpired();
  }, 5 * 60 * 1000);
}

