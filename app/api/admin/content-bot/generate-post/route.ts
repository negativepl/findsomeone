import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getUnsplashImageForCategory } from '@/lib/unsplash'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const BOT_USER_ID = '00000000-0000-0000-0000-000000000002'

// List of Polish cities to use for random selection
const POLISH_CITIES = [
  'Warszawa', 'Kraków', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz',
  'Lublin', 'Katowice', 'Białystok', 'Gdynia', 'Częstochowa', 'Radom', 'Sosnowiec',
  'Toruń', 'Kielce', 'Gliwice', 'Zabrze', 'Bytom', 'Olsztyn', 'Bielsko-Biała',
  'Rzeszów', 'Ruda Śląska', 'Rybnik', 'Tychy', 'Dąbrowa Górnicza', 'Opole',
]

interface GeneratePostParams {
  categoryId: string
  categoryName: string
  isSubcategory: boolean
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { categoryId, categoryName, isSubcategory } = await request.json() as GeneratePostParams

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch AI settings
    const { data: aiSettings } = await supabase
      .from('ai_settings')
      .select('*')
      .single()

    if (!aiSettings) {
      return NextResponse.json({ error: 'AI settings not found' }, { status: 400 })
    }

    // Random city
    const city = POLISH_CITIES[Math.floor(Math.random() * POLISH_CITIES.length)]

    // Prepare prompt
    const categoryType = isSubcategory ? 'podkategoria' : 'kategoria główna'

    const prompt = aiSettings.content_bot_prompt
      .replace('{categoryName}', categoryName)
      .replace('{categoryType}', categoryType)
      .replace('{city}', city)

    // Generate post content with GPT-5 Nano
    const completion = await openai.chat.completions.create({
      model: aiSettings.content_bot_model || 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: aiSettings.content_bot_system_message || 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      // GPT-5 nano doesn't support max_tokens or temperature
    })

    const generatedContent = completion.choices[0]?.message?.content?.trim()

    if (!generatedContent) {
      throw new Error('No content generated')
    }

    // Parse JSON response
    let postData
    try {
      postData = JSON.parse(generatedContent)
    } catch (e) {
      throw new Error('Invalid JSON response from AI: ' + generatedContent)
    }

    // Validate required fields
    if (!postData.title || !postData.description) {
      throw new Error('Missing required fields in AI response')
    }

    // Fetch image from Unsplash
    let images: string[] = []
    try {
      const imageUrl = await getUnsplashImageForCategory(categoryName)
      if (imageUrl) {
        images = [imageUrl]
      }
    } catch (error) {
      console.error('Error fetching Unsplash image:', error)
      // Continue without image
    }

    // Create post
    const { data: newPost, error: insertError } = await supabase
      .from('posts')
      .insert({
        user_id: BOT_USER_ID,
        category_id: categoryId,
        title: postData.title,
        description: postData.description,
        city: city,
        district: null,
        price: postData.price || null,
        price_type: postData.price_type || 'fixed',
        price_negotiable: postData.price_negotiable || false,
        images: images,
        status: 'active',
        is_ai_generated: true,
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({
      success: true,
      post: newPost,
    })
  } catch (error: any) {
    console.error('Error generating post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate post' },
      { status: 500 }
    )
  }
}
