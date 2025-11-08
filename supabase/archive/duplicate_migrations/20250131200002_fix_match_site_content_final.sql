-- Final fix for match_site_content - use vector type directly like search_posts_hybrid does
-- The issue was that text::vector casting doesn't work reliably through Supabase RPC

DROP FUNCTION IF EXISTS match_site_content(text, float, int);
DROP FUNCTION IF EXISTS match_site_content(vector(1536), float, int);

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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION match_site_content(vector(1536), float, int) TO authenticated, anon;

-- Update comment
COMMENT ON FUNCTION match_site_content IS 'Search site content by vector similarity for AI chatbot context retrieval. Accepts vector(1536) directly.';
