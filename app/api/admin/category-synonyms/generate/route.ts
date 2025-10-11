import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getUserRole } from '@/lib/admin'
import { openai, isOpenAIConfigured, MODELS } from '@/lib/openai'

interface CategorySynonymSuggestion {
  categoryName: string
  categoryId: string
  synonyms: string[]
  context: string
}

// Generate category synonyms using GPT-5 nano
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
    const { mode = 'all', categoryId = '', forceGenerate = false } = body

    let categoriesToProcess: Array<{ id: string; name: string }> = []

    if (mode === 'all') {
      // Get all categories
      const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

      if (error) throw error
      categoriesToProcess = categories || []
    } else if (mode === 'single' && categoryId) {
      // Get single category
      const { data: category, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('id', categoryId)
        .single()

      if (error) throw error
      if (category) {
        categoriesToProcess = [category]
      }
    } else {
      return NextResponse.json({ error: 'Invalid mode or missing category ID' }, { status: 400 })
    }

    if (categoriesToProcess.length === 0) {
      return NextResponse.json({
        suggestions: [],
        message: 'Brak kategorii do przetworzenia'
      })
    }

    // Filter out categories that already have synonyms (unless forceGenerate is true)
    let newCategories = categoriesToProcess

    if (!forceGenerate && mode === 'all') {
      const { data: existingSynonyms } = await supabase
        .from('category_synonyms')
        .select('category_id')

      const categoriesWithSynonyms = new Set(existingSynonyms?.map((s: { category_id: string }) => s.category_id) || [])
      newCategories = categoriesToProcess.filter(cat => !categoriesWithSynonyms.has(cat.id))

      if (newCategories.length === 0) {
        return NextResponse.json({
          suggestions: [],
          message: 'Wszystkie kategorie już mają synonimy'
        })
      }
    }

    // Get AI settings from database
    const { data: aiSettings } = await supabase
      .from('ai_settings')
      .select('*')
      .single()

    // Use settings from DB or fallback to defaults
    const model = aiSettings?.category_synonym_model || MODELS.GPT_5_NANO
    const systemMessage = aiSettings?.category_synonym_system_message || 'You are a Polish language and service categorization expert. You return ONLY clean JSON without any additional comments or markdown formatting.'

    // Build categories text for prompt
    const categoriesText = newCategories.map((cat, i) => `${i + 1}. ${cat.name}`).join('\n')

    // Use custom prompt or default
    const defaultPrompt = `You are an expert in Polish language and service categorization. Your task is to generate synonyms for service categories in a local services classified ads platform.

For the given categories, generate a list of synonyms that:
1. Are in Polish language
2. Represent alternative names users might use when searching for this service
3. Include both formal and colloquial names
4. Include different grammatical forms and variations
5. Are in base form (nominative case, singular)

Categories to analyze:
{categories}

Return the response in JSON format as an object with a "suggestions" key containing an array:
{
  "suggestions": [
    {
      "categoryName": "category name",
      "categoryId": "category_id",
      "synonyms": ["synonym1", "synonym2", "synonym3"],
      "context": "brief explanation in Polish (1-2 sentences)"
    }
  ]
}

IMPORTANT:
- Return ONLY valid JSON in object format
- Minimum 3, maximum 7 synonyms per category
- All synonyms must be in Polish language
- Context should explain why these synonyms fit (in Polish)`

    const prompt = (aiSettings?.category_synonym_prompt || defaultPrompt)
      .replace('{categories}', categoriesText)

    // Create a mapping of category names to IDs for the AI response
    const categoryMap = Object.fromEntries(newCategories.map(cat => [cat.name, cat.id]))

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
      response_format: { type: 'json_object' }
    })

    const responseText = completion.choices[0].message.content || '{}'
    let suggestions: CategorySynonymSuggestion[] = []

    try {
      const parsed = JSON.parse(responseText)

      // Handle both array and object with array property
      let rawSuggestions = Array.isArray(parsed)
        ? parsed
        : (parsed.results || parsed.suggestions || parsed.categories || parsed.data || [])

      // Validate and normalize each suggestion
      suggestions = rawSuggestions
        .filter((s: any) => s && s.categoryName && s.synonyms)
        .map((s: any) => ({
          categoryName: s.categoryName,
          categoryId: categoryMap[s.categoryName] || s.categoryId || '',
          synonyms: Array.isArray(s.synonyms) ? s.synonyms : [],
          context: s.context || ''
        }))
        .filter((s: CategorySynonymSuggestion) => s.categoryId) // Only keep suggestions with valid category ID
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
    console.error('AI category synonym generation failed:', error)
    return NextResponse.json({
      error: 'Failed to generate category synonyms',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Batch apply AI-generated category synonyms
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
    const { suggestions } = body as { suggestions: CategorySynonymSuggestion[] }

    if (!suggestions || suggestions.length === 0) {
      return NextResponse.json({ error: 'No suggestions provided' }, { status: 400 })
    }

    // Prepare data for bulk insert
    const synonymsToInsert = suggestions.flatMap(suggestion =>
      suggestion.synonyms.map(synonym => ({
        category_id: suggestion.categoryId,
        synonym: synonym.trim()
      }))
    )

    const { data, error } = await supabase
      .from('category_synonyms')
      .insert(synonymsToInsert)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      inserted: data?.length || 0,
      synonyms: data
    })

  } catch (error) {
    console.error('Failed to save category synonyms:', error)
    return NextResponse.json({
      error: 'Failed to save category synonyms',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
