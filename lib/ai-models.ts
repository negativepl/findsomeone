// AI Models configuration (can be imported in client components)
export const MODELS = {
  GPT_5_NANO: 'gpt-5-nano',
  GPT_5_MINI: 'gpt-5-mini',
  GPT_5: 'gpt-5',
} as const

// Pricing per 1M tokens
export const PRICING = {
  [MODELS.GPT_5_NANO]: {
    input: 0.05,
    output: 0.40,
  },
  [MODELS.GPT_5_MINI]: {
    input: 0.15,
    output: 0.60,
  },
  [MODELS.GPT_5]: {
    input: 2.50,
    output: 10.00,
  },
} as const

// Calculate cost for a completion
export function calculateCost(
  model: keyof typeof MODELS,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[model]
  const inputCost = (inputTokens / 1_000_000) * pricing.input
  const outputCost = (outputTokens / 1_000_000) * pricing.output
  return inputCost + outputCost
}
