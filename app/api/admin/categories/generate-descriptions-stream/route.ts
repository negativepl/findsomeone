import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
        .select('id, name, parent_id, description')
        .order('parent_id', { nullsFirst: true })

      categoriesToProcess = categories || []
    } else if (mode === 'selected' && categoryIds) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, parent_id, description')
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

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let generated = 0
        let failed = 0
        const errors: string[] = []

        // Send initial message
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'start',
            total: categoriesToProcess.length
          })}\n\n`)
        )

        // Process each category
        for (let i = 0; i < categoriesToProcess.length; i++) {
          const category = categoriesToProcess[i]

          try {
            const categoryType = category.parent_id ? 'podkategoria' : 'kategoria główna'

            // Send progress update
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'progress',
                current: i + 1,
                total: categoriesToProcess.length,
                categoryName: category.name,
                categoryType: categoryType
              })}\n\n`)
            )

            const prompt = aiSettings.category_seo_prompt
              .replace('{categoryName}', category.name)
              .replace('{categoryType}', categoryType)

            const completion = await openai.chat.completions.create({
              model: aiSettings.category_seo_model || 'gpt-5-nano',
              messages: [
                {
                  role: 'system',
                  content: aiSettings.category_seo_system_message || 'You are an SEO expert.',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              // GPT-5 nano doesn't support max_tokens or temperature
            })

            const generatedDescription = completion.choices[0]?.message?.content?.trim()

            if (!generatedDescription) {
              throw new Error('No description generated')
            }

            // Validate length
            if (generatedDescription.length < aiSettings.category_seo_min_length) {
              throw new Error(`Description too short: ${generatedDescription.length} chars`)
            }

            if (generatedDescription.length > aiSettings.category_seo_max_length) {
              throw new Error(`Description too long: ${generatedDescription.length} chars`)
            }

            // Update category
            const { error: updateError } = await supabase
              .from('categories')
              .update({ description: generatedDescription })
              .eq('id', category.id)

            if (updateError) {
              throw updateError
            }

            generated++

            // Send success update
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'success',
                categoryName: category.name,
                description: generatedDescription
              })}\n\n`)
            )
          } catch (error: any) {
            console.error(`Failed to generate description for ${category.name}:`, error)
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

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200))
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
    console.error('Error in generate-descriptions-stream:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate descriptions' },
      { status: 500 }
    )
  }
}
