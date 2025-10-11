-- Flexible synonym system - add as many as you want!
-- No hardcoding - all in database

create table if not exists search_synonyms (
  id uuid default uuid_generate_v4() primary key,
  term text not null,
  synonym text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast lookups
create index if not exists search_synonyms_term_idx on search_synonyms(lower(term));
create index if not exists search_synonyms_synonym_idx on search_synonyms(lower(synonym));

-- Enable RLS
alter table search_synonyms enable row level security;

-- Everyone can read synonyms
create policy "Synonyms are viewable by everyone"
  on search_synonyms for select
  using (true);

-- Only admins can manage synonyms
create policy "Only admins can manage synonyms"
  on search_synonyms for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Function to expand query with synonyms (FLEXIBLE!)
create or replace function expand_search_with_synonyms(search_query text)
returns text as $$
declare
  expanded_query text;
  synonym_record record;
begin
  -- Start with original query
  expanded_query := search_query;

  -- Add all matching synonyms
  for synonym_record in
    select distinct synonym
    from search_synonyms
    where lower(term) = any(string_to_array(lower(search_query), ' '))
  loop
    expanded_query := expanded_query || ' ' || synonym_record.synonym;
  end loop;

  -- Also check reverse (if searching for synonym, add main term)
  for synonym_record in
    select distinct term
    from search_synonyms
    where lower(synonym) = any(string_to_array(lower(search_query), ' '))
  loop
    expanded_query := expanded_query || ' ' || synonym_record.term;
  end loop;

  return expanded_query;
end;
$$ language plpgsql security definer;

-- OPTIONAL: Insert some starter synonyms
-- You can delete these and manage everything through Admin Panel (/admin/synonyms)
-- Or keep them as examples and add more!

insert into search_synonyms (term, synonym) values
  -- Professions variants (OPTIONAL - can be deleted!)
  ('hydraulik', 'instalator'),
  ('elektryk', 'elektromonter'),
  ('sprzątaczka', 'pomoc domowa'),

  -- Services variants (OPTIONAL - can be deleted!)
  ('sprzątanie', 'czyszczenie'),
  ('transport', 'przeprowadzka'),
  ('naprawa', 'remont'),

  -- Common terms (OPTIONAL - can be deleted!)
  ('szukam', 'poszukuję'),
  ('oferuję', 'świadczę'),
  ('pilnie', 'natychmiast')
on conflict do nothing;

-- NOTE: To manage synonyms through UI, go to /admin/synonyms
-- You can add/delete synonyms there without touching code!

-- Grant execute permission
grant execute on function expand_search_with_synonyms(text) to authenticated, anon;
