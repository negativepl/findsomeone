-- Add vector extension for semantic search with embeddings
-- This enables OpenAI embeddings-based semantic search

-- Enable pgvector extension for storing and querying embeddings
create extension if not exists vector;

-- Add embedding column to posts table
-- OpenAI text-embedding-3-small produces 1536-dimensional vectors
alter table posts
  add column if not exists embedding vector(1536);

-- Create index for fast similarity search (HNSW = Hierarchical Navigable Small World)
-- This enables ultra-fast cosine similarity searches even with millions of posts
create index if not exists posts_embedding_idx
  on posts
  using hnsw (embedding vector_cosine_ops);

-- Add embedding metadata
alter table posts
  add column if not exists embedding_model text default 'text-embedding-3-small',
  add column if not exists embedding_updated_at timestamptz;

-- Function to calculate embedding for a post
create or replace function generate_post_embedding_text(post_record posts)
returns text as $$
begin
  -- Combine title, description, category, and city into one text for embedding
  -- This creates a rich semantic representation
  return format(
    'Tytuł: %s. Opis: %s. Kategoria: %s. Miasto: %s. Typ: %s.',
    coalesce(post_record.title, ''),
    coalesce(post_record.description, ''),
    coalesce((select name from categories where id = post_record.category_id), ''),
    coalesce(post_record.city, ''),
    case when post_record.type = 'seeking' then 'Szukam' else 'Oferuję' end
  );
end;
$$ language plpgsql immutable;

-- Grant permissions
grant usage on schema public to authenticated, anon;
grant select on posts to authenticated, anon;

-- Function for semantic search using embeddings
create or replace function search_posts_semantic(
  query_embedding vector(1536),
  similarity_threshold float default 0.7,
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
    p.type,
    p.city,
    p.district,
    p.price_min,
    p.price_max,
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

-- Hybrid search: combine full-text and semantic search
create or replace function search_posts_hybrid(
  search_query text,
  query_embedding vector(1536),
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
    p.type,
    p.city,
    p.district,
    p.price_min,
    p.price_max,
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

-- Grant execute permissions
grant execute on function generate_post_embedding_text(posts) to authenticated, anon;
grant execute on function search_posts_semantic(vector, float, integer) to authenticated, anon;
grant execute on function search_posts_hybrid(text, vector, integer) to authenticated, anon;

-- Add comment
comment on column posts.embedding is 'OpenAI text-embedding-3-small vector (1536 dimensions) for semantic search';
comment on function search_posts_semantic is 'Semantic search using OpenAI embeddings with cosine similarity';
comment on function search_posts_hybrid is 'Hybrid search combining semantic embeddings (60%) and full-text search (40%)';
