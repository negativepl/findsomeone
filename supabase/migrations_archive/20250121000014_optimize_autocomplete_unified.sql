-- OPTIMIZED AUTOCOMPLETE - Single unified query instead of 6 separate queries
-- This dramatically improves performance by reducing database round-trips

-- First, improve the phrase extraction with n-grams (2-4 word phrases)
drop function if exists get_autocomplete_suggestions(text, integer);

create or replace function get_autocomplete_suggestions(
  search_prefix text,
  limit_count integer default 10
)
returns table(suggestion text, match_count bigint) as $$
declare
  clean_prefix text;
begin
  clean_prefix := lower(trim(search_prefix));

  -- Return empty if too short
  if length(clean_prefix) < 1 then
    return;
  end if;

  return query
  with
  -- CATEGORIES (formatted as "query w kategorii Category")
  categories_formatted as (
    select
      clean_prefix || ' w kategorii ' || c.name as text,
      10000 as priority
    from categories c
    where lower(unaccent(c.name)) like '%' || clean_prefix || '%'
    limit 5
  ),

  -- IMPROVED PHRASE EXTRACTION using n-grams (2-4 word phrases)
  matching_posts as (
    select
      p.id,
      lower(p.title) as title,
      array_length(string_to_array(p.title, ' '), 1) as word_count
    from posts p
    where
      p.status = 'active'
      and lower(p.title) like '%' || clean_prefix || '%'
    order by p.created_at desc
    limit 50
  ),

  -- Extract meaningful 2-3 word phrases
  word_positions as (
    select
      mp.id,
      word,
      ordinality as pos,
      mp.word_count
    from matching_posts mp,
    lateral unnest(string_to_array(mp.title, ' ')) with ordinality as word
  ),

  -- Create bigrams (2-word phrases)
  bigrams as (
    select distinct
      w1.word || ' ' || w2.word as phrase,
      500 as priority
    from word_positions w1
    join word_positions w2 on w2.id = w1.id and w2.pos = w1.pos + 1
    where
      (w1.word like clean_prefix || '%' or w2.word like clean_prefix || '%')
      and length(w1.word) >= 3
      and length(w2.word) >= 3
      and w1.word !~ '^[0-9]+$'  -- no pure numbers
      and w2.word !~ '^[0-9]+$'
    limit 20
  ),

  -- Create trigrams (3-word phrases)
  trigrams as (
    select distinct
      w1.word || ' ' || w2.word || ' ' || w3.word as phrase,
      600 as priority
    from word_positions w1
    join word_positions w2 on w2.id = w1.id and w2.pos = w1.pos + 1
    join word_positions w3 on w3.id = w1.id and w3.pos = w1.pos + 2
    where
      (w1.word like clean_prefix || '%' or w2.word like clean_prefix || '%' or w3.word like clean_prefix || '%')
      and length(w1.word) >= 3
      and length(w2.word) >= 2
      and length(w3.word) >= 3
      and w1.word !~ '^[0-9]+$'
      and w3.word !~ '^[0-9]+$'
    limit 15
  ),

  -- ALL suggestions combined
  all_sugg as (
    select text, priority from categories_formatted
    union all
    select phrase as text, priority from bigrams
    where phrase is not null and length(phrase) >= 3
    union all
    select phrase as text, priority from trigrams
    where phrase is not null and length(phrase) >= 3
  ),

  -- Filter and validate all suggestions
  filtered_sugg as (
    select text, priority
    from all_sugg
    where text is not null
      and length(text) >= 3
      and length(text) <= 100
      and text ~ '^[a-ząćęłńóśźż0-9\s\-]+$'  -- Polish chars only, no HTML
  )

  select
    text as suggestion,
    max(priority)::bigint as match_count
  from filtered_sugg
  where trim(text) != ''
  group by text
  order by max(priority) desc, text
  limit limit_count;

end;
$$ language plpgsql security definer;

grant execute on function get_autocomplete_suggestions(text, integer) to authenticated, anon;

-- NEW: Unified autocomplete function that returns ALL data in one query
-- This replaces 6 separate API calls with a single database call
create or replace function get_unified_autocomplete(
  search_query text,
  user_id uuid default null,
  include_smart boolean default false
)
returns json as $$
declare
  result json;
  clean_query text;
begin
  clean_query := lower(trim(search_query));

  -- Build unified result with all autocomplete data
  select json_build_object(
    'categories',
    (
      select coalesce(json_agg(row_to_json(c)), '[]'::json)
      from (
        select id, name, slug
        from search_categories_unaccent(clean_query, 5)
      ) c
    ),
    'suggestions',
    (
      select coalesce(json_agg(row_to_json(s)), '[]'::json)
      from (
        select suggestion as text, match_count
        from get_autocomplete_suggestions(clean_query, 12)
      ) s
    ),
    'popular',
    (
      select coalesce(json_agg(row_to_json(p)), '[]'::json)
      from (
        select query as text, search_count
        from get_popular_searches(7, 8)
      ) p
    ),
    'trending',
    (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select query as text, search_count, growth_rate
        from get_trending_searches(5)
      ) t
    ),
    'smart',
    case
      when include_smart and user_id is not null then
        (
          select coalesce(json_agg(row_to_json(sm)), '[]'::json)
          from (
            select suggestion_text as text, suggestion_type as type, relevance_score as score
            from get_smart_suggestions(user_id, 5)
          ) sm
        )
      else '[]'::json
    end
  ) into result;

  return result;
end;
$$ language plpgsql security definer;

grant execute on function get_unified_autocomplete(text, uuid, boolean) to authenticated, anon;

comment on function get_unified_autocomplete is
  'Returns all autocomplete data in a single query: categories, suggestions, popular, trending, and optionally smart suggestions for logged-in users.';
