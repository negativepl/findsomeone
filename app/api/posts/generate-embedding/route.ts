import { NextRequest, NextResponse } from 'next/server'
import { generatePostEmbedding } from '@/lib/embeddings'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, city } = body

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Generate embedding on the server side
    const embedding = await generatePostEmbedding({
      title,
      description,
      category,
      city,
    })

    return NextResponse.json({ embedding })
  } catch (error) {
    console.error('Error generating embedding:', error)
    return NextResponse.json(
      { error: 'Failed to generate embedding' },
      { status: 500 }
    )
  }
}
