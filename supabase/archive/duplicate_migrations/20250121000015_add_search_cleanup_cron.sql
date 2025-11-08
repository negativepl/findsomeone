-- Automatic cleanup of old search queries (90-day retention for privacy/GDPR)
-- This prevents the search_queries table from growing infinitely

-- Enable pg_cron extension if available (Supabase Pro)
-- If not available, you can run cleanup_old_searches() manually or via a scheduled job

-- Drop existing function first (it exists in search_analytics.sql with different return type)
drop function if exists cleanup_old_searches();

-- Create improved cleanup function with return value
create or replace function cleanup_old_searches()
returns table(deleted_count bigint) as $$
declare
  rows_deleted bigint;
begin
  -- Delete search queries older than 90 days
  delete from search_queries
  where created_at < now() - interval '90 days';

  -- Get count of deleted rows
  get diagnostics rows_deleted = row_count;

  return query select rows_deleted;
end;
$$ language plpgsql security definer;

-- Grant execute to authenticated users (admins can run manually)
grant execute on function cleanup_old_searches() to authenticated;

-- Add helpful comment
comment on function cleanup_old_searches is
  'Deletes search queries older than 90 days for privacy compliance. Returns count of deleted rows.';

-- NOTE: To enable automatic cleanup, you need pg_cron extension (Supabase Pro)
-- Run this command in SQL Editor to schedule daily cleanup at 2 AM:
--
-- SELECT cron.schedule(
--   'cleanup-old-search-queries',
--   '0 2 * * *',
--   'SELECT cleanup_old_searches()'
-- );

-- For non-Pro plans, create an Edge Function that calls this and schedule it via GitHub Actions
-- or run it manually once a month via SQL Editor:
-- SELECT cleanup_old_searches();

-- Create a view to monitor search_queries table size
create or replace view search_queries_stats as
select
  count(*) as total_queries,
  count(distinct query) as unique_queries,
  count(distinct user_id) as unique_users,
  min(created_at) as oldest_query,
  max(created_at) as newest_query,
  pg_size_pretty(pg_total_relation_size('search_queries')) as table_size,
  count(*) filter (where created_at > now() - interval '7 days') as queries_last_7_days,
  count(*) filter (where created_at > now() - interval '30 days') as queries_last_30_days,
  count(*) filter (where created_at < now() - interval '90 days') as queries_older_than_90_days
from search_queries;

-- Grant access to view
grant select on search_queries_stats to authenticated;

comment on view search_queries_stats is
  'Statistics about search queries table including size, counts, and cleanup recommendations.';
