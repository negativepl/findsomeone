-- SIMPLE AUTOCOMPLETE THAT ACTUALLY WORKS
-- No fancy logic, just SHOW RESULTS

drop function if exists get_autocomplete_suggestions(text, integer);

create or replace function get_autocomplete_suggestions(
  search_prefix text,
  limit_count integer default 10
)
returns table(suggestion text, match_count bigint) as $$
begin
  return query
  with
  -- 1. Get matching CATEGORIES with paths and format
  category_suggestions as (
    select
      case
        when c.parent_id is not null then
          -- Format: "query w kategorii Parent > Child"
          search_prefix || ' w kategorii ' ||
          (select name from categories where id = c.parent_id) || ' > ' || c.name
        else
          -- Format: "query w kategorii Category"
          search_prefix || ' w kategorii ' || c.name
      end as suggestion_text,
      100000::bigint as score
    from categories c
    where
      lower(c.name) like '%' || lower(search_prefix) || '%'
      or lower(c.slug) like '%' || lower(search_prefix) || '%'
    limit 5
  ),

  -- 2. Get PHRASES from post titles (simple 2-3 word extraction)
  post_phrases as (
    select distinct
      lower(
        substring(
          p.title
          from position(lower(search_prefix) in lower(p.title))
          for 40
        )
      ) as suggestion_text,
      500::bigint as score
    from posts p
    where
      p.status = 'active'
      and lower(p.title) like '%' || lower(search_prefix) || '%'
    limit 10
  ),

  -- 3. Combine
  all_suggestions as (
    select suggestion_text, score from category_suggestions
    where suggestion_text is not null

    union all

    select suggestion_text, score from post_phrases
    where
      suggestion_text is not null
      and length(trim(suggestion_text)) >= 3
      and length(trim(suggestion_text)) <= 60
  )

  -- Return deduplicated results
  select
    trim(suggestion_text) as suggestion,
    max(score) as match_count
  from all_suggestions
  where trim(suggestion_text) != ''
  group by trim(suggestion_text)
  order by max(score) desc, trim(suggestion_text)
  limit limit_count;

end;
$$ language plpgsql security definer;

grant execute on function get_autocomplete_suggestions(text, integer) to authenticated, anon;
