// Server-side caching utility for dashboard data
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

class DashboardCache {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expiry: now + ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    const now = Date.now()
    
    // Check if expired
    if (now > entry.expiry) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  invalidate(pattern?: string): void {
    if (pattern) {
      // Invalidate keys matching pattern
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      // Clear all cache
      this.cache.clear()
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    const now = Date.now()
    if (now > entry.expiry) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  getStats() {
    const now = Date.now()
    let valid = 0
    let expired = 0
    
    for (const entry of this.cache.values()) {
      if (now > entry.expiry) {
        expired++
      } else {
        valid++
      }
    }
    
    return {
      total: this.cache.size,
      valid,
      expired
    }
  }
}

// Global cache instance
export const dashboardCache = new DashboardCache()

// Cache keys factory
export const cacheKeys = {
  dashboardMetrics: (userId: string) => `dashboard:metrics:${userId}`,
  analysisHistory: (userId: string, page: number) => `dashboard:history:${userId}:${page}`,
  analysisDetail: (userId: string, analysisId: string) => `dashboard:analysis:${userId}:${analysisId}`
}

// Helper function for cache-aware data fetching
export async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try cache first
  const cached = dashboardCache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Fetch fresh data
  const data = await fetchFn()
  
  // Store in cache
  dashboardCache.set(key, data, ttl)
  
  return data
}

// Helper to invalidate cache after mutations
export function invalidateUserCache(userId: string) {
  dashboardCache.invalidate(`:${userId}`)
}

// Middleware for cache invalidation on user actions
export function getCacheInvalidationStrategy() {
  return {
    onAnalysisCreated: (userId: string) => {
      invalidateUserCache(userId)
    },
    onAnalysisUpdated: (userId: string) => {
      invalidateUserCache(userId)
    },
    onProfileUpdated: (userId: string) => {
      invalidateUserCache(userId)
    }
  }
}