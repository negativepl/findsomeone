import { NextRequest, NextResponse } from 'next/server'
import { openai, isOpenAIConfigured, MODELS } from '@/lib/openai'
import { createClient } from '@/lib/supabase/server'

interface CategorySuggestion {
  categorySlug: string
  subcategorySlug?: string
  confidence: number
  reasoning: string
}

// Suggest category based on post title and description
export async function POST(request: NextRequest) {
  // Optional: Check if user is authenticated (comment out if you want to allow anonymous suggestions)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({
      error: 'Unauthorized',
      message: 'Musisz być zalogowany aby używać tej funkcji'
    }, { status: 401 })
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
    const { title = '', description = '', type = 'seeking' } = body

    if (!title && !description) {
      return NextResponse.json({
        error: 'Title or description is required'
      }, { status: 400 })
    }

    // Get all categories from database
    const supabase = await createClient()
    const { data: allCategories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug, description, parent_id')
      .order('parent_id', { ascending: true })

    if (categoriesError) throw categoriesError

    if (!allCategories || allCategories.length === 0) {
      return NextResponse.json({
        error: 'No categories found'
      }, { status: 500 })
    }

    // Separate main categories and subcategories
    const mainCategories = allCategories.filter(cat => !cat.parent_id)
    const subcategories = allCategories.filter(cat => cat.parent_id)

    // Build categories description for the AI
    const categoriesDescription = mainCategories.map(cat => {
      const subs = subcategories.filter(sub => sub.parent_id === cat.id)
      const subsText = subs.length > 0
        ? `\n  Podkategorie: ${subs.map(s => `${s.name} (${s.slug})`).join(', ')}`
        : ''
      return `- ${cat.name} (${cat.slug}): ${cat.description}${subsText}`
    }).join('\n')

    const systemMessage = `Jesteś ekspertem od kategoryzacji ogłoszeń usługowych w Polsce.
Analizujesz ogłoszenia i sugerujesz najbardziej odpowiednią kategorię i podkategorię.
Zwracasz TYLKO czysty JSON bez dodatkowych komentarzy czy formatowania markdown.`

    const userPrompt = `Przeanalizuj poniższe ogłoszenie i zasugeruj najbardziej odpowiednią kategorię i podkategorię:

TYTUŁ: ${title}
OPIS: ${description || '(brak opisu)'}
TYP: ${type === 'seeking' ? 'Szukam usługi' : 'Oferuję usługę'}

Dostępne kategorie:
${categoriesDescription}

Zwróć odpowiedź w formacie JSON:
{
  "categorySlug": "slug-kategorii-glownej",
  "subcategorySlug": "slug-podkategorii-lub-null",
  "confidence": 0.95,
  "reasoning": "Krótkie wyjaśnienie wyboru po polsku (1-2 zdania)"
}

WAŻNE:
- Wybierz najbardziej pasującą kategorię główną
- Jeśli pasuje podkategoria, podaj jej slug. Jeśli nie - null
- Confidence to pewność od 0 do 1 (np. 0.95 = 95%)
- Reasoning ma wyjaśnić wybór po polsku
- Zwróć TYLKO JSON, bez dodatkowego tekstu`

    const completion = await openai.chat.completions.create({
      model: MODELS.GPT_5_NANO,
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      response_format: { type: 'json_object' },
      // GPT-5 nano only supports default temperature (1)
    })

    const responseText = completion.choices[0].message.content || '{}'

    try {
      const suggestion: CategorySuggestion = JSON.parse(responseText)

      // Validate that the suggested category exists
      const categoryExists = mainCategories.some(cat => cat.slug === suggestion.categorySlug)
      if (!categoryExists) {
        return NextResponse.json({
          error: 'Suggested category not found',
          rawResponse: responseText
        }, { status: 500 })
      }

      // If subcategory is suggested, validate it exists and belongs to the main category
      if (suggestion.subcategorySlug) {
        const mainCategory = mainCategories.find(cat => cat.slug === suggestion.categorySlug)
        const subcategoryExists = subcategories.some(
          sub => sub.slug === suggestion.subcategorySlug && sub.parent_id === mainCategory?.id
        )
        if (!subcategoryExists) {
          // If invalid subcategory, set to null
          suggestion.subcategorySlug = undefined
        }
      }

      return NextResponse.json({
        suggestion,
        tokensUsed: completion.usage?.total_tokens || 0,
        model: MODELS.GPT_5_NANO
      })

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      return NextResponse.json({
        error: 'Failed to parse AI response',
        rawResponse: responseText
      }, { status: 500 })
    }

  } catch (error) {
    console.error('AI category suggestion failed:', error)
    return NextResponse.json({
      error: 'Failed to suggest category',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
