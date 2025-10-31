-- Create table for site content embeddings
-- This stores embeddings for FAQ, Privacy Policy, Terms, About pages, etc.
-- so the AI chatbot can answer questions about the site

CREATE TABLE IF NOT EXISTS site_content_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content metadata
  page_slug TEXT NOT NULL, -- e.g., 'privacy', 'terms', 'faq', 'about', 'how-it-works'
  page_title TEXT NOT NULL, -- e.g., 'Polityka prywatności'
  section_title TEXT, -- e.g., 'Cookies', 'RODO', specific FAQ question

  -- Content
  content TEXT NOT NULL, -- The actual text content to embed
  content_hash TEXT NOT NULL, -- SHA256 hash to detect changes

  -- Embedding vector (1536 dimensions for text-embedding-3-small)
  embedding vector(1536),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(page_slug, content_hash) -- Prevent duplicates
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS site_content_embeddings_vector_idx
  ON site_content_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Create index for page lookup
CREATE INDEX IF NOT EXISTS site_content_embeddings_page_idx
  ON site_content_embeddings(page_slug);

-- Create index for updated_at (for maintenance/cleanup)
CREATE INDEX IF NOT EXISTS site_content_embeddings_updated_idx
  ON site_content_embeddings(updated_at DESC);

-- Enable RLS
ALTER TABLE site_content_embeddings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read site content embeddings (needed for chatbot)
CREATE POLICY "Site content embeddings are publicly readable"
  ON site_content_embeddings
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Only admins can insert/update/delete
CREATE POLICY "Only admins can manage site content embeddings"
  ON site_content_embeddings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to search site content by similarity
CREATE OR REPLACE FUNCTION match_site_content(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  page_slug TEXT,
  page_title TEXT,
  section_title TEXT,
  content TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    site_content_embeddings.id,
    site_content_embeddings.page_slug,
    site_content_embeddings.page_title,
    site_content_embeddings.section_title,
    site_content_embeddings.content,
    1 - (site_content_embeddings.embedding <=> query_embedding) AS similarity
  FROM site_content_embeddings
  WHERE 1 - (site_content_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY site_content_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add comment for documentation
COMMENT ON TABLE site_content_embeddings IS 'Stores embeddings of site content (FAQ, Privacy, Terms, etc.) for AI chatbot knowledge base';
COMMENT ON FUNCTION match_site_content IS 'Search site content by vector similarity for AI chatbot context retrieval';
