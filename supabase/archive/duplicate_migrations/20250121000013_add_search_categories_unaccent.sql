-- Add missing search_categories_unaccent function
-- This function searches categories with Polish character normalization
-- Example: "prad" will find "Prąd" and "elektryka" will find "Elektryka"

create or replace function search_categories_unaccent(
  search_term text,
  limit_count integer default 5
)
returns table(id uuid, name text, slug text) as $$
declare
  normalized_term text;
begin
  -- Normalize search term (lowercase + remove accents)
  normalized_term := lower(unaccent(trim(search_term)));

  -- Return empty if search term is too short
  if length(normalized_term) < 1 then
    return;
  end if;

  return query
  select
    c.id,
    c.name,
    c.slug
  from categories c
  where
    -- Match against normalized category name
    lower(unaccent(c.name)) like '%' || normalized_term || '%'
  order by
    -- Prioritize exact matches first
    case
      when lower(unaccent(c.name)) = normalized_term then 1
      when lower(unaccent(c.name)) like normalized_term || '%' then 2
      else 3
    end,
    -- Then by popularity (if you have a posts_count column, use it)
    c.name
  limit limit_count;
end;
$$ language plpgsql security definer;

-- Grant execute permissions
grant execute on function search_categories_unaccent(text, integer) to authenticated, anon;

-- Add helpful comment
comment on function search_categories_unaccent is
  'Searches categories with unaccent support for Polish characters. Returns up to limit_count matching categories ordered by relevance.';
