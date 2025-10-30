// Content moderation service using Hugging Face Inference API

interface ModerationResult {
  score: number // 0-100, where 100 is definitely safe
  isApproved: boolean
  isFlagged: boolean
  isRejected: boolean
  reasons: string[]
  details: Record<string, any>
}

interface PostData {
  title: string
  description: string
  type: string
  category?: string
  city?: string
  price?: number
  price?: number
}

// Basic validation rules (anti-spam)
function basicValidation(post: PostData): { passed: boolean; reasons: string[] } {
  const reasons: string[] = []

  // Check minimum length
  if (post.title.length < 10) {
    reasons.push('Tytuł zbyt krótki (min. 10 znaków)')
  }

  if (post.description.length < 20) {
    reasons.push('Opis zbyt krótki (min. 20 znaków)')
  }

  // Check for excessive caps
  const capsRatio = (post.title.match(/[A-Z]/g) || []).length / post.title.length
  if (capsRatio > 0.7 && post.title.length > 10) {
    reasons.push('Zbyt dużo wielkich liter w tytule')
  }

  const fullText = `${post.title} ${post.description}`

  // Check for spam patterns
  const spamPatterns = [
    /(.)\1{5,}/i, // repeated characters (aaaaa)
    /\b(viagra|cialis|casino|lottery|winner)\b/i,
    /\b(click here|buy now|limited offer)\b/i,
    /\b(super okazja|najleps|gwarantujemy|pilnie pilnie|dzwoń teraz)\b/i,
    /\b(bez faktury|gotówką od ręki)\b/i,
  ]

  // Check for sexual/adult content
  const sexualPatterns = [
    /\b(seks|sex|ruchanie|pieprzenie|jebanie|kurwa|anal|oralny|cipka|pizda|chuj|kutas|penis|wagina)\b/i,
    /\b(escort|prostytutka|dziwka|masaż erotyczny|masaz erotyczny|spotkania intymne)\b/i,
    /\b(orgazm|wytrysk|masturbacja|porno|pornografia|gangbang|blowjob|lodzik|lodzika)\b/i,
    /\b(onanizm|fetysz|bdsm|dominacja|bondage|swingers|biseksualn|gej|lesbijk)\b/i,
    /\b(kamgirl|camgirl|onlyfans|webcam|striptiz|striptizerka|lap dance)\b/i,
  ]

  let sexualContentFound = 0
  for (const pattern of sexualPatterns) {
    if (pattern.test(fullText)) {
      sexualContentFound++
    }
  }

  if (sexualContentFound > 0) {
    reasons.push('Treści dla dorosłych nie są dozwolone')
  }
  let spamPatternsFound = 0
  for (const pattern of spamPatterns) {
    if (pattern.test(fullText)) {
      spamPatternsFound++
    }
  }

  if (spamPatternsFound > 0) {
    reasons.push(`Wykryto ${spamPatternsFound} wzorców spamu`)
  }

  // Check for ANY URLs (http, https, www, domain.com patterns)
  const urlPatterns = [
    /https?:\/\/[^\s]+/gi,  // http:// or https://
    /www\.[^\s]+/gi,         // www.
    /[a-z0-9-]+\.(com|pl|org|net|io|co|eu|de)[^\s]*/gi  // domain.com patterns
  ]

  let urlCount = 0
  for (const pattern of urlPatterns) {
    const matches = fullText.match(pattern)
    if (matches) {
      urlCount += matches.length
    }
  }

  if (urlCount > 0) {
    reasons.push(`Wykryto ${urlCount} linków (linki nie są dozwolone)`)
  }

  // Check for excessive emoji
  const emojiCount = (fullText.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length
  if (emojiCount > 10) {
    reasons.push('Zbyt dużo emoji')
  }

  // Check for excessive exclamation marks
  const exclamationCount = (fullText.match(/!/g) || []).length
  if (exclamationCount > 10) {
    reasons.push('Zbyt dużo wykrzykników')
  }

  // Check if description is just gibberish - enhanced validation
  const words = post.description.split(/\s+/)
  const shortWords = words.filter(w => w.length < 3).length
  if (words.length > 5 && shortWords / words.length > 0.7) {
    reasons.push('Opis wygląda na bezsensowny')
  }

  // Check for random character sequences (gibberish detection)
  // A valid text should have reasonable ratio of vowels to consonants
  const textWithoutSpaces = fullText.replace(/\s+/g, '').toLowerCase()
  const polishVowels = /[aąeęioóuy]/g
  const letters = textWithoutSpaces.replace(/[^a-ząćęłńóśźż]/g, '')

  if (letters.length > 20) {
    const vowelMatches = letters.match(polishVowels)
    const vowelRatio = vowelMatches ? vowelMatches.length / letters.length : 0

    // Polish text typically has 38-45% vowels, allow 15-60% range
    if (vowelRatio < 0.15 || vowelRatio > 0.60) {
      reasons.push('Tekst zawiera zbyt wiele losowych znaków')
    }
  }

  // Check for very long words (gibberish often has words >30 chars)
  const longWords = words.filter(w => w.length > 30)
  if (longWords.length > 0) {
    reasons.push('Wykryto podejrzanie długie słowa (możliwy spam)')
  }

  // Check for repetitive patterns (like "aaaaaa" or "123123123")
  const repetitivePattern = /(.{2,})\1{3,}/
  if (repetitivePattern.test(fullText)) {
    reasons.push('Wykryto powtarzające się wzorce')
  }

  // Check for keyboard mashing patterns (consecutive keyboard keys)
  const keyboardPatterns = [
    /qwert|asdfg|zxcvb/i,
    /poiuy|lkjhg|mnbvc/i,
    /wertyuiop|sdfghjkl|xcvbnm/i
  ]

  let keyboardMashCount = 0
  for (const pattern of keyboardPatterns) {
    const matches = fullText.match(new RegExp(pattern.source, 'gi'))
    if (matches) {
      keyboardMashCount += matches.length
    }
  }

  if (keyboardMashCount >= 2) {
    reasons.push('Tekst wygląda na przypadkowe uderzenia w klawiaturę')
  }

  return {
    passed: reasons.length === 0,
    reasons
  }
}

// Call Hugging Face API for content moderation
async function callHuggingFace(text: string, model: string): Promise<any> {
  const HF_API_KEY = process.env.HUGGING_FACE_API_KEY

  if (!HF_API_KEY) {
    console.warn('HUGGING_FACE_API_KEY not set, skipping AI moderation')
    return null
  }

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          options: {
            wait_for_model: true
          }
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error(`HuggingFace API error for ${model}:`, error)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Error calling HuggingFace (${model}):`, error)
    return null
  }
}

// Main moderation function
export async function moderatePost(post: PostData): Promise<ModerationResult> {
  const reasons: string[] = []
  let score = 100 // Start with perfect score
  const details: Record<string, any> = {}

  // Step 1: Basic validation
  const basicCheck = basicValidation(post)
  if (!basicCheck.passed) {
    reasons.push(...basicCheck.reasons)
    // Apply penalty per violation (more violations = lower score)
    const violationCount = basicCheck.reasons.length
    score -= Math.min(violationCount * 20, 60) // 20 points per violation, max -60
  }
  details.basicValidation = basicCheck

  // Step 2: AI moderation (if API key is set) - Call BOTH models in parallel
  const fullText = `${post.title}\n\n${post.description}`

  const [nsfwResult, toxicResult] = await Promise.all([
    callHuggingFace(fullText, 'michellejieli/NSFW_text_classifier'),  // For sexual content
    callHuggingFace(fullText, 'unitary/toxic-bert')                    // For toxic/spam content
  ])

  // Analyze NSFW detection result
  if (nsfwResult) {
    details.nsfwAnalysis = nsfwResult

    const results = Array.isArray(nsfwResult) ? nsfwResult[0] : []
    const nsfw = results.find((r: any) => r.label === 'NSFW' || r.label === 'nsfw')
    const nsfwScore = nsfw?.score || 0

    // Strict threshold for NSFW content
    if (nsfwScore > 0.5) {
      const nsfwPercentage = (nsfwScore * 100).toFixed(0)
      reasons.push(`AI wykryło nieodpowiednią treść (${nsfwPercentage}% pewności)`)
      const penalty = Math.floor(nsfwScore * 80) // Up to -80 points
      score -= penalty
    } else if (nsfwScore > 0.3) {
      const nsfwPercentage = (nsfwScore * 100).toFixed(0)
      reasons.push(`AI wykryło podejrzaną treść (${nsfwPercentage}% pewności)`)
      score -= 30
    }
  }

  // Analyze toxic content detection result
  if (toxicResult) {
    details.toxicAnalysis = toxicResult

    const results = Array.isArray(toxicResult) ? toxicResult[0] : []

    // Check for toxic content (any category)
    const toxic = results.find((r: any) => r.label === 'toxic')
    const obscene = results.find((r: any) => r.label === 'obscene')
    const insult = results.find((r: any) => r.label === 'insult')
    const threat = results.find((r: any) => r.label === 'threat')
    const identityHate = results.find((r: any) => r.label === 'identity_hate')

    // Take the highest toxic score
    const maxToxicScore = Math.max(
      toxic?.score || 0,
      obscene?.score || 0,
      insult?.score || 0,
      threat?.score || 0,
      identityHate?.score || 0
    )

    if (maxToxicScore > 0.4) {
      const toxicPercentage = (maxToxicScore * 100).toFixed(0)
      reasons.push(`AI wykryło toksyczną treść (${toxicPercentage}% pewności)`)
      const penalty = Math.floor(maxToxicScore * 50) // Up to -50 points
      score -= penalty
    } else if (maxToxicScore > 0.25) {
      const toxicPercentage = (maxToxicScore * 100).toFixed(0)
      reasons.push(`AI wykryło podejrzaną treść (${toxicPercentage}% pewności)`)
      score -= 20
    }
  }

  // Step 3: Context validation
  // Check if price makes sense
  if (post.price && post.price) {
    if (post.price > post.price) {
      reasons.push('Cena minimalna wyższa od maksymalnej')
      score -= 10
    }
    if (post.price < 0 || post.price < 0) {
      reasons.push('Cena nie może być ujemna')
      score -= 20
    }
  }

  // Step 4: Determine status
  const isRejected = score < 30
  const isFlagged = score >= 30 && score < 70
  const isApproved = score >= 70

  return {
    score,
    isApproved,
    isFlagged,
    isRejected,
    reasons,
    details
  }
}

// Helper to determine moderation status string
export function getModerationStatus(result: ModerationResult): string {
  if (result.isRejected) return 'rejected'
  if (result.isFlagged) return 'flagged'
  if (result.isApproved) return 'approved'
  return 'pending'
}
