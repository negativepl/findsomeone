import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserRole } from '@/lib/admin'
import { openai, isOpenAIConfigured, MODELS } from '@/lib/openai'

interface SynonymSuggestion {
  term: string
  synonyms: string[]
  context: string
}

// Generate synonyms using GPT-5 nano
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = await getUserRole()
  if (userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Check if OpenAI is configured
  if (!isOpenAIConfigured()) {
    return NextResponse.json({
      error: 'OpenAI API key not configured',
      message: 'Dodaj OPENAI_API_KEY do pliku .env.local'
    }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { mode = 'trending', customTerm = '', forceGenerate = false } = body

    let termsToProcess: string[] = []

    if (mode === 'trending') {
      // Get trending searches from last 7 days
      const { data: trendingSearches } = await supabase
        .rpc('get_trending_searches', { result_limit: 10 })

      termsToProcess = trendingSearches?.map((s: { query: string }) => s.query) || []
    } else if (mode === 'popular') {
      // Get popular searches
      const { data: popularSearches } = await supabase
        .rpc('get_popular_searches', { days_back: 30, result_limit: 10 })

      termsToProcess = popularSearches?.map((s: { query: string }) => s.query) || []
    } else if (mode === 'custom' && customTerm) {
      termsToProcess = [customTerm]
    } else {
      return NextResponse.json({ error: 'Invalid mode or missing term' }, { status: 400 })
    }

    if (termsToProcess.length === 0) {
      return NextResponse.json({
        suggestions: [],
        message: mode === 'custom'
          ? 'Brak terminu do analizy'
          : 'Brak wyszukiwań w bazie danych. Użyj trybu "Własny termin" lub poczekaj aż użytkownicy zaczną wyszukiwać.'
      })
    }

    // Filter out terms that already have synonyms (unless forceGenerate is true)
    let newTerms = termsToProcess

    if (!forceGenerate) {
      const { data: existingSynonyms } = await supabase
        .from('search_synonyms')
        .select('term')

      const existingTerms = new Set(existingSynonyms?.map((s: { term: string }) => s.term.toLowerCase()) || [])
      newTerms = termsToProcess.filter(term => !existingTerms.has(term.toLowerCase()))

      if (newTerms.length === 0) {
        return NextResponse.json({
          suggestions: [],
          message: 'Wszystkie terminy już mają synonymy'
        })
      }
    }

    // Get AI settings from database
    const { data: aiSettings } = await supabase
      .from('ai_settings')
      .select('*')
      .single()

    // Use settings from DB or fallback to defaults
    const model = aiSettings?.synonym_model || MODELS.GPT_5_NANO
    const systemMessage = aiSettings?.synonym_system_message || 'Jesteś ekspertem od języka polskiego. Zwracasz TYLKO czyste JSON bez żadnych dodatkowych komentarzy czy formatowania markdown.'

    // Replace {terms} placeholder in prompt
    const termsText = newTerms.map((term, i) => `${i + 1}. ${term}`).join('\n')
    const prompt = (aiSettings?.synonym_prompt || `...default prompt...`).replace('{terms}', termsText)

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      // GPT-5 nano doesn't support temperature parameter - uses default value of 1
      response_format: { type: 'json_object' }
    })

    const responseText = completion.choices[0].message.content || '{}'
    let suggestions: SynonymSuggestion[] = []

    try {
      const parsed = JSON.parse(responseText)

      // Handle both array and object with array property
      let rawSuggestions = Array.isArray(parsed)
        ? parsed
        : (parsed.results || parsed.suggestions || parsed.synonyms || parsed.data || [])

      // Validate and normalize each suggestion
      suggestions = rawSuggestions
        .filter((s: any) => s && s.term && s.synonyms)
        .map((s: any) => ({
          term: s.term,
          synonyms: Array.isArray(s.synonyms) ? s.synonyms : [],
          context: s.context || ''
        }))
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      return NextResponse.json({
        error: 'Failed to parse AI response',
        rawResponse: responseText
      }, { status: 500 })
    }

    return NextResponse.json({
      suggestions,
      tokensUsed: completion.usage?.total_tokens || 0,
      model: 'gpt-5-nano'
    })

  } catch (error) {
    console.error('AI synonym generation failed:', error)
    return NextResponse.json({
      error: 'Failed to generate synonyms',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Batch apply AI-generated synonyms
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userRole = await getUserRole()
  if (userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { suggestions } = body as { suggestions: SynonymSuggestion[] }

    if (!suggestions || suggestions.length === 0) {
      return NextResponse.json({ error: 'No suggestions provided' }, { status: 400 })
    }

    // Prepare data for bulk insert
    const synonymsToInsert = suggestions.flatMap(suggestion =>
      suggestion.synonyms.map(synonym => ({
        term: suggestion.term.trim(),
        synonym: synonym.trim()
      }))
    )

    const { data, error } = await supabase
      .from('search_synonyms')
      .insert(synonymsToInsert)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      inserted: data?.length || 0,
      synonyms: data
    })

  } catch (error) {
    console.error('Failed to save synonyms:', error)
    return NextResponse.json({
      error: 'Failed to save synonyms',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
