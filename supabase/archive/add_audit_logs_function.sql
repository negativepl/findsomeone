-- Function to get admin access logs (for audit panel)
-- This allows admins to view who accessed which messages and when
create or replace function get_admin_access_logs(
  p_limit int default 100,
  p_offset int default 0
)
returns table (
  log_id uuid,
  admin_id uuid,
  admin_name text,
  admin_email text,
  message_id uuid,
  message_content text,
  message_sender_name text,
  message_receiver_name text,
  report_id uuid,
  reason text,
  accessed_at timestamp with time zone
) as $$
begin
  -- Check if user is admin
  if not exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Access denied. Admin role required.';
  end if;

  return query
  select
    al.id as log_id,
    al.admin_id,
    pa.full_name as admin_name,
    pa.email as admin_email,
    al.message_id,
    m.content as message_content,
    ps.full_name as message_sender_name,
    pr.full_name as message_receiver_name,
    al.report_id,
    al.reason,
    al.accessed_at
  from admin_message_access_logs al
  join profiles pa on pa.id = al.admin_id
  join messages m on m.id = al.message_id
  join profiles ps on ps.id = m.sender_id
  join profiles pr on pr.id = m.receiver_id
  order by al.accessed_at desc
  limit p_limit
  offset p_offset;
end;
$$ language plpgsql security definer;

grant execute on function get_admin_access_logs(int, int) to authenticated;

-- Function to get audit logs for a specific user (GDPR compliance)
-- Users can request to see who accessed their messages
create or replace function get_user_audit_logs(p_user_id uuid)
returns table (
  log_id uuid,
  admin_name text,
  message_id uuid,
  message_preview text,
  reason text,
  accessed_at timestamp with time zone
) as $$
begin
  -- User can only see their own logs, or admin can see any user's logs
  if auth.uid() != p_user_id and not exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Access denied. You can only view your own audit logs.';
  end if;

  return query
  select
    al.id as log_id,
    pa.full_name as admin_name,
    al.message_id,
    left(m.content, 50) || '...' as message_preview,
    al.reason,
    al.accessed_at
  from admin_message_access_logs al
  join profiles pa on pa.id = al.admin_id
  join messages m on m.id = al.message_id
  where m.sender_id = p_user_id or m.receiver_id = p_user_id
  order by al.accessed_at desc;
end;
$$ language plpgsql security definer;

grant execute on function get_user_audit_logs(uuid) to authenticated;

-- Add comments for documentation
comment on function get_admin_access_logs is 'Returns audit trail of admin access to messages. Required for GDPR compliance and transparency.';
comment on function get_user_audit_logs is 'Allows users to see who accessed their messages (GDPR right to access). Admins can view any user audit logs.';

-- Function to cleanup old audit logs (GDPR requirement: keep for 2 years)
create or replace function cleanup_old_audit_logs()
returns table (
  deleted_count bigint,
  oldest_deleted timestamp with time zone
) as $$
declare
  v_deleted_count bigint;
  v_oldest_deleted timestamp with time zone;
begin
  -- Get oldest log that will be deleted
  select accessed_at into v_oldest_deleted
  from admin_message_access_logs
  where accessed_at < now() - interval '2 years'
  order by accessed_at asc
  limit 1;

  -- Delete logs older than 2 years
  with deleted as (
    delete from admin_message_access_logs
    where accessed_at < now() - interval '2 years'
    returning *
  )
  select count(*) into v_deleted_count from deleted;

  -- Return info about cleanup
  return query select v_deleted_count, v_oldest_deleted;

  -- Log the cleanup action
  raise notice 'Cleanup completed: Deleted % audit logs older than 2 years. Oldest deleted: %',
    v_deleted_count, v_oldest_deleted;
end;
$$ language plpgsql security definer;

grant execute on function cleanup_old_audit_logs() to postgres;

comment on function cleanup_old_audit_logs is 'Deletes audit logs older than 2 years (GDPR retention policy). Returns count of deleted records.';

-- Optional: Schedule automatic cleanup using pg_cron
-- Uncomment and run these lines in Supabase SQL Editor after enabling pg_cron extension:

/*
-- Enable pg_cron extension (run this once in Supabase dashboard)
-- Go to: Database -> Extensions -> Enable pg_cron

-- Schedule cleanup to run every Sunday at 2 AM
select cron.schedule(
  'cleanup-old-audit-logs',
  '0 2 * * 0',  -- Cron syntax: minute hour day month weekday
  $$select cleanup_old_audit_logs();$$
);

-- To view scheduled jobs:
-- select * from cron.job;

-- To unschedule (if needed):
-- select cron.unschedule('cleanup-old-audit-logs');
*/
