-- Enhanced user search history for personalized smart suggestions
-- This tracks individual user behavior for AI-powered recommendations

-- Extend search_queries table with user preferences and context
alter table search_queries
  add column if not exists result_count integer,
  add column if not exists clicked_post_id uuid references posts(id) on delete set null,
  add column if not exists interaction_type text check (interaction_type in ('click', 'favorite', 'contact', 'view')),
  add column if not exists query_embedding vector(1536),
  add column if not exists session_id text;

-- Create index for user search history queries
create index if not exists search_queries_user_created_idx on search_queries(user_id, created_at desc);
create index if not exists search_queries_embedding_idx on search_queries using hnsw (query_embedding vector_cosine_ops);

-- Table for user preferences learned from behavior
create table if not exists user_search_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,

  -- Learned preferences
  preferred_categories text[], -- Categories user searches most
  preferred_cities text[], -- Cities user searches most
  preferred_type text, -- 'seeking' or 'offering' - what they search most

  -- Price preferences
  avg_price_range_min numeric,
  avg_price_range_max numeric,

  -- Behavioral signals
  search_frequency integer default 0, -- Total searches
  last_search_at timestamptz,
  favorite_search_times integer[], -- Hour of day they search most (0-23)

  -- Semantic preferences (from embeddings)
  preference_embedding vector(1536), -- Average of their search embeddings

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(user_id)
);

-- Indexes for fast lookups
create index if not exists user_search_preferences_user_id_idx on user_search_preferences(user_id);
create index if not exists user_search_preferences_embedding_idx on user_search_preferences using hnsw (preference_embedding vector_cosine_ops);

-- RLS policies
alter table user_search_preferences enable row level security;

create policy "Users can view their own preferences"
  on user_search_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on user_search_preferences for update
  using (auth.uid() = user_id);

create policy "System can insert preferences"
  on user_search_preferences for insert
  with check (true);

-- Function to update user preferences based on search history
create or replace function update_user_search_preferences(target_user_id uuid)
returns void as $$
declare
  recent_searches record;
  category_counts jsonb;
  city_counts jsonb;
  type_counts jsonb;
  avg_embedding vector(1536);
begin
  -- Analyze last 90 days of searches
  select
    -- Most searched categories
    jsonb_object_agg(
      c.name,
      count(*)
    ) filter (where c.name is not null) as categories,

    -- Most searched cities
    jsonb_object_agg(
      sq.query,
      count(*)
    ) filter (where sq.query ~* '(warszawa|kraków|wrocław|poznań|gdańsk)') as cities,

    -- Type preference
    jsonb_object_agg(
      p.type,
      count(*)
    ) filter (where p.type is not null) as types,

    -- Average embedding of searches
    avg(sq.query_embedding) filter (where sq.query_embedding is not null) as avg_emb

  into recent_searches
  from search_queries sq
  left join posts p on p.id = sq.clicked_post_id
  left join categories c on c.id = p.category_id
  where
    sq.user_id = target_user_id
    and sq.created_at > now() - interval '90 days'
  group by sq.user_id;

  -- Insert or update preferences
  insert into user_search_preferences (
    user_id,
    preferred_categories,
    preferred_cities,
    preference_embedding,
    search_frequency,
    last_search_at,
    updated_at
  )
  select
    target_user_id,
    array(select jsonb_object_keys(recent_searches.categories)) as preferred_categories,
    array(select jsonb_object_keys(recent_searches.cities)) as preferred_cities,
    recent_searches.avg_emb,
    (select count(*) from search_queries where user_id = target_user_id),
    (select max(created_at) from search_queries where user_id = target_user_id),
    now()
  on conflict (user_id)
  do update set
    preferred_categories = excluded.preferred_categories,
    preferred_cities = excluded.preferred_cities,
    preference_embedding = excluded.preference_embedding,
    search_frequency = excluded.search_frequency,
    last_search_at = excluded.last_search_at,
    updated_at = now();

exception
  when others then
    -- Silently fail to avoid disrupting user experience
    raise notice 'Failed to update user preferences: %', sqlerrm;
end;
$$ language plpgsql security definer;

-- Function to get personalized suggestions for a user
create or replace function get_smart_suggestions(
  target_user_id uuid,
  limit_count integer default 10
)
returns table(
  suggestion_text text,
  suggestion_type text, -- 'behavioral', 'semantic', 'trending'
  relevance_score float
) as $$
begin
  return query
  with behavioral_suggestions as (
    -- 1. Suggestions based on user's search history (behavioral)
    select distinct
      sq.query as suggestion_text,
      'behavioral'::text as suggestion_type,
      (count(*) / greatest((select count(*) from search_queries where user_id = target_user_id), 1)::float * 100)::float as relevance_score
    from search_queries sq
    where
      sq.user_id = target_user_id
      and sq.created_at > now() - interval '90 days'
      and length(sq.query) >= 3
    group by sq.query
    having count(*) >= 2
    order by count(*) desc
    limit 5
  ),
  semantic_suggestions as (
    -- 2. Semantic suggestions based on user's preference embedding
    select
      p.title as suggestion_text,
      'semantic'::text as suggestion_type,
      ((1 - (p.embedding <=> up.preference_embedding)) * 100)::float as relevance_score
    from user_search_preferences up
    cross join posts p
    where
      up.user_id = target_user_id
      and up.preference_embedding is not null
      and p.embedding is not null
      and p.status = 'active'
      and (1 - (p.embedding <=> up.preference_embedding)) > 0.75
    order by p.embedding <=> up.preference_embedding
    limit 5
  ),
  trending_suggestions as (
    -- 3. Trending searches in user's preferred categories
    select
      sq.query as suggestion_text,
      'trending'::text as suggestion_type,
      50.0::float as relevance_score
    from search_queries sq
    join posts p on p.id = sq.clicked_post_id
    join categories c on c.id = p.category_id
    where
      c.name = any(
        select unnest(preferred_categories)
        from user_search_preferences
        where user_id = target_user_id
      )
      and sq.created_at > now() - interval '7 days'
      and length(sq.query) >= 3
    group by sq.query
    order by count(*) desc
    limit 5
  )
  select * from behavioral_suggestions
  union all
  select * from semantic_suggestions
  union all
  select * from trending_suggestions
  order by relevance_score desc
  limit limit_count;
end;
$$ language plpgsql security definer;

-- Grant permissions
grant execute on function update_user_search_preferences(uuid) to authenticated;
grant execute on function get_smart_suggestions(uuid, integer) to authenticated, anon;

-- Trigger to auto-update preferences after searches (async via pg_cron or manual)
-- This would be called periodically or after significant user activity

comment on table user_search_preferences is 'ML-powered user preferences learned from search behavior';
comment on function get_smart_suggestions is 'Returns personalized search suggestions based on user history and AI embeddings';
