import { Redis } from '@upstash/redis'

/**
 * Search cache layer using Upstash Redis
 * Caches autocomplete results to reduce database load
 */

// Create Redis client (uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null

// Cache configuration
const CACHE_CONFIG = {
  // Autocomplete cache TTL (Time To Live) - 5 minutes
  // Short TTL ensures fresh results while reducing DB load
  autocomplete: {
    ttl: 300, // 5 minutes in seconds
    prefix: 'search:autocomplete:',
  },
  // Popular/trending cache - longer TTL since it changes slowly
  trending: {
    ttl: 600, // 10 minutes
    prefix: 'search:trending',
  },
  popular: {
    ttl: 600, // 10 minutes
    prefix: 'search:popular',
  },
}

/**
 * Get cached autocomplete results
 * @param query - Search query
 * @param userId - Optional user ID for personalized cache
 * @returns Cached results or null if not found
 */
export async function getCachedAutocomplete(
  query: string,
  userId?: string | null
): Promise<any | null> {
  if (!redis) {
    return null // No cache available
  }

  try {
    const cacheKey = buildCacheKey(query, userId)
    const cached = await redis.get(cacheKey)

    if (cached) {
      console.log('[Cache] HIT for query:', query)
      return cached
    }

    console.log('[Cache] MISS for query:', query)
    return null
  } catch (error) {
    console.error('[Cache] Error getting cached autocomplete:', error)
    return null
  }
}

/**
 * Set autocomplete results in cache
 * @param query - Search query
 * @param data - Autocomplete data to cache
 * @param userId - Optional user ID for personalized cache
 */
export async function setCachedAutocomplete(
  query: string,
  data: any,
  userId?: string | null
): Promise<void> {
  if (!redis) {
    return // No cache available
  }

  try {
    const cacheKey = buildCacheKey(query, userId)
    await redis.set(cacheKey, data, {
      ex: CACHE_CONFIG.autocomplete.ttl,
    })
    console.log('[Cache] SET for query:', query)
  } catch (error) {
    console.error('[Cache] Error setting cached autocomplete:', error)
    // Don't throw - cache failures should not break the app
  }
}

/**
 * Get cached trending searches
 */
export async function getCachedTrending(): Promise<any | null> {
  if (!redis) {
    return null
  }

  try {
    const cached = await redis.get(CACHE_CONFIG.trending.prefix)
    return cached
  } catch (error) {
    console.error('[Cache] Error getting trending:', error)
    return null
  }
}

/**
 * Set cached trending searches
 */
export async function setCachedTrending(data: any): Promise<void> {
  if (!redis) {
    return
  }

  try {
    await redis.set(CACHE_CONFIG.trending.prefix, data, {
      ex: CACHE_CONFIG.trending.ttl,
    })
  } catch (error) {
    console.error('[Cache] Error setting trending:', error)
  }
}

/**
 * Get cached popular searches
 */
export async function getCachedPopular(): Promise<any | null> {
  if (!redis) {
    return null
  }

  try {
    const cached = await redis.get(CACHE_CONFIG.popular.prefix)
    return cached
  } catch (error) {
    console.error('[Cache] Error getting popular:', error)
    return null
  }
}

/**
 * Set cached popular searches
 */
export async function setCachedPopular(data: any): Promise<void> {
  if (!redis) {
    return
  }

  try {
    await redis.set(CACHE_CONFIG.popular.prefix, data, {
      ex: CACHE_CONFIG.popular.ttl,
    })
  } catch (error) {
    console.error('[Cache] Error setting popular:', error)
  }
}

/**
 * Invalidate autocomplete cache for a specific query
 * Useful when posts are created/updated
 */
export async function invalidateAutocompleteCache(query?: string): Promise<void> {
  if (!redis) {
    return
  }

  try {
    if (query) {
      // Invalidate specific query cache
      const cacheKey = buildCacheKey(query, null)
      await redis.del(cacheKey)
      console.log('[Cache] Invalidated cache for query:', query)
    } else {
      // Invalidate all autocomplete cache (scan and delete by pattern)
      // Note: This can be slow with many keys, use sparingly
      const pattern = CACHE_CONFIG.autocomplete.prefix + '*'
      const keys = await redis.keys(pattern)

      if (keys.length > 0) {
        await redis.del(...keys)
        console.log('[Cache] Invalidated', keys.length, 'autocomplete caches')
      }
    }
  } catch (error) {
    console.error('[Cache] Error invalidating cache:', error)
  }
}

/**
 * Invalidate trending/popular caches
 * Call this when new searches are tracked
 */
export async function invalidateTrendingCache(): Promise<void> {
  if (!redis) {
    return
  }

  try {
    await redis.del(CACHE_CONFIG.trending.prefix, CACHE_CONFIG.popular.prefix)
    console.log('[Cache] Invalidated trending/popular caches')
  } catch (error) {
    console.error('[Cache] Error invalidating trending cache:', error)
  }
}

/**
 * Build cache key from query and optional user ID
 */
function buildCacheKey(query: string, userId?: string | null): string {
  const normalizedQuery = query.toLowerCase().trim()
  const key = `${CACHE_CONFIG.autocomplete.prefix}${normalizedQuery}`

  // Include user ID in cache key for personalized results
  // But only if smart suggestions are enabled
  if (userId) {
    return `${key}:user:${userId}`
  }

  return key
}

/**
 * Get cache statistics (useful for monitoring)
 */
export async function getCacheStats(): Promise<{
  enabled: boolean
  keys?: number
  memory?: string
} | null> {
  if (!redis) {
    return { enabled: false }
  }

  try {
    // Get number of autocomplete cache keys
    const pattern = CACHE_CONFIG.autocomplete.prefix + '*'
    const keys = await redis.keys(pattern)

    return {
      enabled: true,
      keys: keys.length,
      memory: 'N/A', // Redis REST API doesn't support MEMORY command
    }
  } catch (error) {
    console.error('[Cache] Error getting cache stats:', error)
    return { enabled: true }
  }
}
