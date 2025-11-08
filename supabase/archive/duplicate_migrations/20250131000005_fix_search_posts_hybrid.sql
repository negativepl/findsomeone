-- Fix search_posts_hybrid and search_posts_semantic functions
-- Removes references to non-existent columns: 'type', 'price_min', 'price_max'
-- Uses correct column names: 'price', 'price_type'

-- Drop old functions first (required because return type changed)
drop function if exists search_posts_hybrid(text, vector, integer);
drop function if exists search_posts_semantic(vector, float, integer);

create or replace function search_posts_hybrid(
  search_query text,
  query_embedding vector(1536),
  limit_count integer default 20
)
returns table(
  id uuid,
  title text,
  description text,
  city text,
  district text,
  price numeric,
  price_type text,
  images text[],
  created_at timestamptz,
  combined_score float,
  category_name text,
  user_full_name text,
  user_avatar_url text,
  user_rating numeric
) as $$
declare
  normalized_query text;
  expanded_query text;
begin
  -- Normalize and expand query
  normalized_query := lower(unaccent(trim(search_query)));
  expanded_query := expand_search_with_synonyms(normalized_query);

  return query
  select
    p.id,
    p.title,
    p.description,
    p.city,
    p.district,
    p.price,
    p.price_type,
    p.images,
    p.created_at,
    -- HYBRID SCORING: 60% semantic similarity + 40% full-text relevance
    (
      -- Semantic similarity (0-1)
      case
        when p.embedding is not null
        then (1 - (p.embedding <=> query_embedding)) * 0.6
        else 0
      end +

      -- Full-text relevance (normalized to 0-1)
      (
        ts_rank(p.search_vector, websearch_to_tsquery('simple', expanded_query)) +
        greatest(
          similarity(p.title_trgm, normalized_query),
          similarity(p.description_trgm, normalized_query)
        ) * 0.5 +
        case
          when p.title_trgm ilike '%' || normalized_query || '%' then 0.2
          when p.description_trgm ilike '%' || normalized_query || '%' then 0.1
          else 0
        end
      ) * 0.4
    )::float as combined_score,

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
      -- Must match either semantic OR full-text
      (p.embedding is not null and (1 - (p.embedding <=> query_embedding)) > 0.6)
      or
      (
        p.search_vector @@ websearch_to_tsquery('simple', expanded_query)
        or similarity(p.title_trgm, normalized_query) > 0.3
        or similarity(p.description_trgm, normalized_query) > 0.2
      )
    )
  order by combined_score desc
  limit limit_count;
end;
$$ language plpgsql security definer;

-- Also fix search_posts_semantic if it has the same issue
create or replace function search_posts_semantic(
  query_embedding vector(1536),
  similarity_threshold float default 0.7,
  limit_count integer default 20
)
returns table(
  id uuid,
  title text,
  description text,
  city text,
  district text,
  price numeric,
  price_type text,
  images text[],
  created_at timestamptz,
  similarity float,
  category_name text,
  user_full_name text,
  user_avatar_url text,
  user_rating numeric
) as $$
begin
  return query
  select
    p.id,
    p.title,
    p.description,
    p.city,
    p.district,
    p.price,
    p.price_type,
    p.images,
    p.created_at,
    -- Calculate cosine similarity (1 = identical, 0 = unrelated)
    (1 - (p.embedding <=> query_embedding))::float as similarity,
    c.name as category_name,
    pr.full_name as user_full_name,
    pr.avatar_url as user_avatar_url,
    pr.rating as user_rating
  from posts p
  left join categories c on c.id = p.category_id
  left join profiles pr on pr.id = p.user_id
  where
    p.status = 'active'
    and p.embedding is not null
    -- Only return results above similarity threshold
    and (1 - (p.embedding <=> query_embedding)) > similarity_threshold
  order by p.embedding <=> query_embedding -- Cosine distance (lower = more similar)
  limit limit_count;
end;
$$ language plpgsql security definer;

-- Grant permissions
grant execute on function search_posts_semantic(vector, float, integer) to authenticated, anon;
grant execute on function search_posts_hybrid(text, vector, integer) to authenticated, anon;

comment on function search_posts_semantic is 'Semantic search using OpenAI embeddings with cosine similarity (FIXED: uses price instead of price_min/price_max)';
comment on function search_posts_hybrid is 'Hybrid search combining semantic embeddings (60%) and full-text search (40%) (FIXED: uses price instead of price_min/price_max)';
