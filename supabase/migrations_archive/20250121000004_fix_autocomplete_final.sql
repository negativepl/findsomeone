-- FINAL FIX for autocomplete
-- Problem: Complicated phrase extraction doesn't work
-- Solution: Simple, fast autocomplete from actual titles + categories

-- Drop existing function first
drop function if exists get_autocomplete_suggestions(text, integer);

-- Create new simplified version
create or replace function get_autocomplete_suggestions(
  search_prefix text,
  limit_count integer default 10
)
returns table(suggestion text, match_count bigint) as $$
declare
  normalized_prefix text;
begin
  normalized_prefix := lower(unaccent(trim(search_prefix)));

  return query
  with
  -- 1. Get matching titles (exact substring match)
  matching_titles as (
    select
      lower(strip_html_tags(p.title)) as clean_title,
      p.created_at
    from posts p
    where
      p.status = 'active'
      and lower(unaccent(p.title)) like '%' || normalized_prefix || '%'
    order by p.created_at desc
    limit 50
  ),
  -- 2. Extract words that start with the prefix
  title_words as (
    select unnest(string_to_array(clean_title, ' ')) as word
    from matching_titles
  ),
  filtered_words as (
    select lower(trim(word)) as clean_word
    from title_words
    where
      length(trim(word)) >= 3
      and lower(trim(word)) like normalized_prefix || '%'
      and trim(word) !~ '[<>&-]'
  ),
  word_suggestions as (
    select clean_word as suggestion_text, 1 as priority
    from filtered_words
  ),
  -- 3. Get matching categories
  category_suggestions as (
    select
      lower(c.name) as suggestion_text,
      3 as priority
    from categories c
    where
      lower(unaccent(c.name)) like '%' || normalized_prefix || '%'

    union all

    -- Also check category synonyms
    select
      lower(c.name) as suggestion_text,
      3 as priority
    from categories c
    join category_synonyms cs on cs.category_id = c.id
    where
      lower(unaccent(cs.synonym)) like '%' || normalized_prefix || '%'
  ),
  -- 4. Get category + city combinations
  category_city as (
    select distinct
      lower(c.name || ' ' || p.city) as suggestion_text,
      2 as priority
    from posts p
    join categories c on c.id = p.category_id
    where
      p.status = 'active'
      and p.city is not null
      and (
        lower(unaccent(c.name)) like '%' || normalized_prefix || '%'
        or lower(unaccent(p.city)) like normalized_prefix || '%'
      )
    limit 5
  ),
  -- 5. Get popular search patterns if query matches
  pattern_suggestions as (
    select
      pattern || ' ' || lower(c.name) as suggestion_text,
      2 as priority
    from categories c,
      unnest(array['szukam', 'potrzebuję', 'oferuję']) as pattern
    where
      lower(unaccent(c.name)) like '%' || normalized_prefix || '%'
      or pattern like normalized_prefix || '%'
    limit 3
  ),
  -- Combine all
  all_suggestions as (
    select * from word_suggestions
    union all
    select * from category_suggestions
    union all
    select * from category_city
    union all
    select * from pattern_suggestions
  ),
  -- Count and rank
  counted as (
    select
      suggestion_text,
      count(*) * max(priority) as score
    from all_suggestions
    where length(suggestion_text) >= 3
    group by suggestion_text
  )
  select
    suggestion_text as suggestion,
    score as match_count
  from counted
  order by
    -- Exact match first
    case when suggestion_text = normalized_prefix then 0 else 1 end,
    -- Then by score (categories ranked higher)
    score desc,
    -- Then alphabetically
    suggestion_text
  limit limit_count;
end;
$$ language plpgsql security definer;

-- Grant permissions
grant execute on function get_autocomplete_suggestions(text, integer) to authenticated, anon;
