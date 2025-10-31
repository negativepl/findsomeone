-- Add full-text search to posts table
-- This enables intelligent searching through post titles and descriptions

-- Enable required extensions (flexible for any language)
create extension if not exists unaccent;
create extension if not exists pg_trgm;

-- Add a full-text search column (tsvector) for better performance
alter table posts add column if not exists search_vector tsvector;

-- Add trigram columns for fuzzy/typo-tolerant search
alter table posts add column if not exists title_trgm text;
alter table posts add column if not exists description_trgm text;

-- Create index for full-text search (CRITICAL for performance!)
create index if not exists posts_search_vector_idx on posts using gin(search_vector);

-- Create trigram indexes for fuzzy search (finds typos!)
create index if not exists posts_title_trgm_idx on posts using gin(title_trgm gin_trgm_ops);
create index if not exists posts_description_trgm_idx on posts using gin(description_trgm gin_trgm_ops);

-- Function to update search vector automatically
create or replace function posts_search_vector_update()
returns trigger as $$
begin
  -- Normalize text: lowercase + remove accents (works for ANY language!)
  -- This makes "Elektryka" = "elektryka" = "ELEKTRYKA"
  new.search_vector :=
    setweight(to_tsvector('simple', lower(unaccent(coalesce(new.title, '')))), 'A') ||
    setweight(to_tsvector('simple', lower(unaccent(coalesce(new.description, '')))), 'B') ||
    setweight(to_tsvector('simple', lower(unaccent(coalesce(new.city, '')))), 'C');

  -- Update trigram columns for fuzzy search (typo tolerance)
  new.title_trgm := lower(unaccent(coalesce(new.title, '')));
  new.description_trgm := lower(unaccent(coalesce(new.description, '')));

  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update search_vector on insert/update
drop trigger if exists posts_search_vector_trigger on posts;
create trigger posts_search_vector_trigger
  before insert or update on posts
  for each row
  execute function posts_search_vector_update();

-- Update existing posts with search vectors and trigrams
update posts set
  search_vector =
    setweight(to_tsvector('simple', lower(unaccent(coalesce(title, '')))), 'A') ||
    setweight(to_tsvector('simple', lower(unaccent(coalesce(description, '')))), 'B') ||
    setweight(to_tsvector('simple', lower(unaccent(coalesce(city, '')))), 'C'),
  title_trgm = lower(unaccent(coalesce(title, ''))),
  description_trgm = lower(unaccent(coalesce(description, '')))
where search_vector is null or title_trgm is null;

-- Function for intelligent full-text search with fuzzy matching
create or replace function search_posts(
  search_query text,
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
  rank real,
  category_name text,
  user_full_name text,
  user_avatar_url text,
  user_rating numeric
) as $$
declare
  normalized_query text;
  expanded_query text;
begin
  -- Normalize the search query (works for any language/text)
  normalized_query := lower(unaccent(trim(search_query)));

  -- Expand with synonyms (flexible - reads from database!)
  -- This makes "sprzątaczka" also find "pomoc domowa" posts
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
    -- FLEXIBLE RANKING ALGORITHM (works for everything!)
    -- Combines multiple signals for best results:
    (
      -- 1. Full-text match score (most important)
      -- Uses expanded query with synonyms!
      ts_rank(p.search_vector, websearch_to_tsquery('simple', expanded_query)) * 100 +

      -- 2. Trigram similarity for typo tolerance (finds "hydrualik" when searching "hydraulik")
      greatest(
        similarity(p.title_trgm, normalized_query),
        similarity(p.description_trgm, normalized_query)
      ) * 50 +

      -- 3. Exact phrase bonus (rewards exact matches)
      case
        when p.title_trgm ilike '%' || normalized_query || '%' then 20
        when p.description_trgm ilike '%' || normalized_query || '%' then 10
        else 0
      end +

      -- 4. Recency bonus (newer posts get slight boost)
      greatest(0, 10 - extract(epoch from age(now(), p.created_at)) / 86400 * 0.1)::real +

      -- 5. User rating bonus (quality matters!)
      coalesce(pr.rating, 0) * 2
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
      -- Match either through full-text search (with synonyms!)
      p.search_vector @@ websearch_to_tsquery('simple', expanded_query)
      or
      -- OR through fuzzy trigram matching (catches typos!)
      similarity(p.title_trgm, normalized_query) > 0.3
      or
      similarity(p.description_trgm, normalized_query) > 0.2
    )
  order by rank desc
  limit limit_count;
end;
$$ language plpgsql security definer;

-- Function to strip HTML tags and clean text
create or replace function strip_html_tags(input_text text)
returns text as $$
begin
  -- Remove HTML tags and decode entities
  return regexp_replace(
    regexp_replace(input_text, '<[^>]*>', '', 'g'),
    '&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;',
    ' ',
    'g'
  );
end;
$$ language plpgsql immutable;

-- Function to get autocomplete suggestions from actual post content
create or replace function get_autocomplete_suggestions(
  search_prefix text,
  limit_count integer default 10
)
returns table(suggestion text, match_count bigint) as $$
begin
  return query
  -- Extract common phrases from titles ONLY (not descriptions) to avoid junk
  with matching_posts as (
    select
      strip_html_tags(title) as clean_title,
      ts_rank(search_vector, websearch_to_tsquery('simple', search_prefix)) as rank
    from posts
    where
      status = 'active'
      and title ilike '%' || search_prefix || '%'
    order by rank desc
    limit 50
  ),
  -- Extract words from titles only
  phrases as (
    select
      unnest(string_to_array(lower(clean_title), ' ')) as word
    from matching_posts
    where clean_title is not null
  ),
  -- Filter relevant words (remove empty, short, and HTML artifacts)
  relevant_words as (
    select trim(word) as clean_word
    from phrases
    where
      trim(word) != ''
      and length(trim(word)) >= 3
      and trim(word) like lower(search_prefix) || '%'
      and trim(word) !~ '[<>]'  -- No angle brackets
      and trim(word) !~ '^&'     -- No HTML entities
      and trim(word) !~ '^-'     -- No leading dash
      and trim(word) !~ '-$'     -- No trailing dash
  )
  select
    clean_word as suggestion,
    count(*) as match_count
  from relevant_words
  group by clean_word
  order by match_count desc, clean_word
  limit limit_count;
end;
$$ language plpgsql security definer;

-- Grant execute permissions
grant execute on function search_posts(text, integer) to authenticated, anon;
grant execute on function get_autocomplete_suggestions(text, integer) to authenticated, anon;
