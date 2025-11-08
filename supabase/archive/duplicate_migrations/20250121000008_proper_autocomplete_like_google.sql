-- PROPER AUTOCOMPLETE - Like Google/Allegro/OLX
-- Shows SEARCH QUERIES, not post titles!
-- Example: "opiekun" → ["opiekun psa", "opiekun kota", "Zwierzęta > Psy"]

drop function if exists get_autocomplete_suggestions(text, integer);

create or replace function get_autocomplete_suggestions(
  search_prefix text,
  limit_count integer default 10
)
returns table(suggestion text, match_count bigint) as $$
declare
  normalized_prefix text;
begin
  normalized_prefix := lower(unaccent(trim(search_prefix)));

  -- Return empty if too short
  if length(normalized_prefix) < 1 then
    return;
  end if;

  return query
  with
  -- 1. CATEGORIES with PATHS (ALWAYS SHOW - HIGHEST PRIORITY)
  category_matches as (
    select
      case
        when c.parent_id is not null then
          coalesce((select name from categories where id = c.parent_id), '') || ' > ' || c.name
        else
          c.name
      end as suggestion_text,
      10000 as priority
    from categories c
    where
      lower(unaccent(c.name)) like '%' || normalized_prefix || '%'
      or (
        c.parent_id is not null
        and exists (
          select 1 from categories parent
          where parent.id = c.parent_id
          and lower(unaccent(parent.name)) like '%' || normalized_prefix || '%'
        )
      )

    union all

    -- Category synonyms
    select
      case
        when c.parent_id is not null then
          coalesce((select name from categories where id = c.parent_id), '') || ' > ' || c.name
        else
          c.name
      end as suggestion_text,
      10000 as priority
    from categories c
    join category_synonyms cs on cs.category_id = c.id
    where
      lower(unaccent(cs.synonym)) like '%' || normalized_prefix || '%'
  ),

  -- 2. SEARCH QUERIES from search_queries table (what people actually searched for)
  popular_queries as (
    select
      lower(query) as suggestion_text,
      1000 as priority
    from search_queries
    where
      lower(unaccent(query)) like '%' || normalized_prefix || '%'
    group by lower(query)
    order by count(*) desc
    limit 10
  ),

  -- 3. EXTRACT COMMON PHRASES from post titles (but SHORT phrases, not full titles!)
  -- Convert "Szukam opiekuna dla psa w Warszawie" → "opiekun psa"
  title_phrases as (
    select distinct
      lower(unaccent(phrase)) as suggestion_text,
      100 as priority
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
            and lower(unaccent(title)) like '%' || normalized_prefix || '%'
          limit 100
        ) t,
        generate_series(1, array_length(words, 1) - 1) as i
      ) pairs
      where
        length(word1) >= 3
        and length(word2) >= 3
        and (word1 like normalized_prefix || '%' or word2 like normalized_prefix || '%')
        and word1 !~ '[<>&-]'
        and word2 !~ '[<>&-]'
        -- Exclude common filler words
        and word1 not in ('szukam', 'oferuje', 'sprzedam', 'kupie', 'dla', 'the', 'and', 'lub', 'albo', 'oraz', 'bardzo', 'tanio', 'pilnie')
        and word2 not in ('szukam', 'oferuje', 'sprzedam', 'kupie', 'dla', 'the', 'and', 'lub', 'albo', 'oraz', 'bardzo', 'tanio', 'pilnie')

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
            and lower(unaccent(title)) like '%' || normalized_prefix || '%'
          limit 50
        ) t,
        generate_series(1, array_length(words, 1) - 2) as i
      ) triplets
      where
        length(word1) >= 3
        and length(word2) >= 2
        and length(word3) >= 3
        and (word1 like normalized_prefix || '%' or word2 like normalized_prefix || '%' or word3 like normalized_prefix || '%')
        and word1 !~ '[<>&-]'
        and word2 !~ '[<>&-]'
        and word3 !~ '[<>&-]'
        and word1 not in ('szukam', 'oferuje', 'sprzedam', 'kupie', 'dla', 'the', 'and', 'lub', 'albo', 'oraz', 'bardzo', 'tanio', 'pilnie')
        and word3 not in ('szukam', 'oferuje', 'sprzedam', 'kupie', 'dla', 'the', 'and', 'lub', 'albo', 'oraz', 'bardzo', 'tanio', 'pilnie')
    ) all_phrases
    where
      phrase like '%' || normalized_prefix || '%'
      and length(phrase) >= 5
      and length(phrase) <= 40
  ),

  -- Combine all
  all_suggestions as (
    select suggestion_text, priority from category_matches
    union all
    select suggestion_text, priority from popular_queries
    union all
    select suggestion_text, priority from title_phrases
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
      and length(suggestion_text) >= 2
      and suggestion_text like '%' || normalized_prefix || '%'
    group by suggestion_text
  )

  select
    suggestion_text as suggestion,
    (final_priority * occurrence)::bigint as match_count
  from ranked
  order by
    -- Categories first
    case when final_priority >= 10000 then 0 else 1 end,
    -- Then by score
    final_priority * occurrence desc,
    -- Then alphabetically
    suggestion_text
  limit limit_count;

end;
$$ language plpgsql security definer;

grant execute on function get_autocomplete_suggestions(text, integer) to authenticated, anon;
