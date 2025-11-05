# Rate Limiting

## Overview

The search system has implemented **rate limiting** to protect against abuse and ensure API stability.

## Limits

### Automatic Limits per IP:

| Endpoint | Limit | Time Window | Notes |
|----------|-------|--------------|-------|
| `/api/search` | 10 req | 10 seconds | Main search |
| `/api/search/semantic` | 5 req | 10 seconds | AI semantic search (expensive) |
| `/api/search/rewrite` | 5 req | 10 seconds | AI query correction (expensive) |
| `/api/search/suggestions` | 20 req | 10 seconds | Autocomplete (more tolerance) |

## Response Headers

Each response contains rate limit headers:

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1704067200000
```

## Exceeding the Limit

When limit is exceeded:

**HTTP Status:** `429 Too Many Requests`

**Response:**
```json
{
  "error": "Too many requests",
  "message": "Search limit exceeded. Please try again in a moment.",
  "retryAfter": 8
}
```

**Headers:**
```http
Retry-After: 8
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704067200000
```

## Configuration

### Development (Default)

In development environment, system uses **in-memory rate limiting**:
- Simple, no additional dependencies
- Resets on server restart
- Sufficient for testing

### Production (Recommended)

For production, configure **Upstash Redis**:

1. Create account at [Upstash Console](https://console.upstash.com/)
2. Create new Redis database (free tier is sufficient)
3. Add to `.env.local`:

```env
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**Upstash Benefits:**
- Persistent storage (survives restarts)
- Shared state (works with multiple instances)
- Analytics (usage monitoring)
- Free tier: 10,000 req/day

## Custom Limits

Edit `lib/rate-limit.ts`:

```typescript
export const RATE_LIMITS = {
  search: {
    limit: 10,  // ← change limit
    window: 10, // ← change window (seconds)
  },
  semantic: {
    limit: 5,
    window: 10,
  },
  // ...
}
```

## Best Practices

### For API Users:

1. **Respect `Retry-After` header** - wait indicated time
2. **Monitor `X-RateLimit-Remaining`** - don't wait for 429
3. **Implement exponential backoff** for retries

### For Administrators:

1. **Monitor abuse patterns** in Upstash dashboard
2. **Adjust limits** based on load testing
3. **Consider per-user limits** for authenticated users (TODO)

## Client Example

```typescript
async function searchWithRateLimit(query: string) {
  const response = await fetch(`/api/search?q=${query}`)

  // Check rate limit headers
  const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0')

  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '10')
    console.warn(`Rate limited. Retry after ${retryAfter}s`)

    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
    return searchWithRateLimit(query) // Retry
  }

  // Show warning when close to limit
  if (remaining <= 2) {
    console.warn(`Rate limit warning: ${remaining} requests remaining`)
  }

  return response.json()
}
```

## Metrics

### Upstash Cost (Free Tier):
- 10,000 requests/day
- 256MB storage
- Sufficient for ~1000 daily users

### Paid Tier Cost ($0.20/100k requests):
- 100,000 users/day = **$2.00/month**
- Very affordable!

## Troubleshooting

### Problem: Rate limit too aggressive

**Solution:** Increase `limit` or `window` in `RATE_LIMITS`

### Problem: Multiple users behind same IP (corporate)

**Solution:** Implement per-user rate limiting for authenticated users:

```typescript
// lib/rate-limit.ts
const identifier = user?.id || `ip:${clientIp}`
```

### Problem: Rate limiting not working in development

**Reason:** In-memory store resets on hot reload

**Solution:** Configure Upstash Redis even for dev

## Future Improvements (TODO)

- [ ] Per-user rate limiting (higher limits for authenticated users)
- [ ] Premium tier without limits (subscription)
- [ ] Rate limiting dashboard in admin panel
- [ ] Automatic ban for abuse (e.g., >100 req/min)
- [ ] Whitelist for trusted IPs (API partners)

## Security Note

Rate limiting is **first line of defense** against:
- DDoS attacks
- API abuse
- Credential stuffing
- Cost overrun (OpenAI API)

Always keep enabled in production!
