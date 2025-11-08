-- FIX CRITICAL SEARCH BUG
-- Problem: Trigram similarity thresholds are too low (0.2-0.3)
-- This causes "biżuteria i zegarki" to match "opieka nad psem"
-- Solution: Increase thresholds and improve ranking

-- Drop existing function first
drop function if exists search_posts(text, integer);

-- Create new improved version
create or replace function search_posts(
  search_query text,
  limit_count integer default 20
)
returns table(
  id uuid,
  title text,
  description text,
  type text,
  city text,
  district text,
  price_min numeric,
  price_max numeric,
  price_type text,
  images text[],
  created_at timestamptz,
  user_id uuid,
  rank real,
  category_name text,
  user_full_name text,
  user_avatar_url text,
  user_rating numeric
) as $$
declare
  normalized_query text;
  expanded_query text;
  query_length integer;
begin
  -- Normalize the search query
  normalized_query := lower(unaccent(trim(search_query)));
  query_length := length(normalized_query);

  -- Expand with synonyms (only for SHORT queries to avoid over-matching)
  if query_length <= 20 then
    expanded_query := expand_search_with_synonyms(normalized_query);
  else
    expanded_query := normalized_query;
  end if;

  return query
  select
    p.id,
    p.title,
    p.description,
    p.type,
    p.city,
    p.district,
    p.price_min,
    p.price_max,
    p.price_type,
    p.images,
    p.created_at,
    p.user_id,
    -- IMPROVED RANKING ALGORITHM
    (
      -- 1. Full-text match score (MOST IMPORTANT)
      ts_rank(p.search_vector, websearch_to_tsquery('simple', expanded_query)) * 200 +

      -- 2. Exact phrase match (VERY HIGH PRIORITY)
      case
        when p.title_trgm ilike '%' || normalized_query || '%' then 100
        when p.description_trgm ilike '%' || normalized_query || '%' then 50
        else 0
      end +

      -- 3. Trigram similarity (ONLY for CLOSE matches)
      -- Increased thresholds to avoid false positives
      case
        when similarity(p.title_trgm, normalized_query) > 0.6 then
          similarity(p.title_trgm, normalized_query) * 40
        when similarity(p.description_trgm, normalized_query) > 0.5 then
          similarity(p.description_trgm, normalized_query) * 20
        else 0
      end +

      -- 4. Word match scoring (NEW - checks if words from query appear in title)
      (
        select count(*)::real * 15
        from unnest(string_to_array(normalized_query, ' ')) as query_word
        where length(query_word) >= 3
        and p.title_trgm like '%' || query_word || '%'
      ) +

      -- 5. Recency bonus (newer posts get slight boost)
      greatest(0, 5 - extract(epoch from age(now(), p.created_at)) / 86400 * 0.05)::real +

      -- 6. User rating bonus
      coalesce(pr.rating, 0) * 1
    )::real as rank,

    c.name as category_name,
    pr.full_name as user_full_name,
    pr.avatar_url as user_avatar_url,
    pr.rating as user_rating
  from posts p
  left join categories c on c.id = p.category_id
  left join profiles pr on pr.id = p.user_id
  where
    p.status = 'active'
    and (
      -- STRICT MATCHING to avoid false positives

      -- 1. Full-text search match (with synonyms for short queries)
      p.search_vector @@ websearch_to_tsquery('simple', expanded_query)

      or

      -- 2. Exact phrase in title or description (ILIKE)
      p.title_trgm ilike '%' || normalized_query || '%'
      or
      p.description_trgm ilike '%' || normalized_query || '%'

      or

      -- 3. High trigram similarity (INCREASED THRESHOLDS)
      -- Only for close matches to avoid "biżuteria" matching "opieka"
      (
        similarity(p.title_trgm, normalized_query) > 0.6
        or
        similarity(p.description_trgm, normalized_query) > 0.5
      )

      or

      -- 4. Word-based matching (NEW - at least 50% of words must match)
      (
        select count(*) >= greatest(1, array_length(string_to_array(normalized_query, ' '), 1) / 2)
        from unnest(string_to_array(normalized_query, ' ')) as query_word
        where length(query_word) >= 3
        and (
          p.title_trgm like '%' || query_word || '%'
          or
          p.description_trgm like '%' || query_word || '%'
        )
      )
    )
  order by rank desc
  limit limit_count;
end;
$$ language plpgsql security definer;

-- Grant permissions
grant execute on function search_posts(text, integer) to authenticated, anon;
