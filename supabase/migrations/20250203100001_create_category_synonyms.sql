-- Create category synonyms table
CREATE TABLE IF NOT EXISTS category_synonyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  synonym TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure no duplicate synonyms for the same category
  UNIQUE(category_id, synonym)
);

-- Create index for faster lookups
CREATE INDEX idx_category_synonyms_category_id ON category_synonyms(category_id);
CREATE INDEX idx_category_synonyms_synonym ON category_synonyms(synonym);

-- Add RLS policies
ALTER TABLE category_synonyms ENABLE ROW LEVEL SECURITY;

-- Everyone can read category synonyms (for search)
CREATE POLICY "Anyone can view category synonyms"
  ON category_synonyms
  FOR SELECT
  TO public
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage category synonyms"
  ON category_synonyms
  FOR ALL
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
