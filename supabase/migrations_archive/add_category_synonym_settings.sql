-- Add category synonym generation settings to ai_settings table
ALTER TABLE ai_settings
ADD COLUMN IF NOT EXISTS category_synonym_prompt TEXT NOT NULL DEFAULT 'You are an expert in Polish language and service categorization. Your task is to generate synonyms for service categories in a local services classified ads platform.

For the given categories, generate a list of synonyms that:
1. Are in Polish language
2. Represent alternative names users might use when searching for this service
3. Include both formal and colloquial names
4. Include different grammatical forms and variations
5. Are in base form (nominative case, singular)

Categories to analyze:
{categories}

Return the response in JSON format as an object with a "suggestions" key containing an array:
{
  "suggestions": [
    {
      "categoryName": "category name",
      "categoryId": "category_id",
      "synonyms": ["synonym1", "synonym2", "synonym3"],
      "context": "brief explanation in Polish (1-2 sentences)"
    }
  ]
}

IMPORTANT:
- Return ONLY valid JSON in object format
- Minimum 3, maximum 7 synonyms per category
- All synonyms must be in Polish language
- Context should explain why these synonyms fit (in Polish)',
ADD COLUMN IF NOT EXISTS category_synonym_system_message TEXT NOT NULL DEFAULT 'You are a Polish language and service categorization expert. You return ONLY clean JSON without any additional comments or markdown formatting.',
ADD COLUMN IF NOT EXISTS category_synonym_model VARCHAR(50) NOT NULL DEFAULT 'gpt-5-nano',
ADD COLUMN IF NOT EXISTS category_synonym_max_synonyms INTEGER NOT NULL DEFAULT 7,
ADD COLUMN IF NOT EXISTS category_synonym_min_synonyms INTEGER NOT NULL DEFAULT 3;

-- Update the updated_at timestamp
UPDATE ai_settings SET updated_at = NOW();
