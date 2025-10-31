-- Fix search_posts function to use correct column names
-- Remove 'type', 'price_min', 'price_max' - use 'price' and 'price_type' instead

DROP FUNCTION IF EXISTS search_posts(text, integer);

CREATE OR REPLACE FUNCTION search_posts(
  search_query text,
  limit_count integer default 20
)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  city text,
  district text,
  price numeric,
  price_type text,
  price_negotiable boolean,
  images text[],
  created_at timestamptz,
  user_id uuid,
  rank real,
  category_name text,
  user_full_name text,
  user_avatar_url text,
  user_rating numeric,
  user_total_reviews integer
) AS $$
DECLARE
  normalized_query text;
  query_words text[];
  word_count integer;
BEGIN
  -- Normalize query
  normalized_query := lower(unaccent(trim(search_query)));

  -- Extract words (min 3 chars, ignore common words)
  query_words := array(
    SELECT word
    FROM unnest(string_to_array(normalized_query, ' ')) AS word
    WHERE
      length(word) >= 3
      AND word NOT IN ('dla', 'the', 'and', 'lub', 'albo', 'oraz')
  );

  word_count := array_length(query_words, 1);

  -- If no valid words, return empty
  IF word_count IS NULL OR word_count = 0 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.description,
    p.city,
    p.district,
    p.price,
    p.price_type,
    p.price_negotiable,
    p.images,
    p.created_at,
    p.user_id,

    -- STRICT RANKING - only words that actually match
    (
      -- 1. EXACT PHRASE in title (HIGHEST PRIORITY)
      CASE
        WHEN lower(unaccent(p.title)) LIKE '%' || normalized_query || '%' THEN 1000
        ELSE 0
      END +

      -- 2. EXACT PHRASE in description
      CASE
        WHEN lower(unaccent(p.description)) LIKE '%' || normalized_query || '%' THEN 500
        ELSE 0
      END +

      -- 3. Count how many query words appear in title
      (
        SELECT count(*)::real * 100
        FROM unnest(query_words) AS qw
        WHERE lower(unaccent(p.title)) LIKE '%' || qw || '%'
      ) +

      -- 4. Count how many query words appear in description
      (
        SELECT count(*)::real * 50
        FROM unnest(query_words) AS qw
        WHERE lower(unaccent(p.description)) LIKE '%' || qw || '%'
      ) +

      -- 5. Category name match
      CASE
        WHEN lower(unaccent(c.name)) LIKE '%' || normalized_query || '%' THEN 200
        ELSE 0
      END +

      -- 6. Recency bonus (small)
      greatest(0, 5 - extract(epoch from age(now(), p.created_at)) / 86400 * 0.05)::real

    )::real AS rank,

    c.name AS category_name,
    pr.full_name AS user_full_name,
    pr.avatar_url AS user_avatar_url,
    pr.rating AS user_rating,
    pr.total_reviews AS user_total_reviews

  FROM posts p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN profiles pr ON pr.id = p.user_id
  WHERE
    p.status = 'active'
    AND p.is_deleted = false
    AND (
      -- STRICT REQUIREMENTS - must match at least:

      -- A) Exact phrase in title OR description
      lower(unaccent(p.title)) LIKE '%' || normalized_query || '%'
      OR
      lower(unaccent(p.description)) LIKE '%' || normalized_query || '%'

      OR

      -- B) At least 70% of query words must appear in title or description
      (
        SELECT count(*) >= greatest(1, (word_count * 0.7)::integer)
        FROM unnest(query_words) AS qw
        WHERE
          lower(unaccent(p.title)) LIKE '%' || qw || '%'
          OR
          lower(unaccent(p.description)) LIKE '%' || qw || '%'
      )

      OR

      -- C) Category name matches
      lower(unaccent(c.name)) LIKE '%' || normalized_query || '%'
    )
  ORDER BY rank DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION search_posts(text, integer) TO authenticated, anon;
