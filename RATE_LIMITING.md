# Rate Limiting

## Przegląd

System wyszukiwania ma zaimplementowany **rate limiting** chroniący przed nadużyciami i zapewniający stabilność API.

## Limity

### Automatyczne limity per IP:

| Endpoint | Limit | Okno czasowe | Uwagi |
|----------|-------|--------------|-------|
| `/api/search` | 10 req | 10 sekund | Główne wyszukiwanie |
| `/api/search/semantic` | 5 req | 10 sekund | AI semantic search (kosztowne) |
| `/api/search/rewrite` | 5 req | 10 sekund | AI query correction (kosztowne) |
| `/api/search/suggestions` | 20 req | 10 sekund | Autocomplete (więcej tolerancji) |

## Response Headers

Każda odpowiedź zawiera nagłówki rate limit:

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1704067200000
```

## Przekroczenie limitu

Gdy limit zostanie przekroczony:

**HTTP Status:** `429 Too Many Requests`

**Response:**
```json
{
  "error": "Too many requests",
  "message": "Przekroczono limit wyszukiwań. Spróbuj ponownie za chwilę.",
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

## Konfiguracja

### Development (domyślnie)

W środowisku deweloperskim system używa **in-memory rate limiting**:
- Prosty, bez dodatkowych zależności
- Resetuje się przy restarcie serwera
- Wystarczający do testowania

### Production (zalecane)

Dla produkcji skonfiguruj **Upstash Redis**:

1. Załóż konto na [Upstash Console](https://console.upstash.com/)
2. Stwórz nową bazę Redis (darmowy tier wystarczy)
3. Dodaj do `.env.local`:

```env
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**Zalety Upstash:**
- ✅ Persystentny storage (przetrwa restarty)
- ✅ Shared state (działa z multiple instances)
- ✅ Analytics (monitoring użycia)
- ✅ Darmowy tier: 10,000 req/dzień

## Customizacja limitów

Edytuj `lib/rate-limit.ts`:

```typescript
export const RATE_LIMITS = {
  search: {
    limit: 10,  // ← zmień limit
    window: 10, // ← zmień okno (sekundy)
  },
  semantic: {
    limit: 5,
    window: 10,
  },
  // ...
}
```

## Best Practices

### Dla użytkowników API:

1. **Respektuj `Retry-After` header** - czekaj wskazany czas
2. **Monitoruj `X-RateLimit-Remaining`** - nie czekaj na 429
3. **Implementuj exponential backoff** dla retries

### Dla administratorów:

1. **Monitoruj abuse patterns** w Upstash dashboard
2. **Dostosuj limity** na podstawie load testing
3. **Rozważ per-user limits** dla zalogowanych użytkowników (TODO)

## Przykład obsługi w kliencie

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

## Metryki

### Koszt Upstash (darmowy tier):
- 10,000 requests/dzień
- 256MB storage
- Wystarczy dla ~1000 użytkowników dziennie

### Koszt paid tier ($0.20/100k requests):
- 100,000 users/dzień = **$2.00/miesiąc**
- Bardzo tanie!

## Troubleshooting

### Problem: Rate limit działa zbyt agresywnie

**Rozwiązanie:** Zwiększ `limit` lub `window` w `RATE_LIMITS`

### Problem: Multiple users za tym samym IP (corporate)

**Rozwiązanie:** Implementuj per-user rate limiting dla zalogowanych:

```typescript
// lib/rate-limit.ts
const identifier = user?.id || `ip:${clientIp}`
```

### Problem: Rate limiting nie działa w development

**Powód:** In-memory store resetuje się przy hot reload

**Rozwiązanie:** Skonfiguruj Upstash Redis nawet dla dev

## Przyszłe ulepszenia (TODO)

- [ ] Per-user rate limiting (wyższe limity dla zalogowanych)
- [ ] Premium tier bez limitów (subscription)
- [ ] Rate limiting dashboard w admin panel
- [ ] Automatic ban dla abuse (np. >100 req/min)
- [ ] Whitelist dla trusted IPs (partnery API)

## Security Note

Rate limiting to **pierwsza linia obrony** przed:
- DDoS attacks
- API abuse
- Credential stuffing
- Cost overrun (OpenAI API)

Zawsze trzymaj enabled w produkcji! 🔒
