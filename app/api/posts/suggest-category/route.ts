import { NextRequest, NextResponse } from 'next/server'
import { openai, isOpenAIConfigured, MODELS } from '@/lib/openai'
import { createClient } from '@/lib/supabase/server'

interface CategorySuggestion {
  categorySlug: string
  subcategorySlug?: string
  thirdLevelSlug?: string
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
    const { title = '', description = '' } = body

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

    // Separate categories by level
    const mainCategories = allCategories.filter(cat => !cat.parent_id)

    // Build hierarchical categories description for the AI
    const categoriesDescription = mainCategories.map(cat => {
      const level2 = allCategories.filter(sub => sub.parent_id === cat.id)

      let subsText = ''
      if (level2.length > 0) {
        subsText = '\n  Podkategorie poziom 2:\n' + level2.map(sub2 => {
          const level3 = allCategories.filter(sub3 => sub3.parent_id === sub2.id)
          const level3Text = level3.length > 0
            ? `\n    → Podkategorie poziom 3: ${level3.map(s => `${s.name} (${s.slug})`).join(', ')}`
            : ''
          return `    • ${sub2.name} (${sub2.slug})${level3Text}`
        }).join('\n')
      }

      return `- ${cat.name} (${cat.slug}): ${cat.description}${subsText}`
    }).join('\n\n')

    const systemMessage = `Jesteś ekspertem od kategoryzacji ogłoszeń usługowych w Polsce.
Analizujesz ogłoszenia i sugerujesz najbardziej odpowiednią kategorię i podkategorię.
Zwracasz TYLKO czysty JSON bez dodatkowych komentarzy czy formatowania markdown.`

    const userPrompt = `Przeanalizuj poniższe ogłoszenie i zasugeruj najbardziej odpowiednią kategorię (może mieć do 3 poziomów):

TYTUŁ: ${title}
OPIS: ${description || '(brak opisu)'}

Dostępne kategorie (hierarchia do 3 poziomów):
${categoriesDescription}

Zwróć odpowiedź w formacie JSON:
{
  "categorySlug": "slug-kategorii-glownej",
  "subcategorySlug": "slug-podkategorii-poziomu-2-lub-null",
  "thirdLevelSlug": "slug-podkategorii-poziomu-3-lub-null",
  "confidence": 0.95,
  "reasoning": "Krótkie wyjaśnienie wyboru po polsku (1-2 zdania)"
}

WAŻNE:
- Wybierz najbardziej pasującą kategorię główną (poziom 1)
- Jeśli pasuje podkategoria poziomu 2, podaj jej slug w subcategorySlug
- Jeśli pasuje jeszcze bardziej szczegółowa podkategoria poziomu 3, podaj jej slug w thirdLevelSlug
- Możesz wybrać tylko poziom 1, albo 1+2, albo 1+2+3 - zależnie od tego co najbardziej pasuje
- Confidence to pewność od 0 do 1 (np. 0.95 = 95%)
- Reasoning ma wyjaśnić wybór po polsku
- Zwróć TYLKO JSON, bez dodatkowego tekstu`

    const completion = await openai.chat.completions.create({
      model: MODELS.GPT_4O_MINI,
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
      temperature: 0.7,
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

      // Validate subcategory hierarchy
      const mainCategory = mainCategories.find(cat => cat.slug === suggestion.categorySlug)

      if (suggestion.subcategorySlug && mainCategory) {
        const level2Category = allCategories.find(
          sub => sub.slug === suggestion.subcategorySlug && sub.parent_id === mainCategory.id
        )
        if (!level2Category) {
          // Invalid level 2 category
          suggestion.subcategorySlug = undefined
          suggestion.thirdLevelSlug = undefined
        } else if (suggestion.thirdLevelSlug) {
          // Validate level 3 category
          const level3Exists = allCategories.some(
            sub => sub.slug === suggestion.thirdLevelSlug && sub.parent_id === level2Category.id
          )
          if (!level3Exists) {
            suggestion.thirdLevelSlug = undefined
          }
        }
      } else if (suggestion.thirdLevelSlug) {
        // Can't have level 3 without level 2
        suggestion.thirdLevelSlug = undefined
      }

      return NextResponse.json({
        suggestion,
        tokensUsed: completion.usage?.total_tokens || 0,
        model: MODELS.GPT_4O_MINI
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
