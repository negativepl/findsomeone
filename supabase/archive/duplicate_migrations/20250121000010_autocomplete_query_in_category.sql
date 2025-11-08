-- AUTOCOMPLETE FORMAT: "query" w kategorii "Category Path"
-- Example: "hydraulik" w kategorii "Dom i ogród > Hydrauliczne"
-- Like Google/Allegro - shows search term + category context

drop function if exists get_autocomplete_suggestions(text, integer);

create or replace function get_autocomplete_suggestions(
  search_prefix text,
  limit_count integer default 10
)
returns table(suggestion text, match_count bigint) as $$
declare
  normalized_prefix text;
  prefix_pattern text;
begin
  normalized_prefix := lower(unaccent(trim(search_prefix)));

  if length(normalized_prefix) < 1 then
    return;
  end if;

  -- Stemming pattern
  prefix_pattern := regexp_replace(
    normalized_prefix,
    '(a|e|i|y|ę|ą|em|ie|ek|ka|ki|ik|icz|ycz)$',
    '',
    'g'
  );

  return query
  with
  -- 1. CATEGORIES with formatted suggestions: "query" w kategorii "Path"
  category_matches as (
    select
      -- Format: "query" w kategorii "Category" or "Parent > Category"
      case
        when c.parent_id is not null then
          normalized_prefix || ' w kategorii ' ||
          coalesce((select name from categories where id = c.parent_id), '') || ' > ' || c.name
        else
          normalized_prefix || ' w kategorii ' || c.name
      end as suggestion_text,
      -- PRIORITY: exact match at start > contains > stemmed
      case
        when lower(unaccent(c.name)) like normalized_prefix || '%' then 100000
        when lower(unaccent(c.name)) like '%' || normalized_prefix || '%' then 10000
        when lower(unaccent(c.name)) like prefix_pattern || '%' then 5000
        else 1000
      end as priority
    from categories c
    where
      lower(unaccent(c.name)) like '%' || normalized_prefix || '%'
      or (length(prefix_pattern) >= 2 and lower(unaccent(c.name)) like prefix_pattern || '%')
      or (
        c.parent_id is not null
        and exists (
          select 1 from categories parent
          where parent.id = c.parent_id
          and (
            lower(unaccent(parent.name)) like '%' || normalized_prefix || '%'
            or (length(prefix_pattern) >= 2 and lower(unaccent(parent.name)) like prefix_pattern || '%')
          )
        )
      )

    union all

    -- Category synonyms
    select
      case
        when c.parent_id is not null then
          normalized_prefix || ' w kategorii ' ||
          coalesce((select name from categories where id = c.parent_id), '') || ' > ' || c.name
        else
          normalized_prefix || ' w kategorii ' || c.name
      end as suggestion_text,
      case
        when lower(unaccent(cs.synonym)) like normalized_prefix || '%' then 100000
        else 5000
      end as priority
    from categories c
    join category_synonyms cs on cs.category_id = c.id
    where
      lower(unaccent(cs.synonym)) like '%' || normalized_prefix || '%'
      or (length(prefix_pattern) >= 2 and lower(unaccent(cs.synonym)) like prefix_pattern || '%')
  ),

  -- 2. SEARCH PHRASES from post titles (2-3 word combinations)
  phrase_suggestions as (
    select distinct
      lower(unaccent(phrase)) as suggestion_text,
      case
        when phrase like normalized_prefix || '%' then 500
        else 200
      end as priority
    from (
      -- 2-word phrases
      select
        word1 || ' ' || word2 as phrase
      from (
        select
          words[i] as word1,
          words[i+1] as word2
        from (
          select string_to_array(lower(unaccent(strip_html_tags(title))), ' ') as words
          from posts
          where
            status = 'active'
            and (
              lower(unaccent(title)) like '%' || normalized_prefix || '%'
              or (length(prefix_pattern) >= 2 and lower(unaccent(title)) like '%' || prefix_pattern || '%')
            )
          limit 100
        ) t,
        generate_series(1, array_length(words, 1) - 1) as i
      ) pairs
      where
        length(word1) >= 3
        and length(word2) >= 3
        and (
          word1 like normalized_prefix || '%'
          or word2 like normalized_prefix || '%'
          or (length(prefix_pattern) >= 2 and (word1 like prefix_pattern || '%' or word2 like prefix_pattern || '%'))
        )
        and word1 !~ '[<>&-]'
        and word2 !~ '[<>&-]'
        and word1 not in ('szukam', 'oferuje', 'sprzedam', 'kupie', 'dla', 'the', 'and', 'lub', 'albo', 'oraz', 'bardzo', 'tanio', 'pilnie', 'przez')
        and word2 not in ('szukam', 'oferuje', 'sprzedam', 'kupie', 'dla', 'the', 'and', 'lub', 'albo', 'oraz', 'bardzo', 'tanio', 'pilnie', 'przez')

      union all

      -- 3-word phrases
      select
        word1 || ' ' || word2 || ' ' || word3 as phrase
      from (
        select
          words[i] as word1,
          words[i+1] as word2,
          words[i+2] as word3
        from (
          select string_to_array(lower(unaccent(strip_html_tags(title))), ' ') as words
          from posts
          where
            status = 'active'
            and (
              lower(unaccent(title)) like '%' || normalized_prefix || '%'
              or (length(prefix_pattern) >= 2 and lower(unaccent(title)) like '%' || prefix_pattern || '%')
            )
          limit 50
        ) t,
        generate_series(1, array_length(words, 1) - 2) as i
      ) triplets
      where
        length(word1) >= 3
        and length(word2) >= 2
        and length(word3) >= 3
        and (
          word1 like normalized_prefix || '%'
          or word2 like normalized_prefix || '%'
          or word3 like normalized_prefix || '%'
          or (length(prefix_pattern) >= 2 and (word1 like prefix_pattern || '%' or word2 like prefix_pattern || '%' or word3 like prefix_pattern || '%'))
        )
        and word1 !~ '[<>&-]'
        and word2 !~ '[<>&-]'
        and word3 !~ '[<>&-]'
        and word1 not in ('szukam', 'oferuje', 'sprzedam', 'kupie', 'dla', 'the', 'and', 'lub', 'albo', 'oraz')
        and word3 not in ('szukam', 'oferuje', 'sprzedam', 'kupie', 'dla', 'the', 'and', 'lub', 'albo', 'oraz')
    ) all_phrases
    where
      phrase like '%' || normalized_prefix || '%'
      or (length(prefix_pattern) >= 2 and phrase like '%' || prefix_pattern || '%')
      and length(phrase) >= 5
      and length(phrase) <= 40
  ),

  -- 3. POPULAR QUERIES from search history
  popular_queries as (
    select
      lower(query) as suggestion_text,
      case
        when lower(unaccent(query)) like normalized_prefix || '%' then 1000
        else 500
      end as priority
    from search_queries
    where
      lower(unaccent(query)) like '%' || normalized_prefix || '%'
      or (length(prefix_pattern) >= 2 and lower(unaccent(query)) like prefix_pattern || '%')
    group by lower(query)
    order by count(*) desc
    limit 5
  ),

  -- Combine all
  all_suggestions as (
    select suggestion_text, priority from category_matches
    union all
    select suggestion_text, priority from phrase_suggestions
    union all
    select suggestion_text, priority from popular_queries
  ),

  -- Deduplicate and rank
  ranked as (
    select
      suggestion_text,
      max(priority) as final_priority,
      count(*) as occurrence
    from all_suggestions
    where
      suggestion_text is not null
      and trim(suggestion_text) != ''
      and length(suggestion_text) >= 3
    group by suggestion_text
  )

  select
    suggestion_text as suggestion,
    (final_priority * occurrence)::bigint as match_count
  from ranked
  order by
    final_priority * occurrence desc,
    suggestion_text
  limit limit_count;

end;
$$ language plpgsql security definer;

grant execute on function get_autocomplete_suggestions(text, integer) to authenticated, anon;
