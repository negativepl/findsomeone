-- Create AI settings table
CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Synonym generation settings
  synonym_prompt TEXT NOT NULL DEFAULT 'You are an expert in Polish language and semantics. Your task is to generate synonyms for search queries in a local services classified ads platform (e.g., hydraulik/plumber, sprzątanie/cleaning, elektryk/electrician).

For the given terms, generate a list of synonyms that:
1. Are in Polish language
2. Have the same or very similar meaning
3. Can be used interchangeably in search engines
4. Include different forms (e.g., singular/plural, different job title variations)
5. Include local names and slang/jargon

Terms to analyze:
{terms}

Return the response in JSON format as an object with a "results" key containing an array:
{
  "results": [
    {
      "term": "original term",
      "synonyms": ["synonym1", "synonym2", "synonym3"],
      "context": "brief explanation of context (1-2 sentences in Polish)"
    }
  ]
}

IMPORTANT:
- Return ONLY valid JSON in object format (not array)
- Minimum 3, maximum 6 synonyms per term
- Synonyms should be in base form (e.g., "hydraulik", not "hydraulika")
- All synonyms and context must be in Polish language',

  synonym_system_message TEXT NOT NULL DEFAULT 'You are a Polish language expert. You return ONLY clean JSON without any additional comments or markdown formatting.',

  synonym_model VARCHAR(50) NOT NULL DEFAULT 'gpt-5-nano',
  synonym_max_synonyms INTEGER NOT NULL DEFAULT 6,
  synonym_min_synonyms INTEGER NOT NULL DEFAULT 3,

  -- Future AI features settings (reserved for expansion)
  query_expansion_enabled BOOLEAN NOT NULL DEFAULT false,
  query_expansion_prompt TEXT,

  semantic_search_enabled BOOLEAN NOT NULL DEFAULT false,
  semantic_search_model VARCHAR(50),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_ai_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_settings_updated_at
  BEFORE UPDATE ON ai_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_settings_updated_at();

-- Insert default settings (only one row should exist)
INSERT INTO ai_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/update AI settings
CREATE POLICY "Admins can view AI settings"
  ON ai_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update AI settings"
  ON ai_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
