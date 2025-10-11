import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create a simple in-memory store for rate limiting if Upstash is not configured
class InMemoryStore {
  private store: Map<string, { count: number; resetAt: number }> = new Map()

  limit(
    identifier: string,
    limitValue: number,
    windowMs: number
  ): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now()
    const key = identifier
    const entry = this.store.get(key)

    // Clean up expired entries
    if (entry && entry.resetAt < now) {
      this.store.delete(key)
    }

    const current = this.store.get(key)

    if (!current) {
      this.store.set(key, { count: 1, resetAt: now + windowMs })
      return {
        success: true,
        limit: limitValue,
        remaining: limitValue - 1,
        reset: now + windowMs,
      }
    }

    if (current.count >= limitValue) {
      return {
        success: false,
        limit: limitValue,
        remaining: 0,
        reset: current.resetAt,
      }
    }

    current.count++
    return {
      success: true,
      limit: limitValue,
      remaining: limitValue - current.count,
      reset: current.resetAt,
    }
  }
}

// Singleton instance for in-memory store
const inMemoryStore = new InMemoryStore()

// Create rate limiter instance
// If UPSTASH_REDIS_REST_URL is configured, use Upstash
// Otherwise fall back to in-memory store
export const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, '10 s'),
        analytics: true,
        prefix: 'ratelimit:search',
      })
    : null

/**
 * Rate limit helper for API routes
 *
 * @param identifier - Unique identifier (usually IP address)
 * @param limit - Max requests per window (default: 10)
 * @param window - Time window in seconds (default: 10)
 * @returns { success: boolean, headers: Headers }
 */
export async function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 10
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
  headers: Record<string, string>
}> {
  try {
    let result

    if (ratelimit) {
      // Use Upstash Redis
      result = await ratelimit.limit(identifier)
    } else {
      // Use in-memory fallback
      result = inMemoryStore.limit(identifier, limit, window * 1000)
    }

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
      },
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // If rate limiting fails, allow the request
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Date.now() + window * 1000,
      headers: {},
    }
  }
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfIp = request.headers.get('cf-connecting-ip') // Cloudflare

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  if (cfIp) {
    return cfIp
  }

  // Fallback
  return 'unknown'
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Search endpoints - 10 requests per 10 seconds
  search: {
    limit: 10,
    window: 10,
  },
  // Autocomplete/suggestions - more lenient (20 req/10s)
  autocomplete: {
    limit: 20,
    window: 10,
  },
  // Query rewriting (AI) - stricter (5 req/10s to save costs)
  aiRewrite: {
    limit: 5,
    window: 10,
  },
  // Semantic search (AI) - stricter (5 req/10s)
  semantic: {
    limit: 5,
    window: 10,
  },
  // General API - moderate (30 req/minute)
  api: {
    limit: 30,
    window: 60,
  },
}
