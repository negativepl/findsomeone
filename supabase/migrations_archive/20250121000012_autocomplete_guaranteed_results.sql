-- GUARANTEED RESULTS - Simple autocomplete that MUST work
-- Shows: categories + actual search phrases from posts

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
    where lower(c.name) like '%' || clean_prefix || '%'
    limit 5
  ),

  -- SIMPLE PHRASES from titles (just extract around the search term)
  simple_phrases as (
    select distinct
      regexp_replace(
        lower(
          substring(
            title from
            greatest(1, position(clean_prefix in lower(title)) - 10)
            for 50
          )
        ),
        '^\s+|\s+$', '', 'g'
      ) as text,
      100 as priority
    from posts
    where
      status = 'active'
      and lower(title) like '%' || clean_prefix || '%'
    limit 10
  ),

  -- ALL suggestions
  all_sugg as (
    select text, priority from categories_formatted
    union all
    select text, priority from simple_phrases
    where text is not null and length(text) >= 3
  )

  select
    text as suggestion,
    max(priority)::bigint as match_count
  from all_sugg
  where text is not null and trim(text) != ''
  group by text
  order by max(priority) desc
  limit limit_count;

end;
$$ language plpgsql security definer;

grant execute on function get_autocomplete_suggestions(text, integer) to authenticated, anon;
