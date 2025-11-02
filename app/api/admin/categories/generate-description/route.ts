import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { categoryName, isSubcategory, parentCategoryName } = await request.json()

    if (!categoryName) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    const prompt = isSubcategory
      ? `Napisz krótki, zwięzły opis (maksymalnie 2-3 zdania) dla podkategorii ogłoszeń "${categoryName}" w kategorii "${parentCategoryName}". Opis powinien być pomocny dla użytkowników dodających ogłoszenia. Napisz tylko sam opis, bez dodatkowych komentarzy.`
      : `Napisz krótki, zwięzły opis (maksymalnie 2-3 zdania) dla kategorii ogłoszeń "${categoryName}". Opis powinien być pomocny dla użytkowników dodających ogłoszenia. Napisz tylko sam opis, bez dodatkowych komentarzy.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Jesteś ekspertem od tworzenia opisów kategorii ogłoszeń. Tworzysz zwięzłe, pomocne opisy w języku polskim.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    })

    const description = completion.choices[0]?.message?.content?.trim()

    if (!description) {
      return NextResponse.json(
        { error: 'Failed to generate description' },
        { status: 500 }
      )
    }

    return NextResponse.json({ description })
  } catch (error) {
    console.error('Error generating description:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
