import { openai, isOpenAIConfigured } from './openai'

/**
 * Generate embedding vector for text using OpenAI's text-embedding-3-small
 * This creates a 1536-dimensional vector representation of the text's semantic meaning
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!isOpenAIConfigured()) {
    console.warn('OpenAI not configured, skipping embedding generation')
    return null
  }

  if (!text || text.trim().length === 0) {
    return null
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // 1536 dimensions, $0.02/1M tokens
      input: text.trim(),
      encoding_format: 'float',
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Failed to generate embedding:', error)
    return null
  }
}

/**
 * Generate embedding for a post based on its content
 * Combines title, description, category, city for rich semantic representation
 */
export async function generatePostEmbedding(post: {
  title: string
  description: string
  category?: string
  city?: string
  
}): Promise<number[] | null> {
  // Create rich text for embedding
  const embeddingText = [
    `Tytuł: ${post.title}`,
    `Opis: ${post.description}`,
    post.category ? `Kategoria: ${post.category}` : '',
    post.city ? `Miasto: ${post.city}` : '',
  ]
    .filter(Boolean)
    .join('. ')

  return generateEmbedding(embeddingText)
}

/**
 * Generate embedding for a search query
 */
export async function generateQueryEmbedding(query: string): Promise<number[] | null> {
  return generateEmbedding(query)
}

/**
 * Calculate cosine similarity between two embedding vectors
 * Returns a value between 0 (completely unrelated) and 1 (identical)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (normA * normB)
}

/**
 * Batch generate embeddings for multiple texts
 * More efficient than calling generateEmbedding multiple times
 */
export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<(number[] | null)[]> {
  if (!isOpenAIConfigured()) {
    console.warn('OpenAI not configured, skipping embedding generation')
    return texts.map(() => null)
  }

  const validTexts = texts.map((t) => t?.trim() || '')
  const nonEmptyIndexes = validTexts
    .map((t, i) => (t.length > 0 ? i : -1))
    .filter((i) => i >= 0)

  if (nonEmptyIndexes.length === 0) {
    return texts.map(() => null)
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: nonEmptyIndexes.map((i) => validTexts[i]),
      encoding_format: 'float',
    })

    const results: (number[] | null)[] = texts.map(() => null)
    response.data.forEach((item, idx) => {
      results[nonEmptyIndexes[idx]] = item.embedding
    })

    return results
  } catch (error) {
    console.error('Failed to generate embeddings batch:', error)
    return texts.map(() => null)
  }
}

/**
 * Format embedding for PostgreSQL vector column
 * Converts number[] to the format expected by pgvector: '[0.1,0.2,...]'
 */
export function formatEmbeddingForPostgres(embedding: number[]): string {
  return `[${embedding.join(',')}]`
}

/**
 * Parse embedding from PostgreSQL vector column
 */
export function parseEmbeddingFromPostgres(vectorString: string): number[] {
  // Remove brackets and split by comma
  return vectorString
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((n) => parseFloat(n))
}

/**
 * Estimate cost of embedding generation
 * text-embedding-3-small: $0.02 per 1M tokens
 */
export function estimateEmbeddingCost(textLength: number): number {
  // Rough estimate: ~1 token per 4 characters
  const estimatedTokens = textLength / 4
  const pricePerMillionTokens = 0.02
  return (estimatedTokens / 1_000_000) * pricePerMillionTokens
}
