-- FIX ALL 3 AUTOCOMPLETE PROBLEMS:
-- 1. Sortowanie - kategorie zaczynające się od tekstu NA GÓRZE
-- 2. Odmiana słów - pies/psy, hydraulik/hydrauliczne
-- 3. Ścieżki kategorii - WSZYSTKIE podkategorie z Parent > Child

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

  -- Return empty if too short
  if length(normalized_prefix) < 1 then
    return;
  end if;

  -- Create pattern for stemming (e.g., "pies" -> "ps%", "hydraul" -> "hydraul%")
  -- Remove common endings: -a, -e, -i, -y, -ę, -ą, -em, -ie, -ek, -ka, -ki
  prefix_pattern := regexp_replace(
    normalized_prefix,
    '(a|e|i|y|ę|ą|em|ie|ek|ka|ki|ik|icz|ycz)$',
    '',
    'g'
  );

  return query
  with
  -- 1. CATEGORIES with FULL PATHS (ALWAYS TOP PRIORITY)
  category_matches as (
    select
      -- Build category path: "Parent > Child" for subcategories
      case
        when c.parent_id is not null then
          coalesce((select name from categories where id = c.parent_id), '') || ' > ' || c.name
        else
          c.name
      end as suggestion_text,
      -- PRIORITY: exact match at start > contains > stemmed match
      case
        when lower(unaccent(c.name)) like normalized_prefix || '%' then 100000  -- Exact start
        when lower(unaccent(c.name)) like '%' || normalized_prefix || '%' then 10000  -- Contains
        when lower(unaccent(c.name)) like prefix_pattern || '%' then 5000  -- Stemmed match
        else 1000
      end as priority
    from categories c
    where
      -- Match exact prefix
      lower(unaccent(c.name)) like '%' || normalized_prefix || '%'
      or
      -- Match stemmed (pies->ps matches psy)
      (length(prefix_pattern) >= 2 and lower(unaccent(c.name)) like prefix_pattern || '%')
      or
      -- Match parent category name
      (
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

    -- Category synonyms with paths
    select
      case
        when c.parent_id is not null then
          coalesce((select name from categories where id = c.parent_id), '') || ' > ' || c.name
        else
          c.name
      end as suggestion_text,
      case
        when lower(unaccent(cs.synonym)) like normalized_prefix || '%' then 100000
        when lower(unaccent(cs.synonym)) like '%' || normalized_prefix || '%' then 10000
        else 5000
      end as priority
    from categories c
    join category_synonyms cs on cs.category_id = c.id
    where
      lower(unaccent(cs.synonym)) like '%' || normalized_prefix || '%'
      or (length(prefix_pattern) >= 2 and lower(unaccent(cs.synonym)) like prefix_pattern || '%')
  ),

  -- 2. SEARCH QUERIES from search_queries table
  popular_queries as (
    select
      lower(query) as suggestion_text,
      case
        when lower(unaccent(query)) like normalized_prefix || '%' then 2000
        else 1000
      end as priority
    from search_queries
    where
      lower(unaccent(query)) like '%' || normalized_prefix || '%'
      or (length(prefix_pattern) >= 2 and lower(unaccent(query)) like prefix_pattern || '%')
    group by lower(query)
    order by count(*) desc
    limit 10
  ),

  -- 3. EXTRACT SHORT PHRASES from post titles
  title_phrases as (
    select distinct
      lower(unaccent(phrase)) as suggestion_text,
      case
        when phrase like normalized_prefix || '%' then 200
        else 100
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
        and word1 not in ('szukam', 'oferuje', 'sprzedam', 'kupie', 'dla', 'the', 'and', 'lub', 'albo', 'oraz', 'bardzo', 'tanio', 'pilnie')
        and word3 not in ('szukam', 'oferuje', 'sprzedam', 'kupie', 'dla', 'the', 'and', 'lub', 'albo', 'oraz', 'bardzo', 'tanio', 'pilnie')
    ) all_phrases
    where
      phrase like '%' || normalized_prefix || '%'
      or (length(prefix_pattern) >= 2 and phrase like '%' || prefix_pattern || '%')
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
    group by suggestion_text
  )

  select
    suggestion_text as suggestion,
    (final_priority * occurrence)::bigint as match_count
  from ranked
  order by
    -- Sort by priority (exact matches first)
    final_priority * occurrence desc,
    -- Then alphabetically
    suggestion_text
  limit limit_count;

end;
$$ language plpgsql security definer;

grant execute on function get_autocomplete_suggestions(text, integer) to authenticated, anon;
