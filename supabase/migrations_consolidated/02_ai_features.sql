-- =====================================================
-- 02_AI_FEATURES.SQL
-- AI-powered features including semantic search,
-- embeddings, autocomplete, and chat assistant
-- =====================================================
-- This file contains all AI and ML-related functionality
-- including pgvector embeddings, semantic search,
-- search analytics, and AI chat features.
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================

-- Enable pgvector extension for storing and querying embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- SEARCH QUERIES TABLE
-- =====================================================
-- Tracks user search queries for analytics and personalization

CREATE TABLE IF NOT EXISTS search_queries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  query TEXT NOT NULL,

  -- Search context
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  city TEXT,

  -- Search results
  result_count INTEGER,
  clicked_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  interaction_type TEXT CHECK (interaction_type IN ('click', 'favorite', 'contact', 'view')),

  -- Embedding for semantic analysis
  query_embedding vector(1536),

  -- Session tracking
  session_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS search_queries_user_created_idx ON search_queries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS search_queries_embedding_idx ON search_queries
  USING hnsw (query_embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS search_queries_created_at_idx ON search_queries(created_at DESC);

-- =====================================================
-- USER SEARCH PREFERENCES TABLE
-- =====================================================
-- Learned user preferences based on search behavior

CREATE TABLE IF NOT EXISTS user_search_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Learned preferences
  preferred_categories TEXT[],
  preferred_cities TEXT[],
  preferred_type TEXT, -- 'seeking' or 'offering'

  -- Price preferences
  avg_price_range_min NUMERIC,
  avg_price_range_max NUMERIC,

  -- Behavioral signals
  search_frequency INTEGER DEFAULT 0,
  last_search_at TIMESTAMPTZ,
  favorite_search_times INTEGER[], -- Hour of day (0-23)

  -- Semantic preferences (from embeddings)
  preference_embedding vector(1536),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS user_search_preferences_user_id_idx ON user_search_preferences(user_id);
CREATE INDEX IF NOT EXISTS user_search_preferences_embedding_idx ON user_search_preferences
  USING hnsw (preference_embedding vector_cosine_ops);

-- =====================================================
-- CATEGORY SYNONYMS TABLE
-- =====================================================
-- Alternative names for categories for better search

CREATE TABLE IF NOT EXISTS category_synonyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  synonym TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(category_id, synonym)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_category_synonyms_category_id ON category_synonyms(category_id);
CREATE INDEX IF NOT EXISTS idx_category_synonyms_synonym ON category_synonyms(synonym);

-- =====================================================
-- AI SETTINGS TABLE
-- =====================================================
-- Configuration for AI features

CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Synonym generation settings
  synonym_prompt TEXT NOT NULL DEFAULT 'You are an expert in Polish language and semantics. Your task is to generate synonyms for search queries in a local services classified ads platform.',
  synonym_system_message TEXT NOT NULL DEFAULT 'You are a Polish language expert. You return ONLY clean JSON without any additional comments or markdown formatting.',
  synonym_model VARCHAR(50) NOT NULL DEFAULT 'gpt-5-nano',
  synonym_max_synonyms INTEGER NOT NULL DEFAULT 6,
  synonym_min_synonyms INTEGER NOT NULL DEFAULT 3,

  -- Category synonym settings
  category_synonym_prompt TEXT NOT NULL DEFAULT 'You are an expert in Polish language and service categorization.',
  category_synonym_system_message TEXT NOT NULL DEFAULT 'You are a Polish language and service categorization expert.',
  category_synonym_model VARCHAR(50) NOT NULL DEFAULT 'gpt-5-nano',
  category_synonym_max_synonyms INTEGER NOT NULL DEFAULT 7,
  category_synonym_min_synonyms INTEGER NOT NULL DEFAULT 3,

  -- Chat assistant settings
  chat_assistant_enabled BOOLEAN NOT NULL DEFAULT true,
  chat_assistant_system_prompt TEXT NOT NULL DEFAULT 'Jesteś pomocnym asystentem FindSomeone.',
  chat_assistant_model VARCHAR(50) NOT NULL DEFAULT 'gpt-5-nano',
  chat_assistant_welcome_message TEXT NOT NULL DEFAULT 'Cześć! Jestem tu aby pomóc.',
  chat_assistant_suggestions JSONB NOT NULL DEFAULT '["Jak dodać ogłoszenie?", "Jak znaleźć specjalistę?", "Jak działają opinie?"]'::jsonb,
  chat_assistant_max_results INTEGER NOT NULL DEFAULT 6,
  chat_assistant_require_city BOOLEAN NOT NULL DEFAULT true,

  -- Future AI features
  query_expansion_enabled BOOLEAN NOT NULL DEFAULT false,
  query_expansion_prompt TEXT,
  semantic_search_enabled BOOLEAN NOT NULL DEFAULT false,
  semantic_search_model VARCHAR(50),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings (only one row should exist)
INSERT INTO ai_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SITE CONTENT EMBEDDINGS TABLE
-- =====================================================
-- Stores embeddings for FAQ, Privacy Policy, Terms, etc.
-- for AI chatbot to answer questions about the site

CREATE TABLE IF NOT EXISTS site_content_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content metadata
  page_slug TEXT NOT NULL,
  page_title TEXT NOT NULL,
  section_title TEXT,

  -- Content
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,

  -- Embedding vector (1536 dimensions for text-embedding-3-small)
  embedding vector(1536),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(page_slug, content_hash)
);

-- Indexes
CREATE INDEX IF NOT EXISTS site_content_embeddings_vector_idx
  ON site_content_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS site_content_embeddings_page_idx
  ON site_content_embeddings(page_slug);

CREATE INDEX IF NOT EXISTS site_content_embeddings_updated_idx
  ON site_content_embeddings(updated_at DESC);

COMMENT ON TABLE site_content_embeddings IS 'Stores embeddings of site content (FAQ, Privacy, Terms, etc.) for AI chatbot knowledge base';

-- =====================================================
-- ADD EMBEDDING COLUMN TO POSTS
-- =====================================================

-- Add embedding column to posts table (if not exists)
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_model TEXT DEFAULT 'text-embedding-3-small',
  ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

-- Create index for fast similarity search (HNSW)
CREATE INDEX IF NOT EXISTS posts_embedding_idx
  ON posts
  USING hnsw (embedding vector_cosine_ops);

COMMENT ON COLUMN posts.embedding IS 'OpenAI text-embedding-3-small vector (1536 dimensions) for semantic search';

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_synonyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content_embeddings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - SEARCH QUERIES
-- =====================================================

CREATE POLICY "Users can view their own search queries"
  ON search_queries FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert search queries"
  ON search_queries FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- RLS POLICIES - USER SEARCH PREFERENCES
-- =====================================================

CREATE POLICY "Users can view their own preferences"
  ON user_search_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_search_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert preferences"
  ON user_search_preferences FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- RLS POLICIES - CATEGORY SYNONYMS
-- =====================================================

CREATE POLICY "Anyone can view category synonyms"
  ON category_synonyms FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage category synonyms"
  ON category_synonyms FOR ALL
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

-- =====================================================
-- RLS POLICIES - AI SETTINGS
-- =====================================================

CREATE POLICY "Admins can view AI settings"
  ON ai_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update AI settings"
  ON ai_settings FOR UPDATE
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

-- =====================================================
-- RLS POLICIES - SITE CONTENT EMBEDDINGS
-- =====================================================

CREATE POLICY "Site content embeddings are publicly readable"
  ON site_content_embeddings FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can manage site content embeddings"
  ON site_content_embeddings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- AI FUNCTIONS
-- =====================================================

-- Function to generate post embedding text
CREATE OR REPLACE FUNCTION generate_post_embedding_text(post_record posts)
RETURNS TEXT AS $$
BEGIN
  RETURN format(
    'Tytuł: %s. Opis: %s. Kategoria: %s. Miasto: %s.',
    coalesce(post_record.title, ''),
    coalesce(post_record.description, ''),
    coalesce((SELECT name FROM categories WHERE id = post_record.category_id), ''),
    coalesce(post_record.city, '')
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function for semantic search using embeddings
CREATE OR REPLACE FUNCTION search_posts_semantic(
  query_embedding vector(1536),
  similarity_threshold FLOAT DEFAULT 0.7,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  city TEXT,
  district TEXT,
  price NUMERIC,
  price_type TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ,
  similarity FLOAT,
  category_name TEXT,
  user_full_name TEXT,
  user_avatar_url TEXT,
  user_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    p.city,
    p.district,
    p.price,
    p.price_type,
    p.images,
    p.created_at,
    (1 - (p.embedding <=> query_embedding))::FLOAT as similarity,
    c.name as category_name,
    pr.full_name as user_full_name,
    pr.avatar_url as user_avatar_url,
    pr.rating as user_rating
  FROM posts p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN profiles pr ON pr.id = p.user_id
  WHERE
    p.status = 'active'
    AND p.embedding IS NOT NULL
    AND (1 - (p.embedding <=> query_embedding)) > similarity_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION search_posts_semantic IS 'Semantic search using OpenAI embeddings with cosine similarity';

-- Function to search site content by similarity
CREATE OR REPLACE FUNCTION match_site_content(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  page_slug TEXT,
  page_title TEXT,
  section_title TEXT,
  content TEXT,
  similarity FLOAT
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

COMMENT ON FUNCTION match_site_content IS 'Search site content by vector similarity for AI chatbot context retrieval';

-- Helper function to strip HTML tags (for autocomplete)
CREATE OR REPLACE FUNCTION strip_html_tags(input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN regexp_replace(input, '<[^>]*>', '', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function for autocomplete suggestions
CREATE OR REPLACE FUNCTION get_autocomplete_suggestions(
  search_prefix TEXT,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(suggestion TEXT, match_count BIGINT) AS $$
DECLARE
  normalized_prefix TEXT;
BEGIN
  normalized_prefix := lower(unaccent(trim(search_prefix)));

  -- Return empty if too short
  IF length(normalized_prefix) < 1 THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH
  -- 1. CATEGORIES with PATHS (ALWAYS SHOW - HIGHEST PRIORITY)
  category_matches AS (
    SELECT
      CASE
        WHEN c.parent_id IS NOT NULL THEN
          coalesce((SELECT name FROM categories WHERE id = c.parent_id), '') || ' > ' || c.name
        ELSE
          c.name
      END as suggestion_text,
      10000 as priority
    FROM categories c
    WHERE
      lower(unaccent(c.name)) LIKE '%' || normalized_prefix || '%'
      OR (
        c.parent_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM categories parent
          WHERE parent.id = c.parent_id
          AND lower(unaccent(parent.name)) LIKE '%' || normalized_prefix || '%'
        )
      )

    UNION ALL

    -- Category synonyms
    SELECT
      CASE
        WHEN c.parent_id IS NOT NULL THEN
          coalesce((SELECT name FROM categories WHERE id = c.parent_id), '') || ' > ' || c.name
        ELSE
          c.name
      END as suggestion_text,
      10000 as priority
    FROM categories c
    JOIN category_synonyms cs ON cs.category_id = c.id
    WHERE
      lower(unaccent(cs.synonym)) LIKE '%' || normalized_prefix || '%'
  ),

  -- 2. SEARCH QUERIES from search_queries table
  popular_queries AS (
    SELECT
      lower(query) as suggestion_text,
      1000 as priority
    FROM search_queries
    WHERE
      lower(unaccent(query)) LIKE '%' || normalized_prefix || '%'
    GROUP BY lower(query)
    ORDER BY COUNT(*) DESC
    LIMIT 10
  ),

  -- Combine all
  all_suggestions AS (
    SELECT suggestion_text, priority FROM category_matches
    UNION ALL
    SELECT suggestion_text, priority FROM popular_queries
  ),

  -- Deduplicate and rank
  ranked AS (
    SELECT
      suggestion_text,
      MAX(priority) as final_priority,
      COUNT(*) as occurrence
    FROM all_suggestions
    WHERE
      suggestion_text IS NOT NULL
      AND trim(suggestion_text) != ''
      AND length(suggestion_text) >= 2
      AND suggestion_text LIKE '%' || normalized_prefix || '%'
    GROUP BY suggestion_text
  )

  SELECT
    suggestion_text as suggestion,
    (final_priority * occurrence)::BIGINT as match_count
  FROM ranked
  ORDER BY
    -- Categories first
    CASE WHEN final_priority >= 10000 THEN 0 ELSE 1 END,
    -- Then by score
    final_priority * occurrence DESC,
    -- Then alphabetically
    suggestion_text
  LIMIT limit_count;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user preferences based on search history
CREATE OR REPLACE FUNCTION update_user_search_preferences(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  recent_searches RECORD;
BEGIN
  -- Analyze last 90 days of searches
  SELECT
    COUNT(*) as search_count,
    MAX(created_at) as last_search
  INTO recent_searches
  FROM search_queries
  WHERE
    user_id = target_user_id
    AND created_at > NOW() - interval '90 days';

  -- Insert or update preferences
  INSERT INTO user_search_preferences (
    user_id,
    search_frequency,
    last_search_at,
    updated_at
  )
  VALUES (
    target_user_id,
    recent_searches.search_count,
    recent_searches.last_search,
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    search_frequency = EXCLUDED.search_frequency,
    last_search_at = EXCLUDED.last_search_at,
    updated_at = NOW();

EXCEPTION
  WHEN OTHERS THEN
    -- Silently fail to avoid disrupting user experience
    RAISE NOTICE 'Failed to update user preferences: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old search queries (90-day retention for GDPR)
CREATE OR REPLACE FUNCTION cleanup_old_searches()
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
  rows_deleted BIGINT;
BEGIN
  DELETE FROM search_queries
  WHERE created_at < NOW() - interval '90 days';

  GET DIAGNOSTICS rows_deleted = ROW_COUNT;

  RETURN QUERY SELECT rows_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_searches IS 'Deletes search queries older than 90 days for privacy compliance. Returns count of deleted rows.';

-- Create view for search queries statistics
CREATE OR REPLACE VIEW search_queries_stats AS
SELECT
  COUNT(*) as total_queries,
  COUNT(DISTINCT query) as unique_queries,
  COUNT(DISTINCT user_id) as unique_users,
  MIN(created_at) as oldest_query,
  MAX(created_at) as newest_query,
  pg_size_pretty(pg_total_relation_size('search_queries')) as table_size,
  COUNT(*) FILTER (WHERE created_at > NOW() - interval '7 days') as queries_last_7_days,
  COUNT(*) FILTER (WHERE created_at > NOW() - interval '30 days') as queries_last_30_days,
  COUNT(*) FILTER (WHERE created_at < NOW() - interval '90 days') as queries_older_than_90_days
FROM search_queries;

COMMENT ON VIEW search_queries_stats IS 'Statistics about search queries table including size, counts, and cleanup recommendations.';

-- Trigger to update ai_settings updated_at
CREATE OR REPLACE FUNCTION update_ai_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ai_settings_updated_at ON ai_settings;
CREATE TRIGGER ai_settings_updated_at
  BEFORE UPDATE ON ai_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_settings_updated_at();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION generate_post_embedding_text(posts) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION search_posts_semantic(vector, FLOAT, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION match_site_content(vector, FLOAT, INT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_autocomplete_suggestions(TEXT, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_user_search_preferences(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_searches() TO authenticated;
GRANT SELECT ON search_queries_stats TO authenticated;
