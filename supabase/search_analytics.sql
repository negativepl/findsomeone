-- Search queries tracking table
create table if not exists search_queries (
  id uuid default uuid_generate_v4() primary key,
  query text not null,
  user_id uuid references profiles(id) on delete set null,
  clicked_result text, -- what they clicked after search
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast lookups and aggregations
create index if not exists search_queries_query_idx on search_queries(query);
create index if not exists search_queries_created_at_idx on search_queries(created_at desc);
create index if not exists search_queries_user_id_idx on search_queries(user_id);

-- Enable RLS
alter table search_queries enable row level security;

-- Policy: Everyone can insert (to track searches)
create policy "Anyone can log searches"
  on search_queries for insert
  with check (true);

-- Policy: Only admins can view all searches (for analytics)
create policy "Admins can view all searches"
  on search_queries for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Function to get popular searches (last 7 days)
create or replace function get_popular_searches(days_back integer default 7, result_limit integer default 10)
returns table(query text, search_count bigint) as $$
begin
  return query
  select
    sq.query,
    count(*) as search_count
  from search_queries sq
  where
    sq.created_at >= now() - (days_back || ' days')::interval
    and length(trim(sq.query)) >= 2
  group by sq.query
  order by search_count desc, sq.query
  limit result_limit;
end;
$$ language plpgsql security definer;

-- Function to get trending searches (growing in popularity)
create or replace function get_trending_searches(result_limit integer default 10)
returns table(query text, search_count bigint, growth_rate numeric) as $$
begin
  return query
  with recent_searches as (
    select query, count(*) as recent_count
    from search_queries
    where created_at >= now() - interval '3 days'
    and length(trim(query)) >= 2
    group by query
  ),
  older_searches as (
    select query, count(*) as older_count
    from search_queries
    where created_at >= now() - interval '7 days'
    and created_at < now() - interval '3 days'
    and length(trim(query)) >= 2
    group by query
  )
  select
    r.query,
    r.recent_count as search_count,
    case
      when o.older_count is null or o.older_count = 0 then 999.0
      else (r.recent_count::numeric / o.older_count::numeric)
    end as growth_rate
  from recent_searches r
  left join older_searches o on r.query = o.query
  where r.recent_count >= 3
  order by growth_rate desc, search_count desc
  limit result_limit;
end;
$$ language plpgsql security definer;

-- Optional: Cleanup old search queries (keep only last 90 days for privacy)
create or replace function cleanup_old_searches()
returns void as $$
begin
  delete from search_queries
  where created_at < now() - interval '90 days';
end;
$$ language plpgsql security definer;

-- Optional: Schedule cleanup (run daily via pg_cron if available)
-- select cron.schedule('cleanup-old-searches', '0 2 * * *', 'select cleanup_old_searches()');
