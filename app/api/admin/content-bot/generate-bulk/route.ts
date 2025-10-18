import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { categoryIds, mode } = await request.json()

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

    // Fetch categories to process
    let categoriesToProcess
    if (mode === 'all') {
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, parent_id')
        .order('parent_id', { nullsFirst: true })

      categoriesToProcess = categories || []
    } else if (mode === 'selected' && categoryIds) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, parent_id')
        .in('id', categoryIds)

      categoriesToProcess = categories || []
    } else {
      return NextResponse.json({ error: 'Invalid mode or missing categoryIds' }, { status: 400 })
    }

    if (categoriesToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No categories to process',
        generated: 0,
        failed: 0,
      })
    }

    const postsPerCategory = aiSettings.content_bot_posts_per_category || 3
    const offeringRatio = aiSettings.content_bot_offering_ratio || 0.5

    // Calculate total posts to generate
    const totalPosts = categoriesToProcess.length * postsPerCategory

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let generated = 0
        let failed = 0
        const errors: string[] = []
        let currentPostIndex = 0

        // Send initial message
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'start',
            total: totalPosts,
            categories: categoriesToProcess.length,
            postsPerCategory: postsPerCategory
          })}\n\n`)
        )

        // Process each category
        for (const category of categoriesToProcess) {
          const isSubcategory = !!category.parent_id

          // Generate multiple posts for this category
          for (let i = 0; i < postsPerCategory; i++) {
            currentPostIndex++

            try {
              // Determine post type based on ratio
              const postType = Math.random() < offeringRatio ? 'offering' : 'seeking'
              const postTypeLabel = postType === 'seeking' ? 'Szukam' : 'Oferuję'

              // Send progress update
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'progress',
                  current: currentPostIndex,
                  total: totalPosts,
                  categoryName: category.name,
                  postType: postTypeLabel,
                  postNumber: i + 1,
                  totalForCategory: postsPerCategory
                })}\n\n`)
              )

              // Random city
              const city = POLISH_CITIES[Math.floor(Math.random() * POLISH_CITIES.length)]

              // Prepare prompt
              const categoryType = isSubcategory ? 'podkategoria' : 'kategoria główna'

              const prompt = aiSettings.content_bot_prompt
                .replace('{categoryName}', category.name)
                .replace('{categoryType}', categoryType)
                .replace('{postType}', postTypeLabel)
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
                throw new Error('Invalid JSON response from AI')
              }

              // Validate required fields
              if (!postData.title || !postData.description) {
                throw new Error('Missing required fields in AI response')
              }

              // Fetch image from Unsplash - REQUIRED
              let imageUrl: string | null = null
              try {
                imageUrl = await getUnsplashImageForCategory(category.name)
              } catch (error) {
                console.error('Error fetching Unsplash image:', error)
              }

              // Skip post creation if no image (prevents posts without photos)
              if (!imageUrl) {
                throw new Error('No image available from Unsplash - skipping post')
              }

              // Create post using service role client (bypasses RLS)
              const supabaseServiceRole = createServiceRoleClient()
              const { error: insertError } = await supabaseServiceRole
                .from('posts')
                .insert({
                  user_id: BOT_USER_ID,
                  category_id: category.id,
                  title: postData.title,
                  description: postData.description,
                  type: postType,
                  city: city,
                  district: null,
                  price_min: postData.price_min || null,
                  price_max: postData.price_max || null,
                  price_type: postData.price_type || 'negotiable',
                  images: [imageUrl], // Always has image now
                  status: 'active',
                  is_ai_generated: true,
                })

              if (insertError) {
                throw insertError
              }

              generated++

              // Send success update
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'success',
                  categoryName: category.name,
                  postTitle: postData.title,
                  postType: postTypeLabel,
                  city: city
                })}\n\n`)
              )
            } catch (error: any) {
              console.error(`Failed to generate post for ${category.name}:`, error)
              failed++
              const errorMsg = `${category.name}: ${error.message}`
              errors.push(errorMsg)

              // Send error update
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'error',
                  categoryName: category.name,
                  error: error.message
                })}\n\n`)
              )
            }

            // Small delay to avoid rate limiting (both OpenAI and Unsplash)
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }

        // Send completion message
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            generated,
            failed,
            errors
          })}\n\n`)
        )

        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Error in generate-bulk:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate posts' },
      { status: 500 }
    )
  }
}
