import { NextRequest, NextResponse } from 'next/server'
import { openai, isOpenAIConfigured } from '@/lib/openai'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

/**
 * Query Rewriting API
 * Poprawia literówki i optymalizuje zapytania używając GPT-5 nano
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting (very strict for AI to save costs)
  const clientIp = getClientIp(request)
  const rateLimitResult = await rateLimit(
    `rewrite:${clientIp}`,
    RATE_LIMITS.aiRewrite.limit,
    RATE_LIMITS.aiRewrite.window
  )

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Przekroczono limit korekt zapytań. Spróbuj ponownie za chwilę.',
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          ...rateLimitResult.headers,
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      { error: 'OpenAI not configured' },
      { status: 500 }
    )
  }

  try {
    const { query } = await request.json()

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        original: query,
        corrected: query,
        needsCorrection: false,
      })
    }

    // Wywołaj GPT-5 nano do poprawy zapytania
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Jesteś asystentem do poprawiania zapytań wyszukiwania w polskiej platformie ogłoszeń usługowych.

ZADANIE:
- Popraw literówki i błędy ortograficzne w zapytaniu
- Usuń niepotrzebne słowa (np. "szukam", "potrzebuję")
- Zostaw tylko kluczowe słowa opisujące usługę
- Zwróć krótkie, czyste zapytanie

PRZYKŁADY:
"hydrualik warszwa" → "hydraulik warszawa"
"potrzebuję kogoś do sprzontania" → "sprzątanie"
"elektryk ktury naprawi" → "elektryk naprawa"
"szukam fachowca od remontu" → "remont"
"transprot rzeczy" → "transport rzeczy"

WAŻNE:
- Jeśli zapytanie jest poprawne, zwróć je bez zmian
- Zachowaj kontekst geograficzny (miasta, dzielnice)
- Nie dodawaj informacji których nie było w oryginalnym zapytaniu
- Odpowiedz TYLKO poprawionym zapytaniem, bez wyjaśnień`,
        },
        {
          role: 'user',
          content: query,
        },
      ],
      temperature: 0.3,
      max_tokens: 50,
    })

    const corrected = response.choices[0]?.message?.content?.trim() || query
    const needsCorrection = corrected.toLowerCase() !== query.toLowerCase().trim()

    return NextResponse.json({
      original: query,
      corrected,
      needsCorrection,
      confidence: needsCorrection ? 0.85 : 1.0,
    })
  } catch (error) {
    console.error('Query rewriting error:', error)
    return NextResponse.json(
      {
        error: 'Failed to rewrite query',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
