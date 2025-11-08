-- Improved autocomplete that shows full phrases and category-aware suggestions
-- Example: "ogłoszenia" → "ogłoszenia Warszawa", "ogłoszenia praca", "szukam ogłoszenia"

-- 1. Create function to extract meaningful phrases (2-4 words)
create or replace function get_phrase_suggestions(
  search_prefix text,
  limit_count integer default 10
)
returns table(suggestion text, match_count bigint, suggestion_type text) as $$
begin
  return query
  with matching_posts as (
    select
      strip_html_tags(title) as clean_title,
      c.name as category_name,
      p.city,
      ts_rank(p.search_vector, websearch_to_tsquery('simple', search_prefix)) as rank
    from posts p
    left join categories c on p.category_id = c.id
    where
      p.status = 'active'
      and (
        p.title ilike '%' || search_prefix || '%'
        or c.name ilike '%' || search_prefix || '%'
      )
    order by rank desc
    limit 100
  ),
  -- Extract 2-word phrases
  two_word_phrases as (
    select
      lower(trim(
        split_part(clean_title, ' ', i) || ' ' || split_part(clean_title, ' ', i+1)
      )) as phrase,
      'phrase' as phrase_type
    from matching_posts,
      generate_series(1, greatest(1, array_length(string_to_array(clean_title, ' '), 1) - 1)) as i
    where
      clean_title is not null
      and length(split_part(clean_title, ' ', i)) >= 3
      and length(split_part(clean_title, ' ', i+1)) >= 2
  ),
  -- Extract 3-word phrases
  three_word_phrases as (
    select
      lower(trim(
        split_part(clean_title, ' ', i) || ' ' ||
        split_part(clean_title, ' ', i+1) || ' ' ||
        split_part(clean_title, ' ', i+2)
      )) as phrase,
      'phrase' as phrase_type
    from matching_posts,
      generate_series(1, greatest(1, array_length(string_to_array(clean_title, ' '), 1) - 2)) as i
    where
      clean_title is not null
      and length(split_part(clean_title, ' ', i)) >= 3
  ),
  -- Category + city combinations
  category_city_combos as (
    select distinct
      lower(category_name || ' ' || city) as phrase,
      'combo' as phrase_type
    from matching_posts
    where category_name is not null and city is not null
  ),
  -- Category alone
  category_suggestions as (
    select distinct
      lower(category_name) as phrase,
      'category' as phrase_type
    from matching_posts
    where category_name is not null
  ),
  -- Combine all phrases
  all_phrases as (
    select phrase, phrase_type from two_word_phrases
    union all
    select phrase, phrase_type from three_word_phrases
    union all
    select phrase, phrase_type from category_city_combos
    union all
    select phrase, phrase_type from category_suggestions
  ),
  -- Filter and clean
  filtered_phrases as (
    select
      phrase,
      phrase_type
    from all_phrases
    where
      phrase is not null
      and phrase like '%' || lower(search_prefix) || '%'
      and length(phrase) >= length(search_prefix)
      and length(phrase) <= 80
      and phrase !~ '[<>]'
      and phrase !~ '^&'
      and phrase !~ '^-'
      and phrase !~ '-$'
      and phrase !~ '^\s'
      and phrase !~ '\s$'
  )
  select
    phrase as suggestion,
    count(*) as match_count,
    phrase_type as suggestion_type
  from filtered_phrases
  group by phrase, phrase_type
  order by
    -- Prioritize exact prefix matches
    case when phrase like lower(search_prefix) || '%' then 0 else 1 end,
    -- Then by popularity
    count(*) desc,
    -- Then alphabetically
    phrase
  limit limit_count;
end;
$$ language plpgsql security definer;

-- 2. Create function for smart category-based suggestions
create or replace function get_category_smart_suggestions(
  search_term text,
  limit_count integer default 8
)
returns table(suggestion text, suggestion_type text) as $$
declare
  matched_category text;
begin
  -- Find matching category
  select c.name into matched_category
  from categories c
  where
    lower(unaccent(c.name)) like '%' || lower(unaccent(search_term)) || '%'
    or exists (
      select 1 from category_synonyms cs
      where cs.category_id = c.id
      and lower(unaccent(cs.synonym)) like '%' || lower(unaccent(search_term)) || '%'
    )
  order by
    case when lower(c.name) = lower(search_term) then 0 else 1 end,
    c.name
  limit 1;

  -- If we found a category, return smart suggestions
  if matched_category is not null then
    return query
    with top_cities as (
      select city, count(*) as post_count
      from posts p
      join categories c on p.category_id = c.id
      where
        c.name = matched_category
        and p.status = 'active'
        and p.city is not null
      group by city
      order by post_count desc
      limit 5
    ),
    common_patterns as (
      select unnest(array['szukam', 'potrzebuję', 'pilnie', 'tanio', 'sprawdzony']) as pattern
    ),
    all_suggestions as (
      -- Category + city
      select
        lower(matched_category || ' ' || city) as suggestion,
        'combo'::text as suggestion_type,
        1 as priority
      from top_cities

      union all

      -- Pattern + category
      select
        lower(pattern || ' ' || matched_category) as suggestion,
        'pattern'::text as suggestion_type,
        2 as priority
      from common_patterns

      union all

      -- Just category
      select
        lower(matched_category) as suggestion,
        'category'::text as suggestion_type,
        0 as priority
    )
    select
      all_suggestions.suggestion,
      all_suggestions.suggestion_type
    from all_suggestions
    order by priority
    limit limit_count;
  end if;

  return;
end;
$$ language plpgsql security definer;

-- 3. Update main autocomplete function
create or replace function get_autocomplete_suggestions(
  search_prefix text,
  limit_count integer default 10
)
returns table(suggestion text, match_count bigint) as $$
begin
  return query
  with phrase_suggestions as (
    select
      ps.suggestion,
      ps.match_count,
      ps.suggestion_type,
      -- Boost score for certain types
      case
        when ps.suggestion_type = 'category' then ps.match_count * 3
        when ps.suggestion_type = 'combo' then ps.match_count * 2
        else ps.match_count
      end as boosted_score
    from get_phrase_suggestions(search_prefix, limit_count * 2) ps
  ),
  smart_suggestions as (
    select
      cs.suggestion,
      10::bigint as match_count,  -- Give smart suggestions good score
      cs.suggestion_type,
      10::bigint as boosted_score
    from get_category_smart_suggestions(search_prefix, 5) cs
  ),
  all_suggestions as (
    select * from phrase_suggestions
    union all
    select * from smart_suggestions
  ),
  deduped as (
    select distinct on (lower(suggestion))
      suggestion,
      boosted_score
    from all_suggestions
    order by lower(suggestion), boosted_score desc
  )
  select
    suggestion,
    boosted_score as match_count
  from deduped
  order by
    -- Exact prefix match first
    case when lower(suggestion) like lower(search_prefix) || '%' then 0 else 1 end,
    -- Then by score
    boosted_score desc,
    -- Then alphabetically
    suggestion
  limit limit_count;
end;
$$ language plpgsql security definer;
