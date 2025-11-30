/**
 * In-memory cache for Firebase data with TTL support
 * Used to reduce Firestore reads for frequently accessed data like providers and services
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttlMs: number; // Time to live in milliseconds
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

class FirebaseCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTtlMs: number;

  constructor(config?: CacheConfig) {
    this.defaultTtlMs = config?.ttlMs ?? DEFAULT_TTL_MS;
  }

  /**
   * Get data from cache if valid, otherwise return null
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache with optional custom TTL
   */
  set<T>(key: string, data: T, ttlMs?: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + (ttlMs ?? this.defaultTtlMs),
    };
    this.cache.set(key, entry);
  }

  /**
   * Invalidate a specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries matching a prefix
   */
  invalidateByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Check if a key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

// Singleton instance for the application
export const firebaseCache = new FirebaseCache();

// Cache key constants
export const CACHE_KEYS = {
  PROVIDERS: 'providers:all',
  SERVICES: 'services:all',
  PROVIDER: (id: string) => `provider:${id}`,
  SERVICE: (id: string) => `service:${id}`,
  PROVIDER_SCHEDULE: (providerId: string) => `provider_schedule:${providerId}`,
} as const;

// Helper functions for common cache operations
export function getCachedProviders<T>(): T | null {
  return firebaseCache.get<T>(CACHE_KEYS.PROVIDERS);
}

export function setCachedProviders<T>(data: T): void {
  firebaseCache.set(CACHE_KEYS.PROVIDERS, data);
}

export function getCachedServices<T>(): T | null {
  return firebaseCache.get<T>(CACHE_KEYS.SERVICES);
}

export function setCachedServices<T>(data: T): void {
  firebaseCache.set(CACHE_KEYS.SERVICES, data);
}

export function invalidateProviderCache(): void {
  firebaseCache.invalidateByPrefix('provider');
}

export function invalidateServiceCache(): void {
  firebaseCache.invalidateByPrefix('service');
}

export function invalidateAllCache(): void {
  firebaseCache.clear();
}
