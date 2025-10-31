import { NextRequest, NextResponse } from 'next/server'
import { openai, isOpenAIConfigured } from '@/lib/openai'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

/**
 * AI Chat Assistant API
 * Obsługuje konwersacje z asystentem FindSomeone używając GPT-5 nano
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const clientIp = getClientIp(request)
  const rateLimitResult = await rateLimit(
    `ai-chat:${clientIp}`,
    RATE_LIMITS.aiRewrite.limit, // Używamy tych samych limitów co query rewrite
    RATE_LIMITS.aiRewrite.window
  )

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Przekroczono limit zapytań do asystenta. Spróbuj ponownie za chwilę.',
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
    const { messages } = await request.json() as { messages: Message[] }

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      )
    }

    // Get last user message for intent detection
    const lastUserMessage = messages[messages.length - 1]?.content || ''

    // Get site structure and info for context
    const supabase = await createClient()

    // NOTE: We NO LONGER pre-filter "site questions" by keywords because:
    // 1. Keywords are too broad and cause false positives (e.g., "jakiegoś" triggers "jak")
    // 2. AI is smart enough to detect INFO_INTENT vs SEARCH_INTENT on its own
    // 3. If AI needs site knowledge, it will request it via INFO_INTENT
    //
    // The prompt now handles two intents:
    // - INFO_INTENT: Questions about the platform (AI will use knowledge base if available)
    // - SEARCH_INTENT: Search for posts/services (AI will return structured search)
    //
    // This way, AI decides the intent based on context, not rigid keyword matching.

    // Get AI settings from database
    const { data: aiSettings } = await supabase
      .from('ai_settings')
      .select('chat_assistant_enabled, chat_assistant_system_prompt, chat_assistant_model, chat_assistant_max_results, chat_assistant_require_city')
      .single()

    // Check if chat assistant is disabled
    if (aiSettings && !aiSettings.chat_assistant_enabled) {
      return NextResponse.json(
        { error: 'Chat assistant is currently disabled' },
        { status: 503 }
      )
    }

    const { data: categories } = await supabase
      .from('categories')
      .select('name, slug')
      .is('parent_id', null)
      .order('name')

    const categoryList = categories?.map(c => `- [${c.name}](https://findsomeone.pl/category/${c.slug})`).join('\n') || ''

    // Use prompt from database (no fallback - prompt should always be in DB)
    if (!aiSettings?.chat_assistant_system_prompt) {
      console.error('No chat assistant system prompt found in database')
      return NextResponse.json(
        { error: 'Chat assistant is not properly configured' },
        { status: 500 }
      )
    }

    // Replace variables in the prompt
    let systemPrompt = aiSettings.chat_assistant_system_prompt
    systemPrompt = systemPrompt.replace('{CATEGORIES}', categoryList)

    // Call OpenAI API
    // Note: GPT-5 nano doesn't support max_tokens, max_completion_tokens or temperature
    const aiModel = aiSettings?.chat_assistant_model || 'gpt-5-nano'
    const response = await openai.chat.completions.create({
      model: aiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
    })

    console.log('OpenAI response:', JSON.stringify(response, null, 2))

    const assistantMessage = response.choices[0]?.message?.content?.trim()

    if (!assistantMessage) {
      throw new Error('No response from AI')
    }

    console.log('Assistant message:', assistantMessage)

    // Check if AI detected search intent (case-insensitive)
    const hasSearchIntent = /SEARCH_INTENT:\s*tak/i.test(assistantMessage)
    console.log('Has search intent:', hasSearchIntent)

    if (hasSearchIntent) {
      // Parse the structured response - each field is on its own line
      // Match field name, then capture everything until newline, but exclude next field names
      const lines = assistantMessage.split('\n')

      let searchQuery = ''
      let searchCity = ''
      let priceValue = ''
      let sortBy = ''
      let naturalResponse = ''

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        if (line.startsWith('QUERY:')) {
          searchQuery = line.substring(6).trim()
        } else if (line.startsWith('CITY:')) {
          const value = line.substring(5).trim()
          searchCity = value === '""' || value === "''" ? '' : value
        } else if (line.startsWith('PRICE:')) {
          priceValue = line.substring(6).trim()
        } else if (line.startsWith('SORT:')) {
          sortBy = line.substring(5).trim()
        } else if (line.startsWith('RESPONSE:')) {
          // Response might be multiline, gather rest of lines
          naturalResponse = line.substring(9).trim()
          // Add following lines until we hit another field
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j].trim()
            if (nextLine.match(/^(SEARCH_INTENT|QUERY|CITY|PRICE|SORT|RESPONSE):/)) {
              break
            }
            if (nextLine) {
              naturalResponse += ' ' + nextLine
            }
          }
          break
        }
      }

      if (!naturalResponse) {
        naturalResponse = 'Oto ogłoszenia które mogą Cię zainteresować:'
      }

      // Clean up the natural response
      naturalResponse = naturalResponse.split(/(?:Jeśli|If you want)/i)[0].trim()

      console.log('Parsed search intent:', { searchQuery, searchCity, price: priceValue, sortBy, naturalResponse })

      // If AI is asking for city, return just the question without searching
      if (searchCity === 'ASK' || searchCity.toUpperCase() === 'ASK') {
        return NextResponse.json({
          message: naturalResponse,
          posts: [],
          suggestions: [],
        })
      }

      if (searchQuery) {
        // Call search API
        try {
          const searchResponse = await fetch(`${request.nextUrl.origin}/api/ai-chat/search-posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: searchQuery,
              city: searchCity || undefined,
              price: priceValue ? parseInt(priceValue) : undefined,
              sortBy: sortBy || undefined,
              limit: aiSettings?.chat_assistant_max_results || 6
            })
          })

          if (searchResponse.ok) {
            const searchData = await searchResponse.json()

            // Check if we found any posts
            if (!searchData.posts || searchData.posts.length === 0) {
              // No posts found - return apologetic message with suggestions
              const cityText = searchCity && searchCity.trim() ? ` w ${searchCity}` : ''
              const noResultsMessage = `Przepraszam, nie znalazłem żadnych ogłoszeń dla "${searchQuery}"${cityText}. Spróbuj wyszukać w innej kategorii lub usuń filtry.`

              return NextResponse.json({
                message: noResultsMessage,
                posts: [],
                suggestions: searchData.suggestions || [],
                searchQuery,
                searchCity: searchCity && searchCity.trim() ? searchCity : null,
              })
            }

            return NextResponse.json({
              message: naturalResponse,
              posts: searchData.posts || [],
              suggestions: searchData.suggestions || [],
              searchQuery,
              searchCity: searchCity || null,
            })
          } else {
            console.error('Search API failed:', searchResponse.status)
            // Return natural response without posts
            return NextResponse.json({
              message: 'Przepraszam, wystąpił błąd podczas wyszukiwania. Spróbuj ponownie.',
              posts: [],
              suggestions: [],
            })
          }
        } catch (searchError) {
          console.error('Search error:', searchError)
          // Return error message without posts
          return NextResponse.json({
            message: 'Przepraszam, wystąpił błąd podczas wyszukiwania. Spróbuj ponownie.',
            posts: [],
            suggestions: [],
          })
        }
      } else {
        // No search query found, return natural response
        return NextResponse.json({
          message: naturalResponse,
          posts: [],
          suggestions: [],
        })
      }
    }

    // Check if AI detected info intent (question about the platform)
    const hasInfoIntent = /INFO_INTENT:\s*tak/i.test(assistantMessage)

    if (hasInfoIntent) {
      // Parse INFO_INTENT response to extract just the RESPONSE part
      const lines = assistantMessage.split('\n')
      let naturalResponse = ''

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line.startsWith('RESPONSE:')) {
          naturalResponse = line.substring(9).trim()
          // Add following lines until we hit another field
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j].trim()
            if (nextLine.match(/^(INFO_INTENT|QUERY|RESPONSE):/)) {
              break
            }
            if (nextLine) {
              naturalResponse += ' ' + nextLine
            }
          }
          break
        }
      }

      return NextResponse.json({
        message: naturalResponse || assistantMessage,
      })
    }

    // Fallback: return full message if no intent detected
    return NextResponse.json({
      message: assistantMessage,
    })
  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
