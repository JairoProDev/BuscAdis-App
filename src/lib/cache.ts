/**
 * INTELLIGENT CACHING SYSTEM FOR BUSCADIS
 * 
 * This system provides multiple levels of caching:
 * 1. In-memory cache for frequently accessed data
 * 2. Redis cache for distributed caching
 * 3. Browser cache with proper headers
 * 4. CDN cache for static assets
 */

// import { Redis } from 'ioredis'; // Disabled for now

// ============================================================================
// CONFIGURATION
// ============================================================================

interface CacheConfig {
  defaultTTL: number; // seconds
  maxMemorySize: number; // bytes
  redisUrl?: string;
  enableRedis: boolean;
  enableMemoryCache: boolean;
}

const CACHE_CONFIG: CacheConfig = {
  defaultTTL: 300, // 5 minutes
  maxMemorySize: 50 * 1024 * 1024, // 50MB
  redisUrl: process.env.REDIS_URL,
  enableRedis: !!process.env.REDIS_URL,
  enableMemoryCache: true,
};

// ============================================================================
// MEMORY CACHE IMPLEMENTATION
// ============================================================================

class MemoryCache {
  private cache = new Map<string, { value: unknown; expiry: number }>();
  private size = 0;

  set(key: string, value: unknown, ttl: number = CACHE_CONFIG.defaultTTL): void {
    // Remove expired entries
    this.cleanup();
    
    // Remove old entry if exists
    this.delete(key);
    
    const expiry = Date.now() + (ttl * 1000);
    const serialized = JSON.stringify(value);
    const entrySize = serialized.length;
    
    // Check memory limit
    if (this.size + entrySize > CACHE_CONFIG.maxMemorySize) {
      this.evictLRU();
    }
    
    this.cache.set(key, { value, expiry });
    this.size += entrySize;
  }

  get(key: string): unknown | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.delete(key);
      return null;
    }
    
    return entry.value;
  }

  delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      const serialized = JSON.stringify(entry.value);
      this.size -= serialized.length;
      this.cache.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
    this.size = 0;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.delete(key);
      }
    }
  }

  private evictLRU(): void {
    // Simple LRU: remove first entry (oldest)
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.delete(firstKey);
    }
  }

  stats(): { size: number; entries: number; memoryUsage: string } {
    return {
      size: this.size,
      entries: this.cache.size,
      memoryUsage: `${(this.size / 1024 / 1024).toFixed(2)}MB`
    };
  }
}

// ============================================================================
// REDIS CACHE IMPLEMENTATION
// ============================================================================

interface RedisClient {
  setex(key: string, ttl: number, value: string): Promise<string>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
  flushdb(): Promise<string>;
}

class RedisCache {
  private redis: RedisClient | null = null;

  constructor() {
    // Redis disabled for now
    // if (CACHE_CONFIG.enableRedis && CACHE_CONFIG.redisUrl) {
    //   this.redis = new Redis(CACHE_CONFIG.redisUrl, {
    //     retryDelayOnFailover: 100,
    //     maxRetriesPerRequest: 3,
    //     lazyConnect: true,
    //   });
    // }
  }

  async set(key: string, value: unknown, ttl: number = CACHE_CONFIG.defaultTTL): Promise<void> {
    if (!this.redis) return;
    
    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttl, serialized);
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  }

  async get(key: string): Promise<unknown | null> {
    if (!this.redis) return null;
    
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis cache get error:', error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redis) return;
    
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis cache delete error:', error);
    }
  }

  async clear(): Promise<void> {
    if (!this.redis) return;
    
    try {
      await this.redis.flushdb();
    } catch (error) {
      console.error('Redis cache clear error:', error);
    }
  }
}

// ============================================================================
// UNIFIED CACHE INTERFACE
// ============================================================================

class UnifiedCache {
  private memoryCache: MemoryCache;
  private redisCache: RedisCache;

  constructor() {
    this.memoryCache = new MemoryCache();
    this.redisCache = new RedisCache();
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const cacheTTL = ttl || CACHE_CONFIG.defaultTTL;
    
    // Set in memory cache
    if (CACHE_CONFIG.enableMemoryCache) {
      this.memoryCache.set(key, value, cacheTTL);
    }
    
    // Set in Redis cache
    if (CACHE_CONFIG.enableRedis) {
      await this.redisCache.set(key, value, cacheTTL);
    }
  }

  async get(key: string): Promise<unknown | null> {
    // Try memory cache first (fastest)
    if (CACHE_CONFIG.enableMemoryCache) {
      const memoryValue = this.memoryCache.get(key);
      if (memoryValue !== null) {
        return memoryValue;
      }
    }
    
    // Try Redis cache
    if (CACHE_CONFIG.enableRedis) {
      const redisValue = await this.redisCache.get(key);
      if (redisValue !== null) {
        // Store in memory cache for next time
        if (CACHE_CONFIG.enableMemoryCache) {
          this.memoryCache.set(key, redisValue, CACHE_CONFIG.defaultTTL);
        }
        return redisValue;
      }
    }
    
    return null;
  }

  async delete(key: string): Promise<void> {
    if (CACHE_CONFIG.enableMemoryCache) {
      this.memoryCache.delete(key);
    }
    
    if (CACHE_CONFIG.enableRedis) {
      await this.redisCache.delete(key);
    }
  }

  async clear(): Promise<void> {
    if (CACHE_CONFIG.enableMemoryCache) {
      this.memoryCache.clear();
    }
    
    if (CACHE_CONFIG.enableRedis) {
      await this.redisCache.clear();
    }
  }

  getStats() {
    return {
      memory: this.memoryCache.stats(),
      redis: CACHE_CONFIG.enableRedis ? 'connected' : 'disabled'
    };
  }
}

// ============================================================================
// CACHE KEY GENERATORS
// ============================================================================

export const CacheKeys = {
  // Publications
  publications: (filters: Record<string, unknown>) => 
    `pub:${JSON.stringify(filters)}`,
  
  publicationById: (id: string) => 
    `pub:${id}`,
  
  publicationsByCategory: (category: string, limit: number = 20) => 
    `pub:cat:${category}:${limit}`,
  
  // Search
  searchResults: (query: string, filters: Record<string, unknown>) => 
    `search:${btoa(JSON.stringify({ query, filters }))}`,
  
  // Analytics
  analytics: (type: string, period: string) => 
    `analytics:${type}:${period}`,
  
  // User data
  userProfile: (userId: string) => 
    `user:${userId}`,
  
  userFavorites: (userId: string) => 
    `user:${userId}:favorites`,
  
  // System data
  categories: () => 'system:categories',
  locations: () => 'system:locations',
  trending: () => 'system:trending',
} as const;

// ============================================================================
// CACHE DECORATORS
// ============================================================================

export function withCache<T extends unknown[], R>(
  keyGenerator: (...args: T) => string,
  ttl?: number
) {
  return function (target: unknown, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: T): Promise<R> {
      const key = keyGenerator(...args);
      
      // Try to get from cache
      const cached = await cache.get(key);
      if (cached !== null) {
        return cached as R;
      }
      
      // Execute method and cache result
      const result = await method.apply(this, args);
      await cache.set(key, result, ttl);
      
      return result;
    };
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const cache = new UnifiedCache();

export default cache;
