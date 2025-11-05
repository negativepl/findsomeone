-- Add category paths to autocomplete (like OLX: "Zwierzęta > Psy")
-- Shows full category hierarchy for better UX

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

  -- Return empty if prefix too short
  if length(normalized_prefix) < 2 then
    return;
  end if;

  return query
  with
  -- 1. CATEGORIES with FULL PATH (Parent > Child)
  category_suggestions as (
    select
      -- Build category path like "Zwierzęta > Psy"
      case
        when c.parent_id is not null then
          (select parent.name from categories parent where parent.id = c.parent_id) || ' > ' || c.name
        else
          c.name
      end as suggestion_text,
      1000 as priority,
      1 as occurrence
    from categories c
    where
      lower(unaccent(c.name)) like '%' || normalized_prefix || '%'
      or (
        -- Also match parent category name
        c.parent_id is not null
        and exists (
          select 1 from categories parent
          where parent.id = c.parent_id
          and lower(unaccent(parent.name)) like '%' || normalized_prefix || '%'
        )
      )

    union all

    -- Category synonyms with path
    select
      case
        when c.parent_id is not null then
          (select parent.name from categories parent where parent.id = c.parent_id) || ' > ' || c.name
        else
          c.name
      end as suggestion_text,
      1000 as priority,
      1 as occurrence
    from categories c
    join category_synonyms cs on cs.category_id = c.id
    where
      lower(unaccent(cs.synonym)) like '%' || normalized_prefix || '%'
  ),

  -- 2. FULL POST TITLES that match (show actual titles from posts)
  title_suggestions as (
    select
      strip_html_tags(p.title) as suggestion_text,
      100 as priority,
      1 as occurrence
    from posts p
    where
      p.status = 'active'
      and lower(unaccent(p.title)) like '%' || normalized_prefix || '%'
      and length(p.title) <= 80  -- Only reasonably short titles
    order by p.created_at desc
    limit 20
  ),

  -- 3. COMMON WORDS from titles (fallback)
  word_suggestions as (
    select
      word as suggestion_text,
      10 as priority,
      count(*) as occurrence
    from (
      select unnest(string_to_array(lower(unaccent(strip_html_tags(p.title))), ' ')) as word
      from posts p
      where
        p.status = 'active'
        and lower(unaccent(p.title)) like '%' || normalized_prefix || '%'
      limit 50
    ) words
    where
      length(word) >= 3
      and word like normalized_prefix || '%'
      and word !~ '[<>&-]'
    group by word
  ),

  -- Combine all
  all_suggestions as (
    select * from category_suggestions
    union all
    select * from title_suggestions
    union all
    select * from word_suggestions
  ),

  -- Deduplicate and score
  scored as (
    select
      suggestion_text,
      max(priority) * sum(occurrence) as score
    from all_suggestions
    where
      suggestion_text is not null
      and trim(suggestion_text) != ''
      and length(suggestion_text) >= 3
    group by suggestion_text
  )

  select
    suggestion_text as suggestion,
    score::bigint as match_count
  from scored
  order by
    score desc,
    suggestion_text
  limit limit_count;

end;
$$ language plpgsql security definer;

grant execute on function get_autocomplete_suggestions(text, integer) to authenticated, anon;
