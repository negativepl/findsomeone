-- COMPLETE REWRITE - STRICT MATCHING ONLY
-- NO MORE FALSE POSITIVES
-- "opiekun dla psa" should ONLY return dog care posts, NOT soccer training!

drop function if exists search_posts(text, integer);

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
  query_words text[];
  word_count integer;
begin
  -- Normalize query
  normalized_query := lower(unaccent(trim(search_query)));

  -- Extract words (min 3 chars, ignore common words)
  query_words := array(
    select word
    from unnest(string_to_array(normalized_query, ' ')) as word
    where
      length(word) >= 3
      and word not in ('dla', 'the', 'and', 'lub', 'albo', 'oraz')
  );

  word_count := array_length(query_words, 1);

  -- If no valid words, return empty
  if word_count is null or word_count = 0 then
    return;
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

    -- STRICT RANKING - only words that actually match
    (
      -- 1. EXACT PHRASE in title (HIGHEST PRIORITY)
      case
        when lower(unaccent(p.title)) like '%' || normalized_query || '%' then 1000
        else 0
      end +

      -- 2. EXACT PHRASE in description
      case
        when lower(unaccent(p.description)) like '%' || normalized_query || '%' then 500
        else 0
      end +

      -- 3. Count how many query words appear in title
      (
        select count(*)::real * 100
        from unnest(query_words) as qw
        where lower(unaccent(p.title)) like '%' || qw || '%'
      ) +

      -- 4. Count how many query words appear in description
      (
        select count(*)::real * 50
        from unnest(query_words) as qw
        where lower(unaccent(p.description)) like '%' || qw || '%'
      ) +

      -- 5. Category name match
      case
        when lower(unaccent(c.name)) like '%' || normalized_query || '%' then 200
        else 0
      end +

      -- 6. Recency bonus (small)
      greatest(0, 5 - extract(epoch from age(now(), p.created_at)) / 86400 * 0.05)::real

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
      -- STRICT REQUIREMENTS - must match at least:

      -- A) Exact phrase in title OR description
      lower(unaccent(p.title)) like '%' || normalized_query || '%'
      or
      lower(unaccent(p.description)) like '%' || normalized_query || '%'

      or

      -- B) At least 70% of query words must appear in title or description
      (
        select count(*) >= greatest(1, (word_count * 0.7)::integer)
        from unnest(query_words) as qw
        where
          lower(unaccent(p.title)) like '%' || qw || '%'
          or
          lower(unaccent(p.description)) like '%' || qw || '%'
      )

      or

      -- C) Category name matches
      lower(unaccent(c.name)) like '%' || normalized_query || '%'
    )
  order by rank desc
  limit limit_count;
end;
$$ language plpgsql security definer;

grant execute on function search_posts(text, integer) to authenticated, anon;
