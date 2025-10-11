import OpenAI from 'openai'

// Initialize OpenAI client (server-side only)
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Check if OpenAI is configured (server-side only)
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here'
}

// Re-export models and pricing for server-side use
export { MODELS, PRICING, calculateCost } from './ai-models'
