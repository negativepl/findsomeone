-- Fix autocomplete suggestions to only use titles, not descriptions
-- This prevents junk suggestions like "w przeprowadzkach -"

create or replace function get_autocomplete_suggestions(
  search_prefix text,
  limit_count integer default 10
)
returns table(suggestion text, match_count bigint) as $$
begin
  return query
  -- Extract common phrases from titles ONLY (not descriptions) to avoid junk
  with matching_posts as (
    select
      strip_html_tags(title) as clean_title,
      ts_rank(search_vector, websearch_to_tsquery('simple', search_prefix)) as rank
    from posts
    where
      status = 'active'
      and title ilike '%' || search_prefix || '%'
    order by rank desc
    limit 50
  ),
  -- Extract words from titles only
  phrases as (
    select
      unnest(string_to_array(lower(clean_title), ' ')) as word
    from matching_posts
    where clean_title is not null
  ),
  -- Filter relevant words (remove empty, short, and HTML artifacts)
  relevant_words as (
    select trim(word) as clean_word
    from phrases
    where
      trim(word) != ''
      and length(trim(word)) >= 3
      and trim(word) like lower(search_prefix) || '%'
      and trim(word) !~ '[<>]'  -- No angle brackets
      and trim(word) !~ '^&'     -- No HTML entities
      and trim(word) !~ '^-'     -- No leading dash
      and trim(word) !~ '-$'     -- No trailing dash
  )
  select
    clean_word as suggestion,
    count(*) as match_count
  from relevant_words
  group by clean_word
  order by match_count desc, clean_word
  limit limit_count;
end;
$$ language plpgsql security definer;
