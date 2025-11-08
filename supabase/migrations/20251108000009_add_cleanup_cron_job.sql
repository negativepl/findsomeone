-- Enable pg_cron extension if not already enabled
create extension if not exists pg_cron;

-- Create a function to clean up old activity logs
create or replace function cleanup_old_activity_logs()
returns void
language plpgsql
security definer
as $$
begin
  delete from activity_logs
  where created_at < now() - interval '30 days';
end;
$$;

-- Schedule the cleanup job to run daily at midnight (UTC)
select cron.schedule(
  'cleanup-old-activity-logs',
  '0 0 * * *', -- Every day at midnight
  $$select cleanup_old_activity_logs()$$
);

-- Grant execute permission on the function to postgres role
grant execute on function cleanup_old_activity_logs() to postgres;

-- Comment for documentation
comment on function cleanup_old_activity_logs() is 'Deletes activity_logs older than 30 days. Runs daily at midnight via pg_cron.';
