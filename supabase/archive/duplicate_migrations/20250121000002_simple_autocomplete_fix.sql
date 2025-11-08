-- Simplified autocomplete that actually works
-- Returns phrases from titles that match the search query

create or replace function get_autocomplete_suggestions(
  search_prefix text,
  limit_count integer default 10
)
returns table(suggestion text, match_count bigint) as $$
begin
  return query
  with matching_titles as (
    -- Get titles that contain the search term
    select
      lower(strip_html_tags(p.title)) as clean_title,
      c.name as category_name,
      p.city
    from posts p
    left join categories c on p.category_id = c.id
    where
      p.status = 'active'
      and (
        lower(p.title) like '%' || lower(search_prefix) || '%'
        or lower(c.name) like '%' || lower(search_prefix) || '%'
      )
    limit 100
  ),
  -- Extract individual words
  words as (
    select unnest(string_to_array(clean_title, ' ')) as word
    from matching_titles
    where clean_title is not null
  ),
  -- Get matching words
  matching_words as (
    select lower(trim(word)) as clean_word
    from words
    where
      lower(trim(word)) like lower(search_prefix) || '%'
      and length(trim(word)) >= 3
      and trim(word) !~ '[<>]'
  ),
  -- Get categories
  matching_categories as (
    select distinct lower(category_name) as suggestion_text
    from matching_titles
    where category_name is not null
    and lower(category_name) like '%' || lower(search_prefix) || '%'
  ),
  -- Get category + city combos
  category_city as (
    select distinct lower(category_name || ' ' || city) as suggestion_text
    from matching_titles
    where
      category_name is not null
      and city is not null
      and (
        lower(category_name) like '%' || lower(search_prefix) || '%'
        or lower(city) like '%' || lower(search_prefix) || '%'
      )
    limit 5
  ),
  -- Combine all
  all_suggestions as (
    select clean_word as suggestion_text, 1 as priority
    from matching_words

    union all

    select suggestion_text, 3 as priority
    from matching_categories

    union all

    select suggestion_text, 2 as priority
    from category_city
  ),
  -- Count and deduplicate
  counted as (
    select
      suggestion_text,
      count(*) * priority as score
    from all_suggestions
    group by suggestion_text, priority
  )
  select
    suggestion_text as suggestion,
    score as match_count
  from counted
  where length(suggestion_text) >= 3
  order by
    -- Exact match first
    case when suggestion_text = lower(search_prefix) then 0 else 1 end,
    -- Then by score
    score desc,
    -- Then alphabetically
    suggestion_text
  limit limit_count;
end;
$$ language plpgsql security definer;
